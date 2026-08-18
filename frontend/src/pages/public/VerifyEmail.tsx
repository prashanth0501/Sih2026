import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/Button';
import { apiResendVerification, apiVerifyEmail } from '@/api/auth';
import { useAuth } from '@/lib/auth';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setSuccess(false);
      setMessage('No verification token provided in URL.');
      return;
    }

    apiVerifyEmail(token)
      .then((res) => {
        setSuccess(true);
        setMessage(res.message || 'Email verified successfully!');
      })
      .catch((err) => {
        setSuccess(false);
        setMessage(err.response?.data?.detail || 'Email verification link is invalid or has expired.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleResend() {
    setResending(true);
    setResendStatus('');
    try {
      const res = await apiResendVerification();
      setResendStatus(res.message || 'Verification link sent!');
    } catch (err: any) {
      setResendStatus(err.response?.data?.detail || 'Failed to resend verification link.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col justify-center px-4 sm:px-8 pt-6 sm:pt-8 pb-20">
      <Reveal>
        <div className="text-center flex flex-col items-center justify-center mx-auto space-y-3 mb-8">
          <div className="eyebrow">Account Verification</div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-ink text-center">
            Email Verification
          </h1>
          <p className="lede text-center mx-auto text-base text-ink-soft max-w-sm">
            Verifying your email address for Ignite SIH 2026.
          </p>
        </div>

        <div className="rounded-3xl border-2 border-line bg-paper-2 p-6 sm:p-10 shadow-2xl space-y-6 text-center">
          {loading ? (
            <div className="py-8 text-center text-ink-soft font-semibold mono">
              Verifying email address...
            </div>
          ) : success ? (
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl font-bold">
                ✓
              </div>
              <h2 className="text-xl font-bold text-ink">Email Verified!</h2>
              <p className="text-sm text-ink-soft leading-relaxed">{message}</p>
              <div className="pt-4">
                <Link to="/dashboard">
                  <Button variant="primary" className="w-full justify-center py-3.5 text-sm font-bold mono shadow-lg shadow-marigold/30">
                    Go to Participant Dashboard →
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-2xl font-bold">
                !
              </div>
              <h2 className="text-xl font-bold text-ink">Verification Failed</h2>
              <p className="text-sm text-red-600 font-semibold">{message}</p>

              {user && !user.email_verified && (
                <div className="pt-4 space-y-3">
                  <Button
                    variant="secondary"
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full justify-center py-3 text-sm font-bold mono"
                  >
                    {resending ? 'Sending Link...' : 'Resend Verification Email'}
                  </Button>
                  {resendStatus && <p className="text-xs font-bold text-marigold">{resendStatus}</p>}
                </div>
              )}

              <div className="pt-2">
                <Link to="/login">
                  <Button variant="primary" className="w-full justify-center py-3 text-sm font-bold mono">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}
