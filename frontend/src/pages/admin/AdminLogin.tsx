import { useState } from 'react';
import { useAuth, hasRole } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export function AdminLogin({ denied }: { denied?: boolean }) {
  const { login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      if (!hasRole(user, 'coordinator')) {
        await logout();
        setError('This account does not have coordinator or admin permissions.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Incorrect email or password. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-ink px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mono mb-6 text-center text-[0.68rem] tracking-widest text-paper/50">
          IGNITE / ADMIN ACCESS
        </div>

        {denied ? (
          <div className="border border-paper/15 bg-ink p-8 text-center text-paper">
            <p className="text-[0.95rem]">This account doesn't have admin access.</p>
            <button
              onClick={logout}
              className="mono mt-5 text-[0.7rem] text-marigold hover:underline"
            >
              Log out and try a different account
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 border border-paper/15 bg-ink p-8 text-paper">
            <label className="grid gap-1.5 text-[0.8rem]">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coordinators / spoc email"
                className="border border-paper/20 bg-transparent px-4 py-3 text-[0.95rem] text-paper outline-none focus-visible:border-marigold"
              />
            </label>
            <label className="grid gap-1.5 text-[0.8rem]">
              Password
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border border-paper/20 bg-transparent px-4 py-3 text-[0.95rem] text-paper outline-none focus-visible:border-marigold"
              />
            </label>
            {error && <p className="text-[0.82rem] text-red-400">{error}</p>}
            <Button type="submit" variant="primary" disabled={loading} className="mt-2 justify-center bg-marigold border-marigold">
              {loading ? 'Authenticating...' : 'Sign in →'}
            </Button>
          </form>
        )}

        <p className="mono mt-6 text-center text-[0.62rem] text-paper/40">
          Restricted to the SPOC and coordinators.
        </p>
      </div>
    </div>
  );
}
