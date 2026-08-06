import { Outlet } from 'react-router-dom';
import { useAuth, hasRole } from '@/lib/auth';
import { AdminLogin } from '@/pages/admin/AdminLogin';

/**
 * Deliberately not a redirect to the public /login. Typing /admin directly
 * is the only way to reach this — there is no nav link to it for logged-out
 * visitors — and it should open a login form right there, not bounce
 * through the participant-facing page.
 */
export function AdminGate() {
  const { user, ready } = useAuth();

  if (!ready) return null;
  if (!user) return <AdminLogin />;
  if (!hasRole(user, 'coordinator')) return <AdminLogin denied />;
  return <Outlet />;
}
