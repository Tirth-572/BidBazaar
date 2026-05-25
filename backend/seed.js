import pg from 'pg';
import crypto from 'node:crypto';

const pool = new pg.Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432'),
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'root',
  database: process.env.PG_DATABASE || 'EAuction',
});

const client = await pool.connect();

// Hash password
const iterations = 720000;
const salt = crypto.randomBytes(12).toString('base64').slice(0, 22);
const hash = crypto.pbkdf2Sync('Admin@123', salt, iterations, 32, 'sha256').toString('base64');
const encoded = `pbkdf2_sha256$${iterations}$${salt}$${hash}`;

// Insert admin
await client.query(`
  INSERT INTO auctions_user (password,is_superuser,username,first_name,last_name,email,is_staff,is_active,date_joined)
  VALUES ($1,true,'admin','Admin','User','admin@gmail.com',true,true,NOW())
  ON CONFLICT(username) DO UPDATE SET password=EXCLUDED.password
`, [encoded]);

const { id: uid } = (await client.query(`SELECT id FROM auctions_user WHERE username='admin'`)).rows[0];
console.log('✅ Admin user ready, id:', uid);

// Insert listings
const listings = [
  ['Super Rare Charizard Pokemon Card', 'Trading Cards', 'Own a piece of Pokemon history with this ultra-rare Charizard card coveted by collectors worldwide.', 10000, 'images/A14wLNkt2iL.jpg'],
  ['Batman Comic Book 1940', 'Comic Books', 'Original Batman comic from 1940, excellent condition with vibrant colors.', 5000, 'images/18batman-comic-jumbo.webp'],
  ['Deadpool Signed by Stan Lee', 'Comic Books', 'Rare Deadpool comic personally signed by the legendary Stan Lee.', 25000, 'images/deadpool_signed_stan_lee.jpg'],
  ['Gojo Satoru Figurine', 'Figurines', 'Limited edition Gojo Satoru figurine from Jujutsu Kaisen, mint condition.', 3500, 'images/Gojo_Figurine.webp'],
  ['Pokemon Card Collection', 'Trading Cards', 'Rare collection of holographic Pokemon cards from the original series.', 8000, 'images/how-to-take-fantastic-pictures-of-pokemon-cards-quick-tips.jpg'],
  ['Liberty Coin 1800s', 'Currency & Coins', 'Authentic Liberty coin from the 1800s, well preserved with original luster.', 15000, 'images/libertyCoin.jpg'],
  ['Spider-Man Comic #1', 'Comic Books', 'First edition Spider-Man comic book in near mint condition.', 20000, 'images/Spider_man_Comic.jpg'],
  ['Stan Lee Framed Artwork', 'Collectibles', 'Framed artwork signed by Stan Lee, a true collectors treasure.', 30000, 'images/Stan-Lee-Super-Heroes-Framed-scaled.jpg'],
  ['Super Mario Original Cartridge', 'Collectibles', 'Original Super Mario Bros cartridge for NES, fully working.', 4500, 'images/super_mario.jpg'],
  ['X-Men Sentinel Figure', 'Figurines', 'Large X-Men Sentinel action figure, rare find for Marvel collectors.', 7000, 'images/X-Men-Sentinel.jpg'],
];

for (const [title, cat, desc, val, img] of listings) {
  await client.query(`
    INSERT INTO auctions_listing (title,category,description,user_id,image,starting_value,auction_active,created_at)
    VALUES ($1,$2,$3,$4,$5,$6,true,NOW())
  `, [title, cat, desc, uid, img, val]);
}
console.log(`✅ Seeded ${listings.length} listings`);

const counts = (await client.query(`
  SELECT (SELECT COUNT(*) FROM auctions_user) as users,
  (SELECT COUNT(*) FROM auctions_listing) as listings
`)).rows[0];
console.log(`📊 Database: ${counts.users} users, ${counts.listings} listings`);

client.release();
await pool.end();
