// Migrates data from old SQLite DBs into PostgreSQL EAuction
import { createRequire } from 'module';
import { existsSync } from 'fs';
import pg from 'pg';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

const pool = new pg.Pool({
  host: 'localhost', port: 5432,
  user: 'postgres', password: 'root',
  database: 'EAuction',
});

const DJANGO_DB  = 'd:\\College Project\\E-Auction COM\\BidBazaar1\\BidBazaar1\\.backup_django\\db.sqlite3';
const NODE_DB    = 'd:\\College Project\\E-Auction COM\\BidBazaar1\\BidBazaar1\\backend\\database.sqlite';

async function run() {
  const client = await pool.connect();

  // ── Django SQLite ──────────────────────────────────────────────
  if (existsSync(DJANGO_DB)) {
    console.log('\n📦 Migrating Django SQLite...');
    const dj = new Database(DJANGO_DB, { readonly: true });

    // Users
    const djUsers = dj.prepare('SELECT * FROM auctions_user').all();
    console.log(`  Found ${djUsers.length} users`);
    for (const u of djUsers) {
      await client.query(`
        INSERT INTO auctions_user
          (id, password, last_login, is_superuser, username, first_name, last_name,
           email, is_staff, is_active, date_joined, address, profile_picture)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        ON CONFLICT(username) DO UPDATE SET
          email=EXCLUDED.email, first_name=EXCLUDED.first_name,
          last_name=EXCLUDED.last_name, is_superuser=EXCLUDED.is_superuser,
          is_staff=EXCLUDED.is_staff, password=EXCLUDED.password
      `, [u.id, u.password, u.last_login||null, !!u.is_superuser, u.username,
          u.first_name||'', u.last_name||'', u.email||'',
          !!u.is_staff, !!u.is_active, u.date_joined, u.address||null, u.profile_picture||null]);
    }

    // Listings
    const djListings = dj.prepare('SELECT * FROM auctions_listing').all();
    console.log(`  Found ${djListings.length} listings`);
    for (const l of djListings) {
      await client.query(`
        INSERT INTO auctions_listing
          (id, title, category, description, user_id, image, starting_value, auction_active, winner_id, created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        ON CONFLICT(id) DO NOTHING
      `, [l.id, l.title, l.category, l.description, l.user_id,
          l.image||null, l.starting_value, !!l.auction_active, l.winner_id||null, l.created_at||new Date().toISOString()]);
    }

    // Bids
    const djBids = dj.prepare('SELECT * FROM auctions_bid').all();
    console.log(`  Found ${djBids.length} bids`);
    for (const b of djBids) {
      await client.query(`
        INSERT INTO auctions_bid (id, listing_id, user_id, value, created_at)
        VALUES ($1,$2,$3,$4,$5) ON CONFLICT(id) DO NOTHING
      `, [b.id, b.listing_id, b.user_id, b.value, b.created_at||new Date().toISOString()]);
    }

    // Watchlist
    const djWatch = dj.prepare('SELECT * FROM auctions_watch').all();
    console.log(`  Found ${djWatch.length} watchlist entries`);
    for (const w of djWatch) {
      await client.query(`
        INSERT INTO auctions_watch (id, listing_id, user_id)
        VALUES ($1,$2,$3) ON CONFLICT(id) DO NOTHING
      `, [w.id, w.listing_id, w.user_id]);
    }

    // Comments
    const djComments = dj.prepare('SELECT * FROM auctions_comment').all();
    console.log(`  Found ${djComments.length} comments`);
    for (const c of djComments) {
      await client.query(`
        INSERT INTO auctions_comment (id, comment, user_id, listing_id, created_at)
        VALUES ($1,$2,$3,$4,$5) ON CONFLICT(id) DO NOTHING
      `, [c.id, c.comment, c.user_id, c.listing_id, c.created_at||new Date().toISOString()]);
    }

    // Fix sequences
    await client.query(`SELECT setval('auctions_user_id_seq', (SELECT MAX(id) FROM auctions_user))`);
    await client.query(`SELECT setval('auctions_listing_id_seq', (SELECT MAX(id) FROM auctions_listing))`);
    await client.query(`SELECT setval('auctions_bid_id_seq', COALESCE((SELECT MAX(id) FROM auctions_bid),1))`);
    await client.query(`SELECT setval('auctions_watch_id_seq', COALESCE((SELECT MAX(id) FROM auctions_watch),1))`);
    await client.query(`SELECT setval('auctions_comment_id_seq', COALESCE((SELECT MAX(id) FROM auctions_comment),1))`);

    dj.close();
    console.log('  ✅ Django data migrated');
  } else {
    console.log('⚠️  Django SQLite not found, skipping');
  }

  // ── Old Node SQLite ────────────────────────────────────────────
  if (existsSync(NODE_DB)) {
    console.log('\n📦 Migrating old Node SQLite...');
    const nd = new Database(NODE_DB, { readonly: true });

    const tables = nd.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all().map(r => r.name);
    console.log('  Tables found:', tables.join(', '));

    if (tables.includes('auctions_user') || tables.includes('users')) {
      const tbl = tables.includes('auctions_user') ? 'auctions_user' : 'users';
      const rows = nd.prepare(`SELECT * FROM ${tbl}`).all();
      console.log(`  Found ${rows.length} users in ${tbl}`);
      for (const u of rows) {
        await client.query(`
          INSERT INTO auctions_user (password, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
          ON CONFLICT(username) DO NOTHING
        `, [u.password||'', !!(u.is_superuser||u.isAdmin), u.username||u.name||u.email,
            u.first_name||'', u.last_name||'', u.email||'', !!(u.is_staff), true]);
      }
    }

    nd.close();
    console.log('  ✅ Node data migrated');
  } else {
    console.log('⚠️  Node SQLite not found, skipping');
  }

  // ── Final counts ───────────────────────────────────────────────
  const counts = (await client.query(`
    SELECT
      (SELECT COUNT(*) FROM auctions_user) as users,
      (SELECT COUNT(*) FROM auctions_listing) as listings,
      (SELECT COUNT(*) FROM auctions_bid) as bids,
      (SELECT COUNT(*) FROM auctions_watch) as watchlist,
      (SELECT COUNT(*) FROM auctions_comment) as comments
  `)).rows[0];
  console.log('\n📊 Final DB counts:', counts);

  client.release();
  await pool.end();
}

run().catch(e => { console.error('❌', e.message); process.exit(1); });
