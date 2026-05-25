import crypto from 'crypto';

const secret = () => process.env.JWT_SECRET || 'bidbazaar-dev-secret';

function b64url(data) {
  return Buffer.from(data).toString('base64url');
}

export function signToken(payload, expiresInSec = 7 * 24 * 3600) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const body = b64url(JSON.stringify({ ...payload, iat: now, exp: now + expiresInSec }));
  const sig = crypto.createHmac('sha256', secret()).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

export function verifyToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expected = crypto.createHmac('sha256', secret()).update(`${header}.${body}`).digest('base64url');
  if (sig !== expected) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}
