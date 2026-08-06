import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/Button';
import { useAuth, hasRole } from '@/lib/auth';

export function Login() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Enter both your email and password.');
      return;
    }
    setError('');
    try {
      const user = await login(email, password);
      if (hasRole(user, 'coordinator')) {
        // Staff accounts don't work on the participant login — same error
        // as bad credentials, so this page never reveals which is true.
        logout();
        setError("Couldn't log in — check your email and password, or that the API server is running.");
        return;
      }
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch {
      setError("Couldn't log in — check your email and password, or that the API server is running.");
    }
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-5 py-32 sm:px-8">
      <Reveal>
        <div className="eyebrow mb-5">Welcome back</div>
        <h1 className="text-[clamp(1.9rem,4vw,2.6rem)]">Log in to your team.</h1>

        <form className="mt-9 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-1.5 text-[0.8rem]">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@nagarjuna.edu"
              className="border border-line bg-paper px-4 py-3 text-[0.95rem] outline-none focus-visible:border-marigold"
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
              className="border border-line bg-paper px-4 py-3 text-[0.95rem] outline-none focus-visible:border-marigold"
            />
          </label>
          {error && <p className="text-[0.82rem] text-red-700">{error}</p>}
          <Button type="submit" variant="primary" className="mt-2 justify-center">
            Log in →
          </Button>
        </form>

        <p className="mt-6 text-[0.85rem] text-ink-soft">
          New here?{' '}
          <Link to="/register" className="text-marigold hover:underline">
            Register your team
          </Link>
        </p>
      </Reveal>
    </div>
  );
}
