import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { savePending, getPending, deletePending } from './db.js';
import { hashPassword, verifyPassword, randomPassword } from './password.js';
import { serializeUser, serializeListing, serializeComment } from './serialize.js';
import { getUserFromRequest, requireAuth, requireSuperuser, signToken } from './middleware.js';
import { parseMultipart, saveUploadedFile } from './multipart.js';
import { sendOtpEmail, sendSmsOtp, sendForgotPasswordOtp, sendNewPasswordEmail } from './mail.js';
import { sendJson } from './respond.js';
import { getSessionId } from './session.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEDIA_ROOT = path.join(__dirname, '..', '..', 'media');
const IMAGES_DIR = path.join(MEDIA_ROOT, 'images');

const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

async function listingRows(where = '', params = []) {
  return db.prepare(`SELECT * FROM auctions_listing ${where} ORDER BY id DESC`).all(...params);
}

async function mapListings(rows, userId) {
  return Promise.all(rows.map((r) => serializeListing(r, userId)));
}

export function getSession(req, res, sessions) {
  const cookies = Object.fromEntries(
    (req.headers.cookie || '').split(';').map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    }).filter(([k]) => k),
  );
  let sid = cookies.bidbazaar_sid;
  if (!sid || !sessions.has(sid)) {
    sid = crypto.randomUUID();
    sessions.set(sid, {});
    res.setHeader('Set-Cookie', `bidbazaar_sid=${sid}; Path=/; HttpOnly; SameSite=Lax`);
  }
  return sessions.get(sid);
}

async function readBody(req) {
  const ct = req.headers['content-type'] || '';
  if (ct.includes('multipart/form-data')) {
    const { fields, file } = await parseMultipart(req);
    return { fields, file, isMultipart: true };
  }
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return { fields: {}, file: null, isMultipart: false };
  if (ct.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(raw);
    const fields = Object.fromEntries(params.entries());
    return { fields, file: null, isMultipart: false };
  }
  try {
    return { fields: JSON.parse(raw), file: null, isMultipart: false };
  } catch {
    return { fields: {}, file: null, isMultipart: false };
  }
}

