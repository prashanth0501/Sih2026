import { useState } from 'react';
import { useAuth, hasRole } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export function AdminLogin({ denied }: { denied?: boolean }) {
  const { login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      if (!hasRole(user, 'coordinator')) {
        // A valid participant login still isn't an admin login — same
        // generic error as bad credentials, so this never confirms an
        // email exists or reveals its role.
        await logout();
        setError('Incorrect email or password.');
      }
    } catch {
      setError('Incorrect email or password.');
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-ink px-5">
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
                className="border border-paper/20 bg-transparent px-4 py-3 text-[0.95rem] text-paper outline-none focus-visible:border-marigold"
              />
            </label>
            {error && <p className="text-[0.82rem] text-red-400">{error}</p>}
            <Button type="submit" variant="primary" className="mt-2 justify-center bg-marigold border-marigold">
              Sign in →
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
