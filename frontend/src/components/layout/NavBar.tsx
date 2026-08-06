import { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth, hasRole } from '@/lib/auth';
import { cn } from '@/lib/utils';

// Primary Navbar links displayed in the top bar
const TOP_NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/problem-statements', label: 'Explorer' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/results', label: 'Results' },
];

// Sidebar navigation link groups (Clean, minimal, standard)
const SIDEBAR_GROUPS = [
  {
    heading: 'Main Portal',
    links: [
      { to: '/', label: 'Home', code: '00' },
      { to: '/why-sih', label: 'Why SIH', code: '01' },
      { to: '/why-join', label: 'Why Join', code: '02' },
      { to: '/timeline', label: 'Timeline', code: '03' },
      { to: '/problem-statements', label: 'Problem Explorer', code: '04' },
      { to: '/rules', label: 'Rules & Guidelines', code: '05' },
      { to: '/spark-story', label: "Spark's Story", code: '06' },
    ],
  },
  {
    heading: 'Community & Media',
    links: [
      { to: '/people', label: 'People & Mentors', code: '07' },
      { to: '/gallery', label: 'Photo Gallery', code: '08' },
      { to: '/developers', label: 'Meet Developers', code: '09' },
      { to: '/updates', label: 'Latest Updates', code: '10' },
      { to: '/spread-the-spark', label: 'Spread the Spark', code: '11' },
      { to: '/results', label: 'SIH Results', code: '12' },
    ],
  },
  {
    heading: 'Support & Legal',
    links: [
      { to: '/faq', label: 'FAQ', code: '13' },
      { to: '/contact', label: 'Contact Us', code: '14' },
      { to: '/privacy', label: 'Privacy Policy', code: '15' },
    ],
  },
];

