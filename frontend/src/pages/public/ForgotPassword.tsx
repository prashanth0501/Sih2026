import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/Button';
import { apiForgotPassword } from '@/api/auth';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await apiForgotPassword(email.trim());
      setSubmitted(true);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to send password reset request. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col justify-center px-4 sm:px-8 pt-6 sm:pt-8 pb-20">
      <Reveal>
        <div className="text-center flex flex-col items-center justify-center mx-auto space-y-3 mb-8">
          <div className="eyebrow">Account Recovery</div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink text-center">
            Forgot Password?
          </h1>
          <p className="lede text-center mx-auto text-base text-ink-soft max-w-sm">
            Enter your registered email address to receive a secure password reset link.
          </p>
        </div>

        <div className="rounded-3xl border-2 border-line bg-paper-2 p-6 sm:p-10 shadow-2xl space-y-6">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-marigold/10 text-marigold text-2xl font-bold">
                ✓
              </div>
              <h2 className="text-xl font-bold text-ink">Reset Link Sent</h2>
              <p className="text-sm text-ink-soft leading-relaxed">
                If an account exists for <strong className="text-ink">{email}</strong>, a secure password reset link has been dispatched to your inbox.
              </p>
              <p className="text-xs text-ink-soft">
                Please check your inbox (and spam folder). The link will expire in 60 minutes.
              </p>
              <div className="pt-4">
                <Link to="/login">
                  <Button variant="secondary" className="w-full justify-center py-3 text-sm font-bold mono">
                    ← Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <label className="mono text-xs font-bold text-ink uppercase tracking-wider block">
                  Email Address <span className="text-red-500 font-bold">*</span>
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

              {error && <p className="text-xs font-bold text-red-600 pt-1">{error}</p>}

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full rounded-full py-4 text-base font-bold mono justify-center shadow-lg shadow-marigold/30"
              >
                {loading ? 'Sending Request...' : 'Send Password Reset Link →'}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm font-medium text-ink-soft">
          Remembered your password?{' '}
          <Link to="/login" className="font-bold text-marigold hover:underline">
            Log in here
          </Link>
        </p>
      </Reveal>
    </div>
  );
}
