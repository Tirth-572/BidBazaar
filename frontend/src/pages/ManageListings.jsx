import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function ManageListings() {
  const [listings, setListings] = useState([]);
  const [q, setQ] = useState('');

  const load = () => api.adminListings(q).then(setListings).catch(console.error);
  useEffect(() => { load(); }, []);

  const deactivate = async (id) => { await api.adminDeactivate(id); load(); };
  const remove = async (id) => { if (window.confirm('Delete this listing?')) { await api.adminDelete(id); load(); } };

  return (
    <div className="page" style={{ padding: '80px 24px 48px', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Manage Listings</h1>

      <form onSubmit={(e) => { e.preventDefault(); load(); }} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input className="input-field" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search listings..." style={{ flex: 1 }} />
        <button type="submit" className="btn-primary" style={{ padding: '10px 20px' }}>Search</button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {listings.map((l) => (
          <div key={l.id} className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <Link to={`/listing/${l.id}`} style={{ color: 'var(--accent-light)', fontWeight: 600, textDecoration: 'none', fontSize: 15 }}>{l.title}</Link>
              <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{l.category}</span>
                {l.auction_active ? <span className="badge-active">Active</span> : <span className="badge-expired">Inactive</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {l.auction_active && (
                <button onClick={() => deactivate(l.id)} style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: 'var(--gold)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  Deactivate
                </button>
              )}
              <button onClick={() => remove(l.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
