import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [bidValue, setBidValue] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const load = () => api.getListing(id).then(setListing).catch(console.error);
  useEffect(() => { load(); }, [id]);

  const handleBid = async (e) => {
    e.preventDefault(); setError('');
    try { await api.placeBid(id, bidValue); setBidValue(''); load(); }
    catch (err) { setError(err.message || 'Your bid was too low'); }
  };
  const handleWatch = async () => { await api.toggleWatch(id); load(); };
  const handleClose = async () => { await api.closeAuction(id); load(); };
  const handleComment = async (e) => {
    e.preventDefault(); await api.addComment(id, comment); setComment(''); load();
  };

  if (!listing) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
    </div>
  );

  const imgSrc = listing.image_url || 'https://via.placeholder.com/600x400?text=No+Image';

  return (
    <div className="page" style={{ background: 'var(--bg)', padding: '80px 24px 48px' }}>
      <Alert message={error} type="error" />
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>

        {/* Image */}
        <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <img src={imgSrc} alt={listing.title} style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 420 }} />
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              {listing.auction_active ? <span className="badge-active">Live Auction</span> : <span className="badge-expired">Auction Ended</span>}
              <span style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '3px 10px', fontSize: 12, color: 'var(--text-muted)' }}>{listing.category}</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>{listing.title}</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.6, fontSize: 14 }}>{listing.description}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>Listed by <strong style={{ color: 'var(--text)' }}>{listing.owner_username}</strong></p>
          </div>

          {/* Price cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Starting Price</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>₹{listing.starting_value}</div>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Current Bid</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--gold)' }}>₹{listing.current_bid}</div>
            </div>
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', fontSize: 14 }}>
            🏆 Highest Bidder: <strong style={{ color: 'var(--accent-light)' }}>{listing.highest_bidder || 'No bids yet'}</strong>
          </div>

          {/* Actions */}
          {!user && <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>Please login to place a bid</p>}

          {listing.is_owner && listing.auction_active && (
            <button onClick={handleClose} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: 'var(--red)', borderRadius: 10, padding: '11px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
              Close Auction
            </button>
          )}

          {user && !listing.is_owner && listing.auction_active && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <form onSubmit={handleBid} style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input-field"
                  type="number" step="0.01" value={bidValue}
                  onChange={(e) => setBidValue(e.target.value)}
                  placeholder="Enter bid amount (₹)"
                  required
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}>Place Bid</button>
              </form>
              <button onClick={handleWatch} style={{
                background: listing.is_watched ? 'rgba(239,68,68,0.1)' : 'rgba(124,58,237,0.1)',
                border: `1px solid ${listing.is_watched ? 'rgba(239,68,68,0.3)' : 'rgba(124,58,237,0.3)'}`,
                color: listing.is_watched ? 'var(--red)' : 'var(--accent-light)',
                borderRadius: 10, padding: '10px', fontWeight: 600, cursor: 'pointer', fontSize: 14,
              }}>
                {listing.is_watched ? '♥ Remove from Watchlist' : '♡ Add to Watchlist'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      {user && (
        <div style={{ maxWidth: 1000, margin: '40px auto 0', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: 28 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--text)' }}>💬 Comments</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {listing.comments?.map((c) => (
              <div key={c.id} style={{ background: 'var(--bg3)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 12, color: 'var(--accent-light)', fontWeight: 600, marginBottom: 4 }}>{c.user}</div>
                <div style={{ color: 'var(--text)', fontSize: 14 }}>{c.comment}</div>
              </div>
            ))}
          </div>
          <form onSubmit={handleComment} style={{ display: 'flex', gap: 8 }}>
            <input
              className="input-field"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              required
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>Post</button>
          </form>
        </div>
      )}

      <style>{`@media(max-width:700px){.detail-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
