import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/Button';
import { useAuth, hasRole } from '@/lib/auth';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Enter both your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      if (hasRole(user, 'coordinator')) {
        navigate('/admin', { replace: true });
        return;
      }
      navigate(location.state?.from || '/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Couldn't log in — check your email and password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-5 py-32 sm:px-8">
      <Reveal>
        <div className="eyebrow mb-5">Welcome back</div>
        <h1 className="text-[clamp(1.9rem,4vw,2.6rem)]">Log in to your account.</h1>

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
          <Button type="submit" variant="primary" disabled={loading} className="mt-2 justify-center">
            {loading ? 'Logging in...' : 'Log in →'}
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
