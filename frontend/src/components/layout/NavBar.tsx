import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth, hasRole } from '@/lib/auth';
import { cn } from '@/lib/utils';

// ─── Navigation structure — same as sidebar, used for both ───────────────────
const NAV_CATEGORIES = [
  {
    title: 'Portal',
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
    title: 'Community',
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
    title: 'Support',
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
  const desktopNavRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Close everything on route change
  useEffect(() => {
    setSidebarOpen(false);
    setActiveDropdown(null);
  }, [location.pathname, setSidebarOpen]);

  // Escape key closes everything
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setActiveDropdown(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setSidebarOpen]);

  // Click outside desktop nav → close dropdown
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (desktopNavRef.current && !desktopNavRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const toggleDropdown = (title: string) =>
    setActiveDropdown((prev) => (prev === title ? null : title));

  return (
    <>
      {/* ── Fixed Top Header ─────────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 bg-paper/95 backdrop-blur-md border-b border-line/60 py-2 sm:py-3 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-2 sm:px-8 gap-2 sm:gap-4">

          {/* LEFT: Logo + hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 group">
              <img src="/nagarjuna-logo.webp" alt="Nagarjuna Logo"
                className="h-7 sm:h-10 w-auto shrink-0 rounded-md" width={144} height={144} />
              <span className="flex items-center gap-1 sm:gap-2">
                <span className="font-display text-sm sm:text-2xl font-bold tracking-tight text-ink">
                  Ignite
                </span>
                <span className="hidden sm:inline-flex items-center mono rounded-full bg-marigold/15 border border-marigold/40 px-2.5 py-0.5 text-[0.68rem] font-bold text-marigold">
                  SIH 2026
                </span>
              </span>
            </Link>

            {/* Hamburger — visible on all sizes, opens the sidebar drawer */}
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setSidebarOpen((o) => !o)}
              className="flex items-center justify-center rounded-full border border-line bg-paper-2 h-7 w-7 sm:h-auto sm:w-auto sm:px-3.5 sm:py-1.5 text-xs font-bold text-ink hover:border-marigold hover:text-marigold transition-all shrink-0 mono"
            >
              <span className="text-xs sm:text-sm font-bold leading-none">{sidebarOpen ? '✕' : '☰'}</span>
              <span className="hidden md:inline text-[0.72rem] uppercase tracking-wider ml-1.5">Menu</span>
            </button>
          </div>

          {/* CENTER: Desktop dropdown nav — hidden below lg */}
          <nav
            ref={desktopNavRef}
            className="hidden lg:flex items-center gap-0.5 mono text-[0.82rem] font-semibold text-ink-soft"
          >
            {/* Direct Home link */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  'rounded-full px-3.5 py-2 transition-all hover:text-marigold hover:bg-paper-3',
                  isActive && 'text-marigold font-bold bg-marigold/10'
                )
              }
            >
              Home
            </NavLink>

            {/* Category dropdowns */}
            {NAV_CATEGORIES.map((cat) => (
              <div key={cat.title} className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown(cat.title)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3.5 py-2 transition-all hover:text-marigold hover:bg-paper-3',
                    activeDropdown === cat.title && 'text-marigold bg-marigold/10 font-bold'
                  )}
                >
                  {cat.title}
                  {/* Chevron indicator */}
                  <svg
                    className={cn('h-3 w-3 shrink-0 transition-transform duration-200',
                      activeDropdown === cat.title && 'rotate-180')}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* ── Dropdown panel — mirrors the sidebar structure ── */}
                {activeDropdown === cat.title && (
                  <div className="absolute left-0 top-full mt-2 w-60 rounded-2xl border border-line/60 bg-paper shadow-2xl z-[60] overflow-hidden">
                    {/* Category header — same style as sidebar */}
                    <div className="mono text-[0.6rem] font-bold uppercase tracking-widest text-marigold bg-marigold/5 px-4 py-2 border-b border-line/40">
                      {cat.title}
                    </div>

                    {/* Quick actions at top of Portal dropdown */}
                    {cat.title === 'Portal' && !user && (
                      <div className="grid grid-cols-2 gap-1.5 p-2 border-b border-line/40">
                        <Link
                          to="/register"
                          onClick={() => setActiveDropdown(null)}
                          className="mono text-center rounded-xl bg-marigold px-2 py-2 text-[0.72rem] font-bold text-paper hover:bg-marigold/90 transition-all"
                        >
                          Register
                        </Link>
                        <Link
                          to="/login"
                          onClick={() => setActiveDropdown(null)}
                          className="mono text-center rounded-xl border border-ink/70 bg-paper px-2 py-2 text-[0.72rem] font-bold text-ink hover:border-marigold hover:text-marigold transition-all"
                        >
                          Log in
                        </Link>
                      </div>
                    )}

                    {/* Nav links — same layout as sidebar */}
                    <div className="p-2 space-y-0.5">
                      {cat.links.map((link) => (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          end={link.to === '/'}
                          onClick={() => setActiveDropdown(null)}
                          className={({ isActive }) =>
                            cn(
                              'mono flex items-center justify-between rounded-xl px-3 py-2 text-[0.8rem] font-semibold text-ink-soft transition-all hover:bg-paper-3 hover:text-ink',
                              isActive && 'bg-paper-3 text-ink font-bold border-l-4 border-marigold pl-2'
                            )
                          }
                        >
                          <span>{link.label}</span>
                          <span className="mono text-[0.6rem] text-marigold font-bold opacity-70">{link.code}</span>
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* RIGHT: Auth buttons */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to={hasRole(user, 'coordinator') ? '/admin' : '/dashboard'}
                  className="mono inline-flex items-center rounded-full bg-marigold px-3 py-1 sm:px-5 sm:py-2.5 text-[0.72rem] sm:text-[0.85rem] font-bold text-paper hover:scale-105 hover:bg-marigold/90 transition-all shadow-sm"
                >
                  {hasRole(user, 'coordinator') ? 'Admin' : 'Dashboard'}
                </Link>
                <button
                  onClick={logout}
                  className="mono hidden sm:inline-block rounded-full border border-line bg-paper px-3.5 py-2 text-[0.78rem] font-semibold text-ink-soft hover:border-red-500 hover:text-red-600 transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  to="/login"
                  className="mono inline-flex items-center justify-center rounded-full border-2 border-ink/80 bg-paper px-2 py-1 text-[0.68rem] sm:px-5 sm:py-2.5 sm:text-[0.85rem] font-bold text-ink hover:border-marigold hover:text-marigold transition-all shadow-xs"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="mono inline-flex items-center justify-center rounded-full bg-marigold px-2.5 py-1 text-[0.68rem] sm:px-6 sm:py-2.5 sm:text-[0.88rem] font-bold text-paper hover:scale-105 hover:bg-marigold/90 transition-all shadow-md shadow-marigold/25"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* ── Mobile backdrop ───────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 top-14 sm:top-16 z-40 bg-ink/40 backdrop-blur-xs"
        />
      )}

      {/* ── Sidebar Drawer — identical to before ─────────────────────────── */}
      <aside
        ref={sidebarRef}
        className={cn(
          'fixed top-14 sm:top-16 left-0 bottom-0 z-50 flex w-76 max-w-[85vw] flex-col border-r border-line bg-paper p-5 shadow-2xl transition-transform duration-300 overflow-y-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Quick actions at top — same as Portal dropdown quick actions */}
        <div className="grid grid-cols-2 gap-2 pb-4 border-b border-line/30 mb-4">
          <Link
            to="/register"
            onClick={() => setSidebarOpen(false)}
            className="mono text-center rounded-xl bg-marigold px-3 py-2.5 text-[0.78rem] font-bold text-paper shadow-sm"
          >
            Register Team
          </Link>
          <Link
            to="/login"
            onClick={() => setSidebarOpen(false)}
            className="mono text-center rounded-xl border border-ink/70 bg-paper px-3 py-2.5 text-[0.78rem] font-bold text-ink hover:border-marigold hover:text-marigold transition-all"
          >
            Portal Login
          </Link>
        </div>

        {/* All nav categories — same data as desktop */}
        <div className="space-y-5">
          {NAV_CATEGORIES.map((cat) => (
            <div key={cat.title}>
              <div className="mono text-[0.62rem] font-bold uppercase tracking-widest text-marigold mb-2 border-b border-line/30 pb-1">
                {cat.title}
              </div>
              <div className="space-y-0.5">
                {cat.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setSidebarOpen(false);
                    }}
                    className={({ isActive }) =>
                      cn(
                        'mono flex items-center justify-between rounded-xl px-3 py-2 text-[0.8rem] text-ink-soft transition-all hover:bg-paper-3 hover:text-ink',
                        isActive && 'bg-paper-3 text-ink font-bold border-l-4 border-marigold pl-2'
                      )
                    }
                  >
                    <span>{link.label}</span>
                    <span className="mono text-[0.62rem] text-marigold font-bold">{link.code}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar footer */}
        <div className="mt-auto pt-6 border-t border-line space-y-3">
          {user ? (
            <div className="space-y-3">
              <div className="mono text-[0.75rem] text-ink-soft">
                Signed in as: <strong className="text-ink">{user.name}</strong>
              </div>
              <button
                onClick={() => { logout(); setSidebarOpen(false); }}
                className="mono w-full rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-[0.78rem] font-bold text-red-600 hover:bg-red-600 hover:text-paper transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="mono text-center text-[0.68rem] text-ink-soft">
              Nagarjuna College of Engineering & Technology · SIH 2026
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
