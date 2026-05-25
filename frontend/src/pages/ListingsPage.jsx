import { useEffect, useState } from 'react';
import ListingCard from '../components/ListingCard';

export default function ListingsPage({ title, fetchFn }) {
  const [listings, setListings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    fetchFn().then(setListings).catch((err) => setError(err.message || 'Failed to load'));
  }, [fetchFn]);

  return (
    <div className="page" style={{ padding: '80px 24px 48px', maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 28 }}>{title}</h1>
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 16px', color: 'var(--red)', marginBottom: 20 }}>{error}</div>
      )}
      {listings.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p>No listings found</p>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
      </div>
    </div>
  );
}
