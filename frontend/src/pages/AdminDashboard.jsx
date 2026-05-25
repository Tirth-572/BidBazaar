import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: 'var(--bg2)', border: `1px solid ${color}33`,
    borderRadius: 14, padding: '20px 24px',
    display: 'flex', alignItems: 'center', gap: 16,
  }}>
    <div style={{ fontSize: 32, width: 52, height: 52, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  </div>
);

const NavCard = ({ to, icon, label, desc }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
      <div style={{ fontSize: 28, width: 48, height: 48, borderRadius: 10, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 15 }}>{label}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</div>
      </div>
      <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 18 }}>→</div>
    </div>
  </Link>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => { api.adminDashboard().then(setStats).catch(() => setStats(null)); }, []);

  if (!stats) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--red)' }}>Access denied or loading...</p>
    </div>
  );

  return (
    <div className="page" style={{ padding: '80px 24px 48px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Overview of your platform</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 36 }}>
        <StatCard icon="👥" label="Total Users"    value={stats.total_users}     color="#a855f7" />
        <StatCard icon="📦" label="Total Listings" value={stats.total_listings}  color="#3b82f6" />
        <StatCard icon="🟢" label="Active"         value={stats.active_listings} color="#10b981" />
        <StatCard icon="🔴" label="Inactive"       value={stats.inactive_listings} color="#ef4444" />
      </div>

      {/* Quick nav */}
      <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 14, letterSpacing: 1, textTransform: 'uppercase' }}>Manage</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <NavCard to="/admin/control-panel/manage-users"    icon="👤" label="Manage Users"    desc="View all registered users" />
        <NavCard to="/admin/control-panel/manage-listings" icon="🏷️" label="Manage Listings" desc="Deactivate or delete listings" />
        <NavCard to="/admin/control-panel/reports-analytics"         icon="📊" label="Reports"         desc="Category stats, top bidders & more" />
      </div>
    </div>
  );
}
