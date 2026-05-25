import { createServer } from 'http'; // restart
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleApi } from './handlers.js';
import { sendJson } from './respond.js';
import { initDb } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MEDIA_ROOT = path.resolve(__dirname, '..', '..', 'media');
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';

const CORS_ORIGINS = new Set(['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3001']);

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && CORS_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function normalizeApiPath(pathname) {
  if (!pathname.startsWith('/api')) return pathname;
  if (!pathname.endsWith('/')) return `${pathname}/`;
  return pathname;
}

function isInsideDir(baseDir, targetPath) {
  const rel = path.relative(baseDir, targetPath);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

function serveMedia(res, pathname) {
  const rel = pathname.replace(/^\/media\//, '');
  const filePath = path.resolve(MEDIA_ROOT, rel);
  if (!isInsideDir(MEDIA_ROOT, filePath) || !fs.existsSync(filePath)) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  };
  res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
}

const server = createServer(async (req, res) => {
  try {
    setCors(req, res);
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = normalizeApiPath(url.pathname);

    if (pathname.startsWith('/media/')) {
      return serveMedia(res, pathname);
    }

    if (pathname.startsWith('/api/')) {
      return await handleApi(req, res, pathname);
    }

    res.statusCode = 404;
    res.end('Not found');
  } catch (err) {
    console.error('Request error:', err);
    sendJson(res, { error: 'Internal server error' }, 500);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process or set PORT=3001`);
  } else {
    console.error(err);
  }
  process.exit(1);
});

initDb().then(() => {
  server.listen(PORT, HOST, () => {
    console.log(`BidBazaar API running at http://${HOST}:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to PostgreSQL:', err.message);
  console.error('Make sure PostgreSQL is running and .env credentials are correct.');
  process.exit(1);
});
