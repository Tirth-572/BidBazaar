import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import Alert from '../components/Alert';

export default function PasswordOtp() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.passwordOtp(otp);
      navigate('/account/password-reset-successful');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="dark:bg-gray-900 flex justify-center items-center min-h-screen pt-16">
      <div className="p-8 max-w-md w-full">
        <Alert message={error} type="error" />
        <h1 className="text-2xl font-semibold mb-4 text-white">Enter OTP</h1>
        <form onSubmit={handleSubmit}>
          <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full border rounded-md py-2 px-3 text-gray-900 mb-4" required />
          <button type="submit" className="bg-blue-500 text-white rounded-md py-2 px-4 w-full">Verify</button>
        </form>
      </div>
    </div>
  );
}
