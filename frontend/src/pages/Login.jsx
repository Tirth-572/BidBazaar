import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login(username, password);
      navigate(data.redirect || '/');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 16px 24px', background: 'var(--bg)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#7c3aed,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 auto 12px' }}>B</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Sign in to your BidBazaar account</p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <Alert message={error} type="error" />
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="label">Username</label>
              <input className="input-field" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
            </div>
            <div style={{ textAlign: 'right' }}>
              <Link to="/account/forgot-password" style={{ color: 'var(--accent-light)', fontSize: 13, textDecoration: 'none' }}>Forgot password?</Link>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: 15 }}>Sign In</button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 14 }}>
          Don't have an account?{' '}
          <Link to="/account/register" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
