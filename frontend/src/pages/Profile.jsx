import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => { api.getProfile().then(setUser).catch(console.error); }, []);

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
    </div>
  );

  return (
    <div className="page" style={{ padding: '80px 24px 48px', maxWidth: 600, margin: '0 auto' }}>
      <div className="card" style={{ padding: 32 }}>
        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
          {user.profile_picture_url ? (
            <img src={user.profile_picture_url} alt="Profile" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent)' }} />
          ) : (
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {user.username?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{user.username}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user.first_name} {user.last_name}</p>
          </div>
        </div>

        {/* Info rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            ['📧 Email', user.email],
            ['📍 Address', user.address || '—'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{label}</span>
              <span style={{ color: 'var(--text)', fontSize: 14, fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <Link to="/account/my-profile/edit-details" className="btn-primary" style={{ textDecoration: 'none', flex: 1, textAlign: 'center', padding: '10px' }}>Edit Profile</Link>
          <Link to="/account/my-profile/change-password" className="btn-outline" style={{ textDecoration: 'none', flex: 1, textAlign: 'center', padding: '10px' }}>Change Password</Link>
        </div>
      </div>
    </div>
  );
}
