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
    <div className="mx-auto flex max-w-lg flex-col justify-center px-4 sm:px-8 pt-6 sm:pt-8 pb-20">
      <Reveal>
        
        {/* Header Block */}
        <div className="text-center flex flex-col items-center justify-center mx-auto space-y-3 mb-6">
          <div className="eyebrow">SIH 2026 Portal</div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink text-center">
            Portal Log in
          </h1>
          <p className="lede text-center mx-auto text-base text-ink-soft max-w-sm">
            Access your team dashboard or Coordinator control center.
          </p>
        </div>

        {/* Event Concluded Notice Banner */}
        <div className="mb-6 rounded-2xl border border-marigold/40 bg-marigold/10 p-4 text-center text-ink shadow-xs">
          <div className="mono text-[0.68rem] font-bold uppercase tracking-wider text-marigold">
            SIH 2026 Internal Hackathon Concluded
          </div>
          <p className="mt-1 text-xs text-ink-soft">
            The screening rounds are complete. Participants can view final statistics on the homepage. Coordinators and Admins can log in below to access screening analytics &amp; records.
          </p>
        </div>

        {/* High Contrast Login Form Card */}
        <div className="rounded-3xl border-2 border-line bg-paper-2 p-6 sm:p-10 shadow-2xl space-y-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="mono text-xs font-bold text-ink uppercase tracking-wider block">
                Email <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border-2 border-line bg-paper px-4 py-3.5 text-base font-semibold text-ink placeholder:text-ink-soft/60 focus:border-marigold focus:bg-paper outline-none transition-all shadow-xs"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="mono text-xs font-bold text-ink uppercase tracking-wider block">
                  Password <span className="text-red-500 font-bold">*</span>
                </label>
                <Link to="/forgot-password" className="mono text-xs font-bold text-marigold hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-2xl border-2 border-line bg-paper px-4 py-3.5 text-base font-semibold text-ink placeholder:text-ink-soft/60 focus:border-marigold focus:bg-paper outline-none transition-all shadow-xs"
              />
            </div>

            {error && <p className="text-xs font-bold text-red-600 pt-1">{error}</p>}

            <Button type="submit" variant="primary" disabled={loading} className="w-full rounded-full py-4 text-base font-bold mono justify-center shadow-lg shadow-marigold/30">
              {loading ? 'Logging in...' : 'Log in to Account →'}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm font-medium text-ink-soft">
          Looking to register?{' '}
          <Link to="/register" className="font-bold text-marigold hover:underline">
            View registration status
          </Link>
        </p>

      </Reveal>
    </div>
  );
}
