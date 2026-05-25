import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host:     process.env.PG_HOST     || 'localhost',
  port:     parseInt(process.env.PG_PORT || '5432'),
  user:     process.env.PG_USER     || 'postgres',
  password: process.env.PG_PASSWORD || 'root',
  database: process.env.PG_DATABASE || 'EAuction',
});

pool.on('error', (err) => console.error('PostgreSQL pool error:', err));

async function query(sql, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result;
  } finally {
    client.release();
  }
}

function prepare(sql) {
  return {
    all: async (...params) => {
      const res = await query(sql, params.flat());
      return res.rows;
    },
    get: async (...params) => {
      const res = await query(sql, params.flat());
      return res.rows[0] || null;
    },
    run: async (...params) => {
      const res = await query(sql, params.flat());
      return {
        lastInsertRowid: res.rows[0]?.id ?? null,
        changes: res.rowCount,
      };
    },
  };
}

async function exec(sql) {
  await query(sql);
}

export async function initDb() {
  // Test connection first
  const client = await pool.connect();
  client.release();
  console.log('[DB] Connected to PostgreSQL successfully');

  await query(`
    CREATE TABLE IF NOT EXISTS auctions_user (
      id SERIAL PRIMARY KEY,
      password VARCHAR(128) NOT NULL,
      last_login TIMESTAMP NULL,
      is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
      username VARCHAR(150) NOT NULL UNIQUE,
      first_name VARCHAR(150) NOT NULL DEFAULT '',
      last_name VARCHAR(150) NOT NULL DEFAULT '',
      email VARCHAR(254) NOT NULL DEFAULT '',
      is_staff BOOLEAN NOT NULL DEFAULT FALSE,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      date_joined TIMESTAMP NOT NULL DEFAULT NOW(),
      address VARCHAR(255) NULL,
      profile_picture VARCHAR(100) NULL,
      phone VARCHAR(20) NULL
    )
  `);

  // Add phone column if it doesn't exist (for existing DBs)
  await query(`ALTER TABLE auctions_user ADD COLUMN IF NOT EXISTS phone VARCHAR(20) NULL`);

  await query(`
    CREATE TABLE IF NOT EXISTS auctions_listing (
      id SERIAL PRIMARY KEY,
      title VARCHAR(64) NOT NULL,
      category VARCHAR(32) NOT NULL,
      description VARCHAR(512) NOT NULL,
      user_id INTEGER NOT NULL REFERENCES auctions_user(id),
      image VARCHAR(100) NULL,
      starting_value NUMERIC NOT NULL,
      auction_active BOOLEAN NOT NULL DEFAULT TRUE,
      winner_id INTEGER NULL REFERENCES auctions_user(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS auctions_bid (
      id SERIAL PRIMARY KEY,
      listing_id INTEGER NOT NULL REFERENCES auctions_listing(id),
      user_id INTEGER NOT NULL REFERENCES auctions_user(id),
      value NUMERIC NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS auctions_watch (
      id SERIAL PRIMARY KEY,
      listing_id INTEGER NOT NULL REFERENCES auctions_listing(id),
      user_id INTEGER NOT NULL REFERENCES auctions_user(id)
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS auctions_comment (
      id SERIAL PRIMARY KEY,
      comment VARCHAR(512) NOT NULL,
      user_id INTEGER NOT NULL REFERENCES auctions_user(id),
      listing_id INTEGER NOT NULL REFERENCES auctions_listing(id),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS auth_pending (
      session_id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      otp INTEGER NOT NULL,
      username TEXT,
      email TEXT,
      phone TEXT,
      password TEXT,
      created_at TEXT NOT NULL
    )
  `);

  await query(`ALTER TABLE auth_pending ADD COLUMN IF NOT EXISTS phone TEXT NULL`);

  console.log('[DB] Schema ready');
}

export async function cleanupExpiredPending() {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  await query('DELETE FROM auth_pending WHERE created_at < $1', [cutoff]);
}

export async function savePending(sessionId, data) {
  await cleanupExpiredPending();
  await query(`
    INSERT INTO auth_pending (session_id, kind, otp, username, email, phone, password, created_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    ON CONFLICT(session_id) DO UPDATE SET
      kind=EXCLUDED.kind, otp=EXCLUDED.otp, username=EXCLUDED.username,
      email=EXCLUDED.email, phone=EXCLUDED.phone, password=EXCLUDED.password, created_at=EXCLUDED.created_at
  `, [sessionId, data.kind, data.otp, data.username ?? null, data.email ?? null, data.phone ?? null, data.password ?? null, new Date().toISOString()]);
}

export async function getPending(sessionId) {
  const res = await query('SELECT * FROM auth_pending WHERE session_id = $1', [sessionId]);
  return res.rows[0] || null;
}

export async function deletePending(sessionId) {
  await query('DELETE FROM auth_pending WHERE session_id = $1', [sessionId]);
}

export async function getCurrentBidValue(listingId) {
  const res = await query('SELECT MAX(value) as v FROM auctions_bid WHERE listing_id = $1', [listingId]);
  if (res.rows[0]?.v != null) return Number(res.rows[0].v);
  const listing = await query('SELECT starting_value FROM auctions_listing WHERE id = $1', [listingId]);
  return listing.rows[0] ? Number(listing.rows[0].starting_value) : 0;
}

export async function getCurrentBidder(listingId) {
  const res = await query(`
    SELECT u.* FROM auctions_bid b
    JOIN auctions_user u ON u.id = b.user_id
    WHERE b.listing_id = $1
    ORDER BY b.value DESC, b.id DESC LIMIT 1
  `, [listingId]);
  return res.rows[0] || null;
}

const db = { prepare, exec, query, pool };
export default db;
