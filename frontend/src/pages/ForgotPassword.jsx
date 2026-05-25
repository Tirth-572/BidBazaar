import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import Alert from '../components/Alert';

export default function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try { await api.forgotPassword(username, email); navigate('/account/forgot-password/verify-otp'); }
    catch (err) { setError(err.message); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 16px 24px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Forgot Password</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>We'll send an OTP to reset your password</p>
        </div>
        <div className="card" style={{ padding: 28 }}>
          <Alert message={error} type="error" />
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">Username</label>
              <input className="input-field" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your username" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '12px', fontSize: 15 }}>Send OTP</button>
          </form>
        </div>
      </div>
    </div>
  );
}
