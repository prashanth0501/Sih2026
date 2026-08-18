import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/Button';
import { apiResetPassword, apiVerifyResetToken } from '@/api/auth';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Password Policy Checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isFormValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && passwordsMatch;

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setTokenValid(false);
      setError('Invalid or missing password reset token.');
      return;
    }

    apiVerifyResetToken(token)
      .then(() => {
        setTokenValid(true);
      })
      .catch((err) => {
        setTokenValid(false);
        setError(err.response?.data?.detail || 'This password reset link has expired or is invalid.');
      })
      .finally(() => setVerifying(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) {
      setError('Please fulfill all password requirements below.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await apiResetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Password reset failed. Please try again.');
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
            Set New Password
          </h1>
          <p className="lede text-center mx-auto text-base text-ink-soft max-w-sm">
            Choose a strong password for your Ignite SIH 2026 portal account.
          </p>
        </div>

        <div className="rounded-3xl border-2 border-line bg-paper-2 p-6 sm:p-10 shadow-2xl space-y-6">
          {verifying ? (
            <div className="py-8 text-center text-ink-soft font-semibold mono">
              Verifying reset token...
            </div>
          ) : !tokenValid ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 text-2xl font-bold">
                ✕
              </div>
              <h2 className="text-xl font-bold text-ink">Invalid Reset Link</h2>
              <p className="text-sm text-red-600 font-semibold">{error}</p>
              <div className="pt-4">
                <Link to="/forgot-password">
                  <Button variant="primary" className="w-full justify-center py-3 text-sm font-bold mono">
                    Request New Reset Link →
                  </Button>
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 text-2xl font-bold">
                ✓
              </div>
              <h2 className="text-xl font-bold text-ink">Password Updated!</h2>
              <p className="text-sm text-ink-soft">
                Your password has been successfully reset. You can now log in with your new credentials.
              </p>
              <div className="pt-4">
                <Button
                  variant="primary"
                  onClick={() => navigate('/login')}
                  className="w-full justify-center py-3.5 text-sm font-bold mono shadow-lg shadow-marigold/30"
                >
                  Proceed to Login →
                </Button>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="mono text-xs font-bold text-ink uppercase tracking-wider block">
                  New Password <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full rounded-2xl border-2 border-line bg-paper px-4 py-3.5 text-base font-semibold text-ink placeholder:text-ink-soft/60 focus:border-marigold focus:bg-paper outline-none transition-all shadow-xs"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="mono text-xs font-bold text-ink uppercase tracking-wider block">
                  Confirm New Password <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full rounded-2xl border-2 border-line bg-paper px-4 py-3.5 text-base font-semibold text-ink placeholder:text-ink-soft/60 focus:border-marigold focus:bg-paper outline-none transition-all shadow-xs"
                />
              </div>

              {/* Password Strength Indicators */}
              <div className="rounded-xl border border-line bg-paper p-4 text-xs space-y-1.5 font-medium text-ink-soft">
                <p className="font-bold text-ink mb-1">Password Requirements:</p>
                <div className={hasMinLength ? 'text-green-600 font-bold' : 'text-ink-soft'}>
                  {hasMinLength ? '✓' : '○'} At least 8 characters
                </div>
                <div className={hasUppercase ? 'text-green-600 font-bold' : 'text-ink-soft'}>
                  {hasUppercase ? '✓' : '○'} At least 1 uppercase letter (A-Z)
                </div>
                <div className={hasLowercase ? 'text-green-600 font-bold' : 'text-ink-soft'}>
                  {hasLowercase ? '✓' : '○'} At least 1 lowercase letter (a-z)
                </div>
                <div className={hasNumber ? 'text-green-600 font-bold' : 'text-ink-soft'}>
                  {hasNumber ? '✓' : '○'} At least 1 number (0-9)
                </div>
                {confirmPassword && (
                  <div className={passwordsMatch ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                    {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
                  </div>
                )}
              </div>

              {error && <p className="text-xs font-bold text-red-600 pt-1">{error}</p>}

              <Button
                type="submit"
                variant="primary"
                disabled={loading || !isFormValid}
                className="w-full rounded-full py-4 text-base font-bold mono justify-center shadow-lg shadow-marigold/30 disabled:opacity-50"
              >
                {loading ? 'Resetting Password...' : 'Update Password →'}
              </Button>
            </form>
          )}
        </div>
      </Reveal>
    </div>
  );
}