interface NavBarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function NavBar({ sidebarOpen, setSidebarOpen }: NavBarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSidebarOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [setSidebarOpen]);

  return (
    <>
      {/* Top Fixed Header Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between px-3 sm:px-8 bg-paper/95 backdrop-blur-md border-b border-line/50 shadow-sm whitespace-nowrap">
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Sidebar Toggle Button */}
          <button
            type="button"
            aria-label="Toggle navigation menu"
            onClick={() => setSidebarOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-paper-2 text-ink hover:border-marigold hover:text-marigold transition-all shrink-0"
          >
            <span className="mono text-base font-bold leading-none">{sidebarOpen ? '✕' : '☰'}</span>
          </button>

          {/* Logo & Brand Title */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/nagarjuna-logo.webp" alt="Nagarjuna Logo" className="h-8 w-auto sm:h-11 shrink-0" width={144} height={144} />
            <span className="flex items-center gap-1.5 shrink-0">
              <span className="font-display text-base sm:text-[1.65rem] font-bold leading-none shrink-0">Ignite</span>
              <span className="hidden sm:inline-block mono rounded-full bg-marigold px-2 py-0.5 text-[0.65rem] font-bold leading-none text-paper shrink-0">
                SIH 2026
              </span>
            </span>
          </Link>
        </div>

        {/* Center Primary Desktop Navbar Links */}
        <nav className="hidden lg:flex items-center gap-8 mono text-[0.82rem] font-medium text-ink-soft shrink-0">
          {TOP_NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'transition-colors hover:text-marigold whitespace-nowrap',
                  isActive && 'text-ink font-bold border-b-2 border-marigold pb-0.5'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right User Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 whitespace-nowrap">
          {user ? (
            <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              {hasRole(user, 'coordinator') ? (
                <Link
                  to="/admin"
                  className="mono rounded bg-marigold px-3 py-1.5 text-[0.72rem] sm:px-4 sm:py-2 sm:text-[0.78rem] font-bold text-paper transition-transform hover:scale-105 shadow-sm whitespace-nowrap shrink-0"
                >
                  Admin Panel
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="mono rounded bg-marigold px-3 py-1.5 text-[0.72rem] sm:px-4 sm:py-2 sm:text-[0.78rem] font-bold text-paper transition-transform hover:scale-105 shadow-sm whitespace-nowrap shrink-0"
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={logout}
                className="mono hidden sm:inline-block rounded border border-line bg-paper px-3 py-2 text-[0.75rem] text-ink-soft hover:border-red-600 hover:text-red-600 transition-colors whitespace-nowrap shrink-0"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 whitespace-nowrap">
              <Link
                to="/login"
                className="mono rounded border border-line bg-paper px-2.5 py-1.5 text-[0.7rem] sm:px-3.5 sm:py-2 sm:text-[0.75rem] font-medium text-ink hover:border-marigold transition-colors whitespace-nowrap shrink-0"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="mono rounded bg-marigold px-2.5 py-1.5 text-[0.7rem] sm:px-4 sm:py-2 sm:text-[0.75rem] font-bold text-paper hover:bg-marigold/90 transition-transform hover:scale-105 shadow-sm whitespace-nowrap shrink-0"
              >
                Register Team
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* MOBILE BACKDROP OVERLAY (ONLY ON SMALL SCREENS <1024px) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 top-16 z-30 bg-ink/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* DOCKED SIDEBAR PANEL (ALLOWS 100% INTERACTION ON DESKTOP & MOBILE NAVIGATION) */}
      <aside
        ref={sidebarRef}
        className={cn(
          'fixed top-16 left-0 bottom-0 z-40 flex w-72 max-w-[85vw] flex-col border-r border-line bg-paper/98 p-5 shadow-2xl transition-transform duration-300 overflow-y-auto pointer-events-auto h-[calc(100vh-4rem)]',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <img src="/nagarjuna-logo.webp" alt="Logo" className="h-6 w-auto" />
            <span className="font-display text-sm font-bold">Ignite Navigation</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded border border-line text-ink hover:bg-paper-3 text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* Sidebar Navigation Link Groups */}
        <div className="mt-4 space-y-5">
          {SIDEBAR_GROUPS.map((group) => (
            <div key={group.heading}>
              <div className="mono text-[0.6rem] font-bold uppercase tracking-wider text-marigold mb-1.5">
                {group.heading}
              </div>
              <div className="space-y-1">
                {group.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      if (window.innerWidth < 1024) setSidebarOpen(false);
                    }}
                    className={({ isActive }) =>
                      cn(
                        'mono flex items-center gap-3 rounded-md px-3 py-2 text-[0.78rem] text-ink-soft transition-colors hover:bg-paper-3 hover:text-ink',
                        isActive && 'bg-paper-3 text-ink font-bold border-l-2 border-marigold'
                      )
                    }
                  >
                    <span className="mono text-[0.62rem] text-marigold font-bold">{link.code}</span>
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer User Info / Actions */}
        <div className="mt-6 border-t border-line pt-4 pb-6">
          {user ? (
            <div className="space-y-3">
              <div className="mono text-[0.72rem] text-ink-soft">
                Logged in: <strong className="text-ink">{user.name}</strong>
              </div>
              <button
                onClick={() => {
                  logout();
                  setSidebarOpen(false);
                }}
                className="mono w-full rounded border border-red-700/30 bg-red-700/10 px-3 py-2 text-center text-[0.75rem] font-bold text-red-700 hover:bg-red-700 hover:text-paper transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="grid gap-2">
              <Link
                to="/login"
                onClick={() => setSidebarOpen(false)}
                className="mono text-center rounded border border-line bg-paper px-3 py-2 text-[0.78rem] font-medium text-ink hover:border-marigold"
              >
                Log in →
              </Link>
              <Link
                to="/register"
                onClick={() => setSidebarOpen(false)}
                className="mono text-center rounded bg-marigold px-3 py-2 text-[0.78rem] font-bold text-paper"
              >
                Register Team →
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
