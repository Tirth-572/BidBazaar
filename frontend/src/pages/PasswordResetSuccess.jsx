import { Link } from 'react-router-dom';

export default function PasswordResetSuccess() {
  return (
    <div className="dark:bg-gray-900 flex flex-col justify-center items-center min-h-screen pt-16 text-white">
      <h1 className="text-2xl font-semibold mb-4">Password Reset Successful</h1>
      <p className="mb-6 text-gray-300">Check your email for the new password.</p>
      <Link to="/login" className="bg-blue-500 text-white rounded-md py-2 px-6">Go to Login</Link>
    </div>
  );
}
