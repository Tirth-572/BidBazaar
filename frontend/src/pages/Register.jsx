import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import Alert from '../components/Alert';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', phone: '', password: '', confirmation: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.register(form);
      if (res.sid) sessionStorage.setItem('otp_sid', res.sid);
      navigate('/account/verify-otp');
    } catch (err) {
      // If OTP was saved but email failed, still proceed to OTP page
      if (err.message?.toLowerCase().includes('email') || err.status === 500) {
        navigate('/account/verify-otp');
        return;
      }
      setError(err.message);
    }
  };

  const fields = [
    { key: 'username', label: 'Username', type: 'text', placeholder: 'Choose a username' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com (optional)' },
    { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 9876543210 (for OTP)' },
    { key: 'password', label: 'Password', type: 'password', placeholder: 'Create a password' },
    { key: 'confirmation', label: 'Confirm Password', type: 'password', placeholder: 'Repeat your password' },
  ];

  const isRequired = (key) => key !== 'email';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 16px 24px', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 auto 12px' }}>B</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Create account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Join BidBazaar and start bidding</p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <Alert message={error} type="error" />
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {fields.map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input
                  className="input-field"
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  required={isRequired(key)}
                />
              </div>
            ))}
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: 15, marginTop: 4 }}>Create Account</button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 14 }}>
          Already have an account?{' '}
          <Link to="/account/login" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
