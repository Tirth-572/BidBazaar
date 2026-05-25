import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import Alert from '../components/Alert';

const CATEGORIES = ['Trading Cards', 'Comic Books', 'Figurines', 'Collectibles', 'Currency & Coins', 'Other'];

export default function CreateListing() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', category: CATEGORIES[0], description: '', starting_value: '', image: null });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('category', form.category);
    fd.append('description', form.description);
    fd.append('starting_value', form.starting_value);
    if (form.image) fd.append('image', form.image);
    try { await api.createListing(fd); navigate('/'); }
    catch (err) { setError(err.data ? JSON.stringify(err.data) : err.message); }
  };

  return (
    <div className="page" style={{ padding: '80px 24px 48px', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>Create Listing</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>List your item for auction</p>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <Alert message={error} type="error" />
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label className="label">Title</label>
            <input className="input-field" type="text" placeholder="Item title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input-field" placeholder="Describe your item..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} required style={{ resize: 'vertical' }} />
          </div>
          <div>
            <label className="label">Starting Bid (₹)</label>
            <input className="input-field" type="number" step="0.01" placeholder="0.00" value={form.starting_value} onChange={(e) => setForm({ ...form, starting_value: e.target.value })} required />
          </div>
          <div>
            <label className="label">Image</label>
            <input className="input-field" type="file" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} style={{ cursor: 'pointer' }} />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '12px', fontSize: 15, marginTop: 4 }}>Create Listing</button>
        </form>
      </div>
    </div>
  );
}
