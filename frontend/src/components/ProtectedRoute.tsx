import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, hasRole, type Role } from '@/lib/auth';

export function ProtectedRoute({ minimumRole }: { minimumRole: Role }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return null;
  if (!hasRole(user, minimumRole)) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
