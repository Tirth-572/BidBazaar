import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

const CATEGORY_ICONS = {
  'Trading Cards': '🃏',
  'Comic Books': '📚',
  'Figurines': '🗿',
  'Collectibles': '🏺',
  'Currency & Coins': '🪙',
  'Other': '📦',
};

export default function Categories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => { api.getCategories().then(setCategories).catch(console.error); }, []);

  return (
    <div className="page" style={{ padding: '80px 24px 48px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)' }}>Categories</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 15 }}>Hover over a card to explore</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20 }}>
        {categories.map((cat) => (
          <Link key={cat} to={`/auctions/browse-categories/${encodeURIComponent(cat)}`} style={{ textDecoration: 'none', display: 'block', height: 180, perspective: '1000px' }} className="flip-card-wrapper">
            <div className="flip-card-inner">

              {/* Front — logo/icon */}
              <div className="flip-card-front">
                <div style={{ fontSize: 52 }}>{CATEGORY_ICONS[cat] || '🏷️'}</div>
              </div>

              {/* Back — category name on white */}
              <div className="flip-card-back">
                <div style={{ fontSize: 28, marginBottom: 10 }}>{CATEGORY_ICONS[cat] || '🏷️'}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e', textAlign: 'center', padding: '0 12px' }}>{cat}</div>
              </div>

            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .flip-card-wrapper {
          cursor: pointer;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.55s cubic-bezier(0.4, 0.2, 0.2, 1);
        }
        .flip-card-wrapper:hover .flip-card-inner {
          transform: rotateX(180deg);
        }
        .flip-card-front,
        .flip-card-back {
          position: absolute;
          inset: 0;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .flip-card-front {
          background: var(--bg2);
          border: 1px solid var(--border);
        }
        .flip-card-back {
          background: #ffffff;
          border: 2px solid var(--accent);
          transform: rotateX(180deg);
          box-shadow: 0 8px 32px rgba(124, 58, 237, 0.25);
        }
      `}</style>
    </div>
  );
}
