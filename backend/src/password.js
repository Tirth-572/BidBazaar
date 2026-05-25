import crypto from 'crypto';

/** Verify Django pbkdf2_sha256 password hashes (existing SQLite users). */
export function verifyPassword(plain, encoded) {
  if (!encoded || !plain) return false;
  const parts = encoded.split('$');
  if (parts.length !== 4) return false;
  const [algorithm, iterationsStr, salt, hash] = parts;
  if (algorithm !== 'pbkdf2_sha256') return false;
  const iterations = parseInt(iterationsStr, 10);
  const derived = crypto.pbkdf2Sync(plain, salt, iterations, 32, 'sha256').toString('base64');
  return derived === hash;
}

/** Create Django-compatible password hash for new users. */
export function hashPassword(plain) {
  const iterations = 720000;
  const salt = crypto.randomBytes(12).toString('base64').replace(/\+/g, '').slice(0, 22);
  const hash = crypto.pbkdf2Sync(plain, salt, iterations, 32, 'sha256').toString('base64');
  return `pbkdf2_sha256$${iterations}$${salt}$${hash}`;
}

export function randomPassword(length = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let out = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) out += chars[bytes[i] % chars.length];
  return out;
}
