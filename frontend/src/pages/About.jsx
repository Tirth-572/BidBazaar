import { Link } from 'react-router-dom';

const team = [
  { name: 'Aniket Jadhav', role: 'Full Stack Developer', avatar: 'A' },
  { name: 'Vishal Gurdale', role: 'Backend Developer', avatar: 'V' },
  { name: 'Pratik Kolhe', role: 'Frontend Developer', avatar: 'P' },
];

const stats = [
  { icon: '👥', value: '9+', label: 'Registered Users' },
  { icon: '📦', value: '13+', label: 'Active Listings' },
  { icon: '🏷️', value: '5', label: 'Categories' },
  { icon: '💰', value: '6+', label: 'Bids Placed' },
];

export default function About() {
  return (
    <div className="page" style={{ padding: '80px 24px 64px', maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600, color: 'var(--accent-light)', marginBottom: 16, letterSpacing: 1 }}>
          ABOUT US
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 800, color: 'var(--text)', marginBottom: 14 }}>About BidBazaar</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
          BidBazaar is a premier online auction platform built for collectors and enthusiasts. 
          We connect buyers and sellers of rare collectibles, trading cards, comics, figurines, and more.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 64 }}>
        {stats.map((s) => (
          <div key={s.label} className="card" style={{ padding: '24px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-light)', marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mission */}
      <div className="card" style={{ padding: '32px 28px', marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>🎯 Our Mission</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: 15 }}>
          Our mission is to create a trusted, transparent, and exciting auction experience for collectors worldwide. 
          We believe every rare item deserves to find its rightful owner — someone who truly values it. 
          BidBazaar makes that connection possible through a secure, easy-to-use platform.
        </p>
      </div>

      {/* Tech Stack */}
      <div className="card" style={{ padding: '32px 28px', marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>🛠️ Tech Stack</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {[
            ['⚛️', 'React 18', 'Frontend UI'],
            ['⚡', 'Vite', 'Build Tool'],
            ['🎨', 'Tailwind CSS', 'Styling'],
            ['🟢', 'Node.js 22', 'Backend Runtime'],
            ['🐘', 'PostgreSQL 17', 'Database'],
            ['🔐', 'JWT Auth', 'Authentication'],
          ].map(([icon, name, desc]) => (
            <div key={name} style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{icon}</span>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 20 }}>👨‍💻 Meet the Team</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 56 }}>
        {team.map((m) => (
          <div key={m.name} className="card" style={{ padding: '24px 20px', textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 auto 14px' }}>{m.avatar}</div>
            <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 16 }}>{m.name}</div>
            <div style={{ color: 'var(--accent-light)', fontSize: 13, marginTop: 4 }}>{m.role}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: '40px 24px' }}>
        <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Join BidBazaar Today</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>Start bidding on rare collectibles or list your own items for auction.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/account/register" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', textDecoration: 'none', padding: '11px 28px', borderRadius: 10, fontWeight: 600, fontSize: 14 }}>Get Started Free</Link>
          <Link to="/how-it-works" style={{ background: 'transparent', color: 'var(--text)', textDecoration: 'none', padding: '11px 28px', borderRadius: 10, fontWeight: 600, fontSize: 14, border: '1px solid var(--border)' }}>How It Works</Link>
        </div>
      </div>
    </div>
  );
}
