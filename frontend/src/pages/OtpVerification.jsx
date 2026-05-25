import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import Alert from '../components/Alert';

export default function OtpVerification() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      const sid = sessionStorage.getItem('otp_sid');
      await api.otpVerify(otp, sid);
      sessionStorage.removeItem('otp_sid');
      navigate('/account/login');
    }
    catch (err) { setError(err.message); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 16px 24px' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Verify OTP</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>Check your backend terminal for the OTP code</p>
        </div>
        <div className="card" style={{ padding: 28 }}>
          <Alert message={error} type="error" />
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label">OTP Code</label>
              <input className="input-field" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" required />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '12px', fontSize: 15 }}>Verify</button>
          </form>
        </div>
      </div>
    </div>
  );
}
