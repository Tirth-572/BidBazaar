import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/'); };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(15,15,19,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)', height: '64px',
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: '32px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: '#fff',
          }}>B</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>BidBazaar</span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }} className="desktop-nav">
          {[['/', 'Home'], ['/auctions/browse-categories', 'Categories'], ['/how-it-works', 'How It Works'], ['/about-bidbazaar', 'About']].map(([to, label]) => (
            <Link key={to} to={to} style={navLinkStyle}>{label}</Link>
          ))}
          {user && [
            ['/auctions/create-new-listing', 'Create Listing'],
            ['/dashboard/my-active-listings', 'My Listings'],
            ['/dashboard/my-won-auctions', 'Won Auctions'],
            ['/dashboard/my-watchlist', 'Watchlist'],
          ].map(([to, label]) => (
            <Link key={to} to={to} style={navLinkStyle}>{label}</Link>
          ))}
          {user?.is_superuser && (
            <Link to="/admin/control-panel/dashboard" style={{ ...navLinkStyle, color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 8, padding: '5px 12px' }}>⚙ Admin</Link>
          )}
        </div>

        {/* Auth area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }} className="desktop-nav">
          {user ? (
            <>
              <Link to="/account/my-profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#fff',
                }}>{user.username?.[0]?.toUpperCase()}</div>
                <span style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>{user.username}</span>
              </Link>
              <button onClick={handleLogout} style={{
                background: 'transparent', border: '1px solid var(--border)',
                borderRadius: 8, padding: '6px 14px', color: 'var(--text-muted)',
                cursor: 'pointer', fontSize: 13, fontWeight: 500,
                transition: 'border-color 0.2s, color 0.2s',
              }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--red)'; e.target.style.color = 'var(--red)'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)'; }}
              >Logout</button>
            </>
          ) : (
            <>
              <Link to="/account/login" style={{ ...navLinkStyle, padding: '6px 14px' }}>Login</Link>
              <Link to="/account/register" className="btn-primary" style={{ padding: '7px 18px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600, background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff' }}>Register</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', display: 'none' }}
          className="mobile-menu-btn"
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
          background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          {[['/', 'Home'], ['/auctions/browse-categories', 'Categories'], ['/how-it-works', 'How It Works'], ['/about-bidbazaar', 'About']].map(([to, label]) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={mobileNavLink}>{label}</Link>
          ))}
          {user && [
            ['/auctions/create-new-listing', 'Create Listing'],
            ['/dashboard/my-active-listings', 'My Listings'],
            ['/dashboard/my-won-auctions', 'Won Auctions'],
            ['/dashboard/my-watchlist', 'Watchlist'],
            ['/account/my-profile', 'Profile'],
          ].map(([to, label]) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={mobileNavLink}>{label}</Link>
          ))}
          {user?.is_superuser && (
            <Link to="/admin/control-panel/dashboard" onClick={() => setMenuOpen(false)} style={{ ...mobileNavLink, color: '#a855f7' }}>⚙ Admin Dashboard</Link>
          )}
          {user
            ? <button onClick={() => { handleLogout(); setMenuOpen(false); }} style={{ ...mobileNavLink, background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--red)' }}>Logout</button>
            : <>
                <Link to="/account/login" onClick={() => setMenuOpen(false)} style={mobileNavLink}>Login</Link>
                <Link to="/account/register" onClick={() => setMenuOpen(false)} style={mobileNavLink}>Register</Link>
              </>
          }
        </div>
      )}

      <main style={{ minHeight: '100vh' }}>
        <Outlet />
      </main>

      <footer style={{
        background: 'var(--bg2)', borderTop: '1px solid var(--border)',
        padding: '32px 24px', textAlign: 'center',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1100, margin: '0 auto', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 15 }}>B</div>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>BidBazaar</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>© 2025 BidBazaar. All rights reserved.</p>
          {user?.is_superuser && (
            <Link to="/admin/control-panel/dashboard" style={{ color: 'var(--accent-light)', fontSize: 13, textDecoration: 'none' }}>Admin Dashboard</Link>
          )}
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}

const navLinkStyle = {
  color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14,
  fontWeight: 500, padding: '6px 10px', borderRadius: 7,
  transition: 'color 0.2s, background 0.2s',
};

const mobileNavLink = {
  color: 'var(--text)', textDecoration: 'none', fontSize: 15,
  fontWeight: 500, padding: '10px 0', borderBottom: '1px solid var(--border)',
};
