import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="text-center pt-24">Loading...</p>;
  if (!user) return <Navigate to="/account/login" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="text-center pt-24">Loading...</p>;
  if (!user?.is_superuser) return <Navigate to="/access/forbidden" replace />;
  return children;
}
