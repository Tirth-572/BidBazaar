import crypto from 'crypto';

export function getSessionId(req, res, forceNew = false) {
  const cookies = Object.fromEntries(
    (req.headers.cookie || '').split(';').map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k, decodeURIComponent(v.join('='))];
    }).filter(([k]) => k),
  );
  let sid = !forceNew && cookies.bidbazaar_sid;
  if (!sid) {
    sid = crypto.randomUUID();
    res.setHeader('Set-Cookie', `bidbazaar_sid=${sid}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1800`);
  }
  return sid;
}
