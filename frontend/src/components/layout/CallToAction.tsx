import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

export function CallToAction() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-8 border-t border-line/60 bg-gradient-to-b from-paper to-paper-2">
      {/* Background glow accents */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-marigold/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 w-80 h-80 rounded-full bg-indigo/10 blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-ink">
          Ready to Turn Your Idea into Reality?
        </h2>

        <p className="lede max-w-2xl mx-auto text-base sm:text-xl">
          Register your team now for the internal screening at Nagarjuna College of Engineering & Technology, or log in to track your submission progress.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          {user ? (
            <Link
              to="/dashboard"
              className="mono inline-flex items-center rounded-2xl bg-marigold px-8 py-4 text-base font-bold text-paper shadow-lg shadow-marigold/25 transition-all duration-200 hover:scale-105 hover:bg-marigold/90"
            >
              Go to Your Team Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="mono inline-flex items-center rounded-2xl bg-marigold px-8 py-4 text-base sm:text-lg font-bold text-paper shadow-lg shadow-marigold/30 transition-all duration-200 hover:scale-105 hover:bg-marigold/90"
              >
                Register Team Now
              </Link>
              <Link
                to="/login"
                className="mono inline-flex items-center rounded-2xl border-2 border-ink/80 bg-paper px-7 py-4 text-base sm:text-lg font-bold text-ink hover:border-marigold hover:text-marigold transition-all duration-200 hover:scale-105 shadow-xs"
              >
                Log in to Portal
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
