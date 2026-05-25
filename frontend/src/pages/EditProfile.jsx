import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function EditProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', address: '' });
  const [file, setFile] = useState(null);

  useEffect(() => {
    api.getProfile().then((u) => setForm({
      first_name: u.first_name || '', last_name: u.last_name || '',
      email: u.email || '', address: u.address || '',
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('profile_picture', file);
    await api.updateProfile(fd);
    navigate('/account/my-profile');
  };

  const fields = [
    { key: 'first_name', label: 'First Name', placeholder: 'First name' },
    { key: 'last_name', label: 'Last Name', placeholder: 'Last name' },
    { key: 'email', label: 'Email', placeholder: 'your@email.com' },
    { key: 'address', label: 'Address', placeholder: 'Your address' },
  ];

  return (
    <div className="page" style={{ padding: '80px 24px 48px', maxWidth: 520, margin: '0 auto' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Edit Profile</h1>
      <div className="card" style={{ padding: 28 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input className="input-field" type="text" placeholder={placeholder} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            </div>
          ))}
          <div>
            <label className="label">Profile Picture</label>
            <input className="input-field" type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} style={{ cursor: 'pointer' }} />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '12px', fontSize: 15, marginTop: 4 }}>Save Changes</button>
        </form>
      </div>
    </div>
  );
}
