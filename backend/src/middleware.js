import db from './db.js';
import { verifyToken } from './jwt.js';
import { sendJson } from './respond.js';

export { signToken } from './jwt.js';

export async function getUserFromRequest(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const payload = verifyToken(header.slice(7));
    if (!payload?.id) return null;
    return await db.prepare('SELECT * FROM auctions_user WHERE id = $1').get(payload.id);
  } catch {
    return null;
  }
}

export async function requireAuth(req, res) {
  const user = await getUserFromRequest(req);
  if (!user) {
    sendJson(res, { error: 'Authentication required' }, 401);
    return null;
  }
  req.user = user;
  return user;
}

export function requireSuperuser(req, res) {
  if (!Boolean(req.user?.is_superuser)) {
    sendJson(res, { error: 'Forbidden' }, 403);
    return false;
  }
  return true;
}
