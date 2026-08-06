import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth, hasRole } from '@/lib/auth';
import { cn } from '@/lib/utils';

// Categorized navigation structure for all site options
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
  const { user, logout } = useAuth();
  const location = useLocation();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<number | null>(null);

  // Close menus on route change or Escape key
  useEffect(() => {
    setSidebarOpen(false);
    setActiveDropdown(null);
  }, [location.pathname, setSidebarOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setActiveDropdown(null);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setSidebarOpen]);

  const handleDropdownEnter = (title: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(title);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = window.setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  return (
    <>
      {/* Top Fixed Header Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 bg-paper/95 backdrop-blur-md border-b border-line/60 py-2.5 sm:py-3 transition-all duration-200 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-8 gap-2 sm:gap-4">
          
          {/* Logo comes FIRST, followed by Menu Toggle button right beside it */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* 1. Brand Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group">
              <img
                src="/nagarjuna-logo.webp"
                alt="Nagarjuna Logo"
                className="h-8 w-auto sm:h-10 shrink-0 rounded-md"
                width={144}
                height={144}
              />
              <span className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <span className="font-display text-base sm:text-2xl font-bold tracking-tight text-ink">
                  Ignite
                </span>
                <span className="hidden sm:inline-flex items-center mono rounded-full bg-marigold/15 border border-marigold/40 px-2.5 py-0.5 text-[0.68rem] font-bold text-marigold">
                  SIH 2026
                </span>
              </span>
            </Link>

            {/* 2. Menu Toggle Button — Positioned right NEXT to logo */}
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setSidebarOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-full border border-line bg-paper-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-xs font-bold text-ink hover:border-marigold hover:text-marigold transition-all shrink-0 mono"
            >
              <span className="text-xs sm:text-sm font-bold leading-none">{sidebarOpen ? '✕' : '☰'}</span>
              <span className="hidden md:inline text-[0.72rem] uppercase tracking-wider">Menu</span>
            </button>
          </div>

          {/* Center Navigation Categories with Dropdowns */}
          <nav className="hidden lg:flex items-center gap-1 mono text-[0.82rem] font-semibold text-ink-soft shrink-0">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  'rounded-full px-3.5 py-2 transition-all hover:text-marigold hover:bg-paper-3',
                  isActive && 'text-marigold font-bold bg-marigold/10'
                )
              }
            >
              Home
            </NavLink>

            {NAV_CATEGORIES.map((category) => (
              <div
                key={category.title}
                className="relative"
                onMouseEnter={() => handleDropdownEnter(category.title)}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  type="button"
                  className={cn(
                    'flex items-center gap-1 rounded-full px-3.5 py-2 transition-all hover:text-marigold hover:bg-paper-3',
                    activeDropdown === category.title && 'text-marigold bg-marigold/10 font-bold'
                  )}
                >
                  <span>{category.title}</span>
                </button>

                {/* Dropdown Menu Overlay */}
                {activeDropdown === category.title && (
                  <div className="absolute left-0 top-full mt-2 w-56 rounded-2xl border border-line/60 bg-paper backdrop-blur-xl p-2 shadow-xl z-50 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    {category.links.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center justify-between rounded-xl px-3 py-2 text-[0.82rem] font-semibold text-ink transition-all hover:bg-marigold/10 hover:text-marigold',
                            isActive && 'bg-marigold/15 text-marigold font-bold'
                          )
                        }
                      >
                        <span>{link.label}</span>
                        <span className="mono text-[0.62rem] text-marigold opacity-70 font-bold">{link.code}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Action Buttons — Mobile Responsive */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-2 shrink-0">
                {hasRole(user, 'coordinator') ? (
                  <Link
                    to="/admin"
                    className="mono inline-flex items-center rounded-full bg-marigold px-3.5 py-1.5 sm:px-5 sm:py-2.5 text-xs sm:text-[0.85rem] font-bold text-paper transition-all hover:scale-105 hover:bg-marigold/90 shadow-sm"
                  >
                    Admin
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="mono inline-flex items-center rounded-full bg-marigold px-3.5 py-1.5 sm:px-5 sm:py-2.5 text-xs sm:text-[0.85rem] font-bold text-paper transition-all hover:scale-105 hover:bg-marigold/90 shadow-sm"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="mono hidden sm:inline-block rounded-full border border-line bg-paper px-3.5 py-2 text-[0.78rem] font-semibold text-ink-soft hover:border-red-500 hover:text-red-600 transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                {/* LOGIN BUTTON (Responsive) */}
                <Link
                  to="/login"
                  className="mono inline-flex items-center justify-center rounded-full border-2 border-ink/80 bg-paper px-3 py-1.5 text-[0.75rem] sm:px-5 sm:py-2.5 sm:text-[0.85rem] font-bold text-ink hover:border-marigold hover:text-marigold transition-all hover:scale-105 shadow-xs"
                >
                  Log in
                </Link>

                {/* REGISTER TEAM BUTTON (Responsive) */}
                <Link
                  to="/register"
                  className="mono inline-flex items-center justify-center rounded-full bg-marigold px-3.5 py-1.5 text-[0.75rem] sm:px-6 sm:py-2.5 sm:text-[0.88rem] font-bold text-paper transition-all hover:scale-105 hover:bg-marigold/90 shadow-md shadow-marigold/25"
                >
                  <span className="sm:hidden">Register</span>
                  <span className="hidden sm:inline">Register Team</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE BACKDROP OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 top-14 sm:top-16 z-40 bg-ink/40 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* SLEEK DRAWER */}
      <aside
        ref={sidebarRef}
        className={cn(
          'fixed top-14 sm:top-16 left-0 bottom-0 z-50 flex w-76 max-w-[85vw] flex-col border-r border-line bg-paper p-5 shadow-2xl transition-transform duration-300 overflow-y-auto pointer-events-auto h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3.5">
          <div className="flex items-center gap-2.5">
            <img src="/nagarjuna-logo.webp" alt="Logo" className="h-7 w-auto rounded" />
            <div>
              <div className="font-display text-base font-bold text-ink leading-none">
                SIH 2026 Portal
              </div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-paper-2 text-ink hover:bg-paper-3 text-xs font-bold transition-all"
          >
            ✕
          </button>
        </div>

        {/* Drawer Quick Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            to="/register"
            onClick={() => setSidebarOpen(false)}
            className="mono text-center rounded-xl bg-marigold px-3 py-2.5 text-[0.78rem] font-bold text-paper"
          >
            Register Team
          </Link>
          <Link
            to="/login"
            onClick={() => setSidebarOpen(false)}
            className="mono text-center rounded-xl border border-ink/70 bg-paper px-3 py-2.5 text-[0.78rem] font-bold text-ink"
          >
            Portal Login
          </Link>
        </div>

        {/* Drawer Categories & Links */}
        <div className="mt-5 space-y-5">
          {NAV_CATEGORIES.map((category) => (
            <div key={category.title}>
              <div className="mono text-[0.65rem] font-bold uppercase tracking-wider text-marigold mb-2 border-b border-line/30 pb-1">
                {category.title}
              </div>
              <div className="space-y-1">
                {category.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      setSidebarOpen(false);
                    }}
                    className={({ isActive }) =>
                      cn(
                        'mono flex items-center justify-between rounded-xl px-3 py-2 text-[0.8rem] text-ink-soft transition-all hover:bg-paper-3 hover:text-ink',
                        isActive && 'bg-paper-3 text-ink font-bold border-l-4 border-marigold'
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

        {/* Sidebar Footer */}
        <div className="mt-8 border-t border-line pt-4 pb-6 space-y-3">
          {user ? (
            <div className="space-y-3">
              <div className="mono text-[0.75rem] text-ink-soft">
                Signed in as: <strong className="text-ink">{user.name}</strong>
              </div>
              <button
                onClick={() => {
                  logout();
                  setSidebarOpen(false);
                }}
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
