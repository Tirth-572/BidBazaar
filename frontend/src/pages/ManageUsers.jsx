import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function ManageUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');

  const load = () => api.adminUsers().then(setUsers).catch(console.error);
  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const act = async (fn, label) => {
    setError(''); setLoading(label);
    try { await fn(); await load(); }
    catch (e) { setError(e.message); }
    finally { setLoading(''); }
  };

  const Btn = ({ onClick, color, children, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: `rgba(${color},0.12)`, border: `1px solid rgba(${color},0.35)`,
        color: `rgb(${color})`, borderRadius: 7, padding: '4px 10px',
        fontSize: 12, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, whiteSpace: 'nowrap',
      }}
    >{children}</button>
  );

  return (
    <div className="page" style={{ padding: '80px 24px 48px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>Manage Users</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>{users.length} total users</p>
        </div>
        <input
          className="input-field" style={{ width: 260 }}
          placeholder="🔍  Search username or email..."
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Alert message={error} type="error" />

      <div className="card" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780 }}>
          <thead>
            <tr style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)' }}>
              {['#', 'User', 'Email', 'Joined', 'Staff', 'Admin', 'Actions'].map((h) => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => {
              const isSelf = u.id === me?.id;
              return (
                <tr key={u.id}
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: 13 }}>{i + 1}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {u.username?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: 14 }}>{u.username}</span>
                      {isSelf && <span style={{ fontSize: 10, background: 'rgba(168,85,247,0.15)', color: '#a855f7', borderRadius: 10, padding: '1px 7px' }}>You</span>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: 13 }}>{u.email || '—'}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: 13 }}>{u.date_joined?.slice(0, 10) || '—'}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      background: u.is_staff ? 'rgba(16,185,129,0.12)' : 'rgba(100,100,100,0.1)',
                      color: u.is_staff ? '#10b981' : 'var(--text-muted)',
                      border: `1px solid ${u.is_staff ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                      borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600,
                    }}>{u.is_staff ? 'Yes' : 'No'}</span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      background: u.is_superuser ? 'rgba(168,85,247,0.12)' : 'rgba(100,100,100,0.1)',
                      color: u.is_superuser ? '#a855f7' : 'var(--text-muted)',
                      border: `1px solid ${u.is_superuser ? 'rgba(168,85,247,0.3)' : 'var(--border)'}`,
                      borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600,
                    }}>{u.is_superuser ? 'Admin' : 'User'}</span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Btn
                        color="16,185,129"
                        disabled={!!loading}
                        onClick={() => act(() => api.adminToggleStaff(u.id), `staff-${u.id}`)}
                      >{u.is_staff ? 'Remove Staff' : 'Add Staff'}</Btn>
                      <Btn
                        color="168,85,247"
                        disabled={!!loading || isSelf}
                        onClick={() => act(() => api.adminToggleAdmin(u.id), `admin-${u.id}`)}
                      >{u.is_superuser ? 'Remove Admin' : 'Make Admin'}</Btn>
                      <Btn
                        color="239,68,68"
                        disabled={!!loading || isSelf}
                        onClick={() => { if (confirm(`Delete user "${u.username}"? This cannot be undone.`)) act(() => api.adminDeleteUser(u.id), `del-${u.id}`); }}
                      >Delete</Btn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No users found</div>
        )}
      </div>
    </div>
  );
}
