import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';

export default function Home() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getListings()
      .then(setListings)
      .catch((err) => setError(err.message || 'Failed to load listings'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0f0f13 0%, #1a0a2e 50%, #0f0f13 100%)',
        padding: '80px 24px 64px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '20%', left: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600, color: 'var(--accent-light)', marginBottom: 20, letterSpacing: 1 }}>
            🏆 PREMIER ONLINE AUCTION PLATFORM
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 20, background: 'linear-gradient(135deg, #fff 30%, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Bid. Win. Collect.
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-muted)', marginBottom: 36, lineHeight: 1.6 }}>
            Discover rare collectibles, trading cards, comics & more. Place your bids and win unique treasures.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/auctions/browse-categories" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', textDecoration: 'none', padding: '12px 28px', borderRadius: 10, fontWeight: 600, fontSize: 15 }}>
              Browse Auctions
            </Link>
            {!user && (
              <Link to="/account/register" style={{ background: 'transparent', color: 'var(--text)', textDecoration: 'none', padding: '12px 28px', borderRadius: 10, fontWeight: 600, fontSize: 15, border: '1px solid var(--border)' }}>
                Get Started Free
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 56, flexWrap: 'wrap' }}>
          {[['🎯', 'Live Auctions', 'Bid in real-time'], ['🏅', 'Rare Items', 'Unique collectibles'], ['🔒', 'Secure Bids', 'Safe & trusted']].map(([icon, title, sub]) => (
            <div key={title} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>{title}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Listings */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>Recent Listings</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Latest items up for auction</p>
          </div>
          <Link to="/auctions/browse-categories" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>View all →</Link>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '14px 18px', color: 'var(--red)', marginBottom: 24 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card" style={{ height: 320, background: 'var(--bg2)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </section>
    </div>
  );
}
