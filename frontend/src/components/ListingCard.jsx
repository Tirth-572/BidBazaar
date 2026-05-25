import { Link } from 'react-router-dom';

export default function ListingCard({ listing }) {
  const imgSrc = listing.image_url || 'https://via.placeholder.com/400x240?text=No+Image';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 14 }}>
      {/* Image */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
        <img
          src={imgSrc}
          alt={listing.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        />
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          {listing.auction_active
            ? <span className="badge-active">Live</span>
            : <span className="badge-expired">Ended</span>}
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', borderRadius: 8, padding: '3px 10px', fontSize: 12, color: '#ccc' }}>
          {listing.category}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <Link
          to={`/auctions/listing-detail/${listing.id}`}
          style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 600, fontSize: 16, lineHeight: 1.3 }}
        >
          {listing.title}
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Current Bid</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>₹{listing.current_bid}</div>
          </div>
          {listing.auction_active ? (
            <Link to={`/auctions/listing-detail/${listing.id}`} className="btn-primary" style={{ textDecoration: 'none', padding: '8px 18px', fontSize: 13 }}>
              Bid Now
            </Link>
          ) : (
            <Link to={`/auctions/listing-detail/${listing.id}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, border: '1px solid var(--border)', borderRadius: 8, padding: '7px 14px' }}>
              View
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
