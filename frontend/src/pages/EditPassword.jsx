import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import Alert from '../components/Alert';

export default function EditPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ original_password: '', new_password: '', confirm_password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.changePassword(form);
      navigate('/account/my-profile');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="pt-[12vh] min-h-screen px-4 py-8 max-w-xl mx-auto">
      <Alert message={error} type="error" />
      <h1 className="text-3xl font-bold mb-6">Change Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {['original_password', 'new_password', 'confirm_password'].map((f) => (
          <input key={f} type="password" placeholder={f.replace(/_/g, ' ')} value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} className="border rounded p-2 w-full text-gray-900" required />
        ))}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">Update Password</button>
      </form>
    </section>
  );
}