export async function handleApi(req, res, pathname) {
  const method = req.method;
  const user = await getUserFromRequest(req);
  req.user = user;

  // Listings
  if (method === 'GET' && pathname === '/api/listings/') {
    return json(res, await mapListings(await listingRows('WHERE auction_active = true'), user?.id));
  }
  if (method === 'GET' && pathname === '/api/listings/mine/') {
    if (!await requireAuth(req, res)) return;
    return json(res, await mapListings(await listingRows('WHERE user_id = $1', [req.user.id]), req.user.id));
  }
  if (method === 'GET' && pathname === '/api/listings/won/') {
    if (!await requireAuth(req, res)) return;
    return json(res, await mapListings(await listingRows('WHERE winner_id = $1', [req.user.id]), req.user.id));
  }
  if (method === 'GET' && pathname === '/api/listings/watch/') {
    if (!await requireAuth(req, res)) return;
    const ids = (await db.prepare('SELECT listing_id FROM auctions_watch WHERE user_id = $1').all(req.user.id)).map((r) => r.listing_id);
    if (!ids.length) return json(res, []);
    const ph = ids.map((_, i) => `$${i + 1}`).join(',');
    return json(res, await mapListings(await db.prepare(`SELECT * FROM auctions_listing WHERE id IN (${ph})`).all(...ids), req.user.id));
  }
  if (method === 'GET' && pathname === '/api/categories/') {
    const rows = await db.prepare('SELECT DISTINCT category FROM auctions_listing ORDER BY category').all();
    return json(res, rows.map((r) => r.category));
  }

  const listingMatch = pathname.match(/^\/api\/listings\/(\d+)\/$/);
  if (method === 'GET' && listingMatch) {
    const listing = await db.prepare('SELECT * FROM auctions_listing WHERE id = $1').get(listingMatch[1]);
    if (!listing) return json(res, { error: 'Not found' }, 404);
    const comments = await db.prepare('SELECT * FROM auctions_comment WHERE listing_id = $1 ORDER BY id').all(listing.id);
    return json(res, { ...await serializeListing(listing, user?.id), comments: await Promise.all(comments.map(serializeComment)) });
  }

  if (method === 'POST' && pathname === '/api/listings/create/') {
    if (!await requireAuth(req, res)) return;
    const body = await readBody(req);
    const f = body.fields;
    const { title, category, description, starting_value } = f;
    if (!title || !category || !description || starting_value == null) return json(res, { error: 'Missing required fields' }, 400);
    const image = body.file ? saveUploadedFile(body.file, IMAGES_DIR) : null;
    const now = new Date().toISOString();
    const result = await db.prepare(`
      INSERT INTO auctions_listing (title, category, description, user_id, image, starting_value, auction_active, winner_id, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,true,NULL,$7) RETURNING id
    `).run(title, category, description, req.user.id, image, starting_value, now);
    const listing = await db.prepare('SELECT * FROM auctions_listing WHERE id = $1').get(result.lastInsertRowid);
    return json(res, await serializeListing(listing, req.user.id), 201);
  }

  const bidMatch = pathname.match(/^\/api\/listings\/(\d+)\/bid\/$/);
  if (method === 'POST' && bidMatch) {
    if (!await requireAuth(req, res)) return;
    const body = await readBody(req);
    const listingId = Number(bidMatch[1]);
    const value = parseFloat(body.fields.value);
    if (Number.isNaN(value)) return json(res, { error: 'Invalid bid amount' }, 400);
    const maxBid = await db.prepare('SELECT MAX(value) as v FROM auctions_bid WHERE listing_id = $1').get(listingId);
    const listing = await db.prepare('SELECT starting_value FROM auctions_listing WHERE id = $1').get(listingId);
    if (!listing) return json(res, { error: 'Not found' }, 404);
    const current = maxBid?.v != null ? Number(maxBid.v) : Number(listing.starting_value);
    if (value <= current) return json(res, { error: 'Your bid was too low' }, 400);
    const now = new Date().toISOString();
    await db.prepare('INSERT INTO auctions_bid (listing_id, user_id, value, created_at) VALUES ($1,$2,$3,$4)').run(listingId, req.user.id, value, now);
    const row = await db.prepare('SELECT * FROM auctions_listing WHERE id = $1').get(listingId);
    return json(res, await serializeListing(row, req.user.id));
  }

  const watchMatch = pathname.match(/^\/api\/listings\/(\d+)\/watch\/$/);
  if (method === 'POST' && watchMatch) {
    if (!await requireAuth(req, res)) return;
    const listingId = Number(watchMatch[1]);
    const existing = await db.prepare('SELECT id FROM auctions_watch WHERE user_id = $1 AND listing_id = $2').get(req.user.id, listingId);
    if (existing) {
      await db.prepare('DELETE FROM auctions_watch WHERE id = $1').run(existing.id);
      return json(res, { watched: false });
    }
    await db.prepare('INSERT INTO auctions_watch (user_id, listing_id) VALUES ($1,$2)').run(req.user.id, listingId);
    return json(res, { watched: true });
  }

  const closeMatch = pathname.match(/^\/api\/listings\/(\d+)\/close\/$/);
  if (method === 'POST' && closeMatch) {
    if (!await requireAuth(req, res)) return;
    const listingId = Number(closeMatch[1]);
    const listing = await db.prepare('SELECT * FROM auctions_listing WHERE id = $1').get(listingId);
    if (!listing) return json(res, { error: 'Not found' }, 404);
    if (Number(listing.user_id) !== Number(req.user.id)) return json(res, { error: 'Not authorized' }, 403);
    const topBid = await db.prepare('SELECT user_id FROM auctions_bid WHERE listing_id = $1 ORDER BY value DESC, id DESC LIMIT 1').get(listingId);
    await db.prepare('UPDATE auctions_listing SET auction_active = false, winner_id = $1 WHERE id = $2').run(topBid?.user_id || null, listingId);
    const updated = await db.prepare('SELECT * FROM auctions_listing WHERE id = $1').get(listingId);
    return json(res, await serializeListing(updated, req.user.id));
  }

  const commentMatch = pathname.match(/^\/api\/listings\/(\d+)\/comments\/$/);
  if (method === 'POST' && commentMatch) {
    if (!await requireAuth(req, res)) return;
    const body = await readBody(req);
    const text = (body.fields.comment || '').trim();
    if (!text) return json(res, { error: 'Comment required' }, 400);
    const now = new Date().toISOString();
    const result = await db.prepare('INSERT INTO auctions_comment (user_id, listing_id, comment, created_at) VALUES ($1,$2,$3,$4) RETURNING id').run(
      req.user.id, Number(commentMatch[1]), text, now,
    );
    const comment = await db.prepare('SELECT * FROM auctions_comment WHERE id = $1').get(result.lastInsertRowid);
    return json(res, await serializeComment(comment), 201);
  }

  const catMatch = pathname.match(/^\/api\/categories\/(.+)\/$/);
  if (method === 'GET' && catMatch) {
    const category = decodeURIComponent(catMatch[1]);
    const active = await listingRows('WHERE category = $1 AND auction_active = true', [category]);
    const inactive = await listingRows('WHERE category = $1 AND auction_active = false', [category]);
    return json(res, { category, active_listings: await mapListings(active, user?.id), inactive_listings: await mapListings(inactive, user?.id) });
  }

  // Auth
  if (method === 'GET' && pathname === '/api/auth/me/') {
    if (!user) return json(res, { authenticated: false });
    return json(res, serializeUser(user));
  }
  if (method === 'POST' && pathname === '/api/auth/login/') {
    const body = await readBody(req);
    const u = await db.prepare('SELECT * FROM auctions_user WHERE username = $1').get(body.fields.username);
    if (!u || !verifyPassword(body.fields.password, u.password)) {
      return json(res, { error: 'Invalid username and/or password.' }, 401);
    }
    const data = { ...serializeUser(u), token: signToken({ id: u.id, username: u.username, is_superuser: Boolean(u.is_superuser) }) };
    if (u.is_superuser) data.redirect = '/admin/control-panel/dashboard';
    return json(res, data);
  }
  if (method === 'POST' && pathname === '/api/auth/logout/') {
    return json(res, { success: true });
  }
  if (method === 'POST' && pathname === '/api/auth/register/') {
    const body = await readBody(req);
    const { username, email, phone, password, confirmation } = body.fields;
    if (password !== confirmation) return json(res, { error: 'Passwords do not match' }, 400);
    if (await db.prepare('SELECT id FROM auctions_user WHERE username = $1').get(username)) {
      return json(res, { error: 'Username already taken' }, 400);
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    const sid = getSessionId(req, res, true); // always fresh session
    await savePending(sid, { kind: 'register', otp, username, email, phone: phone || null, password });
    console.log(`[OTP] ${username} <${email || phone}>: ${otp}`);
    try { await sendOtpEmail({ to: email, username, otp }); } catch (err) { console.error('[Mail]', err.message); }
    try { await sendSmsOtp({ phone, otp }); } catch (err) { console.error('[SMS]', err.message); }
    return json(res, { success: true, sid, message: 'OTP sent — check backend terminal' });
  }
  if (method === 'POST' && pathname === '/api/auth/otp-verify/') {
    const body = await readBody(req);
    // Accept sid from body (sent by frontend) or fall back to cookie
    const sid = body.fields.sid || getSessionId(req, res);
    const pending = await getPending(sid);
    if (!pending || pending.kind !== 'register') {
      return json(res, { error: 'Session expired. Please register again.' }, 400);
    }
    if (parseInt(body.fields.otp, 10) !== pending.otp) return json(res, { error: 'Invalid OTP' }, 400);
    const now = new Date().toISOString();
    try {
      await db.prepare(`
        INSERT INTO auctions_user (password, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined, address, profile_picture, phone)
        VALUES ($1,false,$2,'',$3,$4,false,true,$5,NULL,NULL,$6)
      `).run(hashPassword(pending.password), pending.username, '', pending.email, now, pending.phone || null);
    } catch (err) {
      if (String(err).includes('unique') || String(err).includes('UNIQUE')) return json(res, { error: 'Username already taken' }, 400);
      throw err;
    }
    await deletePending(sid);
    return json(res, { success: true, username: pending.username });
  }
  if (method === 'POST' && pathname === '/api/auth/forgot-password/') {
    const body = await readBody(req);
    const { username, email } = body.fields;
    const u = await db.prepare('SELECT * FROM auctions_user WHERE username = $1 AND email = $2').get(username, email);
    if (!u) return json(res, { error: 'Invalid username and/or email.' }, 400);
    const otp = Math.floor(100000 + Math.random() * 900000);
    const sid = getSessionId(req, res);
    await savePending(sid, { kind: 'forgot', otp, username, email });
    try { await sendForgotPasswordOtp({ to: email, username, otp }); } catch (err) { console.error('[Mail]', err.message); }
    return json(res, { success: true });
  }
  if (method === 'POST' && pathname === '/api/auth/password-otp/') {
    const body = await readBody(req);
    const sid = getSessionId(req, res);
    const pending = await getPending(sid);
    if (!pending || pending.kind !== 'forgot') {
      return json(res, { error: 'Session expired. Please request a new OTP.' }, 400);
    }
    const userOtp = parseInt(body.fields.otp, 10);
    if (Number.isNaN(userOtp) || userOtp !== pending.otp) return json(res, { error: 'Invalid OTP' }, 400);
    const newPass = randomPassword();
    await db.prepare('UPDATE auctions_user SET password = $1 WHERE username = $2 AND email = $3').run(hashPassword(newPass), pending.username, pending.email);
    await sendNewPasswordEmail({ to: pending.email, username: pending.username, password: newPass });
    await deletePending(sid);
    return json(res, { success: true });
  }

  // Profile
  if (method === 'GET' && pathname === '/api/profile/') {
    if (!await requireAuth(req, res)) return;
    return json(res, serializeUser(req.user));
  }
  if (method === 'PUT' && pathname === '/api/profile/') {
    if (!await requireAuth(req, res)) return;
    const body = await readBody(req);
    const f = body.fields;
    let profilePicture = req.user.profile_picture;
    if (body.file) profilePicture = saveUploadedFile(body.file, IMAGES_DIR);
    await db.prepare(`
      UPDATE auctions_user SET first_name=$1, last_name=$2, email=$3, address=$4, profile_picture=$5 WHERE id=$6
    `).run(f.first_name ?? req.user.first_name, f.last_name ?? req.user.last_name, f.email ?? req.user.email, f.address ?? req.user.address ?? '', profilePicture, req.user.id);
    const updated = await db.prepare('SELECT * FROM auctions_user WHERE id = $1').get(req.user.id);
    return json(res, serializeUser(updated));
  }
  if (method === 'POST' && pathname === '/api/profile/password/') {
    if (!await requireAuth(req, res)) return;
    const body = await readBody(req);
    const { original_password, new_password, confirm_password } = body.fields;
    if (!verifyPassword(original_password, req.user.password)) return json(res, { error: 'Invalid original password' }, 400);
    if (new_password !== confirm_password) return json(res, { error: 'New passwords do not match' }, 400);
    await db.prepare('UPDATE auctions_user SET password = $1 WHERE id = $2').run(hashPassword(new_password), req.user.id);
    return json(res, { success: true });
  }

  // Admin
  if (method === 'GET' && pathname === '/api/admin/dashboard/') {
    if (!await requireAuth(req, res)) return;
    if (!requireSuperuser(req, res)) return;
    const users = await db.prepare('SELECT * FROM auctions_user').all();
    const listings = await db.prepare('SELECT * FROM auctions_listing').all();
    const total_users = (await db.prepare('SELECT COUNT(*) as c FROM auctions_user').get()).c;
    const total_listings = (await db.prepare('SELECT COUNT(*) as c FROM auctions_listing').get()).c;
    const active_listings = (await db.prepare('SELECT COUNT(*) as c FROM auctions_listing WHERE auction_active = true').get()).c;
    const inactive_listings = (await db.prepare('SELECT COUNT(*) as c FROM auctions_listing WHERE auction_active = false').get()).c;
    return json(res, { users: users.map(serializeUser), listings: await mapListings(listings, req.user.id), total_users, total_listings, active_listings, inactive_listings });
  }
  if (method === 'GET' && pathname === '/api/admin/users/') {
    if (!await requireAuth(req, res)) return;
    if (!requireSuperuser(req, res)) return;
    return json(res, (await db.prepare('SELECT * FROM auctions_user').all()).map(serializeUser));
  }
  if (method === 'GET' && pathname === '/api/admin/listings/') {
    if (!await requireAuth(req, res)) return;
    if (!requireSuperuser(req, res)) return;
    const url = new URL(req.url, 'http://localhost');
    const q = url.searchParams.get('q');
    let rows;
    if (q) {
      rows = await db.prepare('SELECT * FROM auctions_listing WHERE title ILIKE $1 OR description ILIKE $2 ORDER BY id DESC').all(`%${q}%`, `%${q}%`);
    } else {
      rows = await db.prepare('SELECT * FROM auctions_listing ORDER BY id DESC').all();
    }
    return json(res, await mapListings(rows, req.user.id));
  }
  const deactivateMatch = pathname.match(/^\/api\/admin\/listings\/(\d+)\/deactivate\/$/);
  if (method === 'POST' && deactivateMatch) {
    if (!await requireAuth(req, res)) return;
    if (!requireSuperuser(req, res)) return;
    await db.prepare('UPDATE auctions_listing SET auction_active = false WHERE id = $1').run(deactivateMatch[1]);
    return json(res, { success: true });
  }
  // Admin user actions
  const toggleStaffMatch = pathname.match(/^\/api\/admin\/users\/(\d+)\/toggle-staff\//);
  if (method === 'POST' && toggleStaffMatch) {
    if (!await requireAuth(req, res)) return;
    if (!requireSuperuser(req, res)) return;
    const uid = Number(toggleStaffMatch[1]);
    const u = await db.prepare('SELECT * FROM auctions_user WHERE id = $1').get(uid);
    if (!u) return json(res, { error: 'User not found' }, 404);
    await db.prepare('UPDATE auctions_user SET is_staff = $1 WHERE id = $2').run(!u.is_staff, uid);
    const updated = await db.prepare('SELECT * FROM auctions_user WHERE id = $1').get(uid);
    return json(res, serializeUser(updated));
  }
  const toggleAdminMatch = pathname.match(/^\/api\/admin\/users\/(\d+)\/toggle-admin\//);
  if (method === 'POST' && toggleAdminMatch) {
    if (!await requireAuth(req, res)) return;
    if (!requireSuperuser(req, res)) return;
    const uid = Number(toggleAdminMatch[1]);
    if (uid === req.user.id) return json(res, { error: 'Cannot change your own admin status' }, 400);
    const u = await db.prepare('SELECT * FROM auctions_user WHERE id = $1').get(uid);
    if (!u) return json(res, { error: 'User not found' }, 404);
    await db.prepare('UPDATE auctions_user SET is_superuser = $1 WHERE id = $2').run(!u.is_superuser, uid);
    const updated = await db.prepare('SELECT * FROM auctions_user WHERE id = $1').get(uid);
    return json(res, serializeUser(updated));
  }
  const deleteUserMatch = pathname.match(/^\/api\/admin\/users\/(\d+)\/delete\//);
  if (method === 'POST' && deleteUserMatch) {
    if (!await requireAuth(req, res)) return;
    if (!requireSuperuser(req, res)) return;
    const uid = Number(deleteUserMatch[1]);
    if (uid === req.user.id) return json(res, { error: 'Cannot delete yourself' }, 400);
    await db.prepare('DELETE FROM auctions_bid WHERE user_id = $1').run(uid);
    await db.prepare('DELETE FROM auctions_watch WHERE user_id = $1').run(uid);
    await db.prepare('DELETE FROM auctions_comment WHERE user_id = $1').run(uid);
    await db.prepare('DELETE FROM auctions_listing WHERE user_id = $1').run(uid);
    await db.prepare('DELETE FROM auctions_user WHERE id = $1').run(uid);
    return json(res, { success: true });
  }

  const deleteMatch = pathname.match(/^\/api\/admin\/listings\/(\d+)\/delete\/$/);
  if (method === 'POST' && deleteMatch) {
    if (!await requireAuth(req, res)) return;
    if (!requireSuperuser(req, res)) return;
    const id = Number(deleteMatch[1]);
    await db.prepare('DELETE FROM auctions_bid WHERE listing_id = $1').run(id);
    await db.prepare('DELETE FROM auctions_watch WHERE listing_id = $1').run(id);
    await db.prepare('DELETE FROM auctions_comment WHERE listing_id = $1').run(id);
    await db.prepare('DELETE FROM auctions_listing WHERE id = $1').run(id);
    return json(res, { success: true });
  }
  if (method === 'GET' && pathname === '/api/admin/reports/') {
    if (!await requireAuth(req, res)) return;
    if (!requireSuperuser(req, res)) return;
    const today = new Date().toISOString().slice(0, 10);
    const lastSeven = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 2);
    threeMonthsAgo.setDate(1);
    const threeMonthsStart = threeMonthsAgo.toISOString().slice(0, 10);
    const userWiseListings = await db.prepare(`
      SELECT u.username, COUNT(l.id) as total_listings FROM auctions_user u
      LEFT JOIN auctions_listing l ON l.user_id = u.id GROUP BY u.id, u.username
    `).all();
    const userRegistrationData = await db.prepare(`
      SELECT date(date_joined) as date_joined__date, COUNT(id) as total_registrations FROM auctions_user
      WHERE date(date_joined) BETWEEN $1 AND $2 GROUP BY date(date_joined)
    `).all(lastSeven, today);
    const userRegistrationData3Months = await db.prepare(`
      SELECT CAST(EXTRACT(MONTH FROM date_joined) AS INTEGER) as date_joined__month, COUNT(id) as total_registrations
      FROM auctions_user WHERE date(date_joined) BETWEEN $1 AND $2 GROUP BY EXTRACT(MONTH FROM date_joined)
    `).all(threeMonthsStart, today);
    const dayWiseListings = await db.prepare(`
      SELECT date(created_at) as created_at__date, COUNT(id) as count FROM auctions_listing
      WHERE date(created_at) BETWEEN $1 AND $2 GROUP BY date(created_at)
    `).all(lastSeven, today);
    const monthWiseListings = await db.prepare(`
      SELECT CAST(EXTRACT(MONTH FROM created_at) AS INTEGER) as created_at__month, COUNT(id) as count
      FROM auctions_listing WHERE date(created_at) BETWEEN $1 AND $2 GROUP BY EXTRACT(MONTH FROM created_at)
    `).all(threeMonthsStart, today);
    const categoryData = await db.prepare(`
      SELECT category, COUNT(id) as total_listings FROM auctions_listing GROUP BY category ORDER BY total_listings DESC
    `).all();
    const mostBid = await db.prepare(`
      SELECT l.id, l.title, COUNT(b.id) as num_bids FROM auctions_listing l
      LEFT JOIN auctions_bid b ON b.listing_id = l.id GROUP BY l.id ORDER BY num_bids DESC LIMIT 1
    `).get();
    const leastBid = await db.prepare(`
      SELECT l.id, l.title, COUNT(b.id) as num_bids FROM auctions_listing l
      LEFT JOIN auctions_bid b ON b.listing_id = l.id GROUP BY l.id ORDER BY num_bids ASC LIMIT 1
    `).get();
    const topBidders = await db.prepare(`
      SELECT u.username, COUNT(b.id) as num_bids FROM auctions_user u
      LEFT JOIN auctions_bid b ON b.user_id = u.id GROUP BY u.id, u.username ORDER BY num_bids DESC LIMIT 10
    `).all();
    const summary = (row) => (row ? { id: row.id, title: row.title, num_bids: row.num_bids } : null);
    return json(res, {
      day_wise_listings: dayWiseListings,
      month_wise_listings: monthWiseListings,
      month_names: monthWiseListings.map((m) => MONTH_NAMES[m.created_at__month] || ''),
      user_wise_listings: userWiseListings,
      user_registration_data: userRegistrationData,
      user_registration_data_3_months: userRegistrationData3Months,
      category_data: categoryData,
      most_bid_item: summary(mostBid),
      least_bid_item: summary(leastBid),
      top_bidders: topBidders,
    });
  }

  if (method === 'GET' && (pathname === '/api/health' || pathname === '/api/health/')) {
    return json(res, { ok: true });
  }

  return json(res, { error: 'Not found' }, 404);
}

function json(res, data, status = 200) {
  sendJson(res, data, status);
}
