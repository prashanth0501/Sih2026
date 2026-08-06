import { useEffect, useRef, useState } from 'react';
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

// Sidebar navigation link groups
const SIDEBAR_GROUPS = [
  {
    heading: 'Main Portal',
    links: [
      { to: '/', label: 'Home', icon: '🏠' },
      { to: '/why-sih', label: 'Why SIH', icon: '💡' },
      { to: '/why-join', label: 'Why Join', icon: '🎯' },
      { to: '/timeline', label: 'Timeline', icon: '📅' },
      { to: '/problem-statements', label: 'Problem Explorer', icon: '🔍' },
      { to: '/rules', label: 'Rules & Guidelines', icon: '📜' },
      { to: '/spark-story', label: "Spark's Story", icon: '✨' },
    ],
  },
  {
    heading: 'Community & Media',
    links: [
      { to: '/people', label: 'People & Mentors', icon: '👥' },
      { to: '/gallery', label: 'Photo Gallery', icon: '🖼️' },
      { to: '/developers', label: 'Meet Developers', icon: '⚡' },
      { to: '/updates', label: 'Latest Updates', icon: '📢' },
      { to: '/spread-the-spark', label: 'Spread the Spark', icon: '🚀' },
      { to: '/results', label: 'SIH Results', icon: '🏆' },
    ],
  },
  {
    heading: 'Support & Legal',
    links: [
      { to: '/faq', label: 'FAQ', icon: '❓' },
      { to: '/contact', label: 'Contact Us', icon: '📞' },
      { to: '/privacy', label: 'Privacy Policy', icon: '🔒' },
    ],
  },
];

export function NavBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSidebarOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <>
      {/* Top Fixed Header Navbar */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-3.5 sm:px-8 bg-paper/90 backdrop-blur-md border-b border-line/50 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Stylish Sidebar Toggle Button */}
          <button
            type="button"
            aria-label="Toggle navigation menu"
            onClick={() => setSidebarOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-paper-2 text-ink hover:border-marigold hover:text-marigold transition-all"
          >
            <span className="text-xl leading-none">{sidebarOpen ? '✕' : '☰'}</span>
          </button>

          {/* Logo & Brand Title */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/nagarjuna-logo.webp" alt="Nagarjuna Logo" className="h-11 w-auto sm:h-13" width={144} height={144} />
            <span className="flex items-center gap-2">
              <span className="font-display text-[1.45rem] font-bold leading-none sm:text-[1.75rem]">Ignite</span>
              <span className="mono rounded-full bg-marigold px-2.5 py-0.5 text-[0.68rem] font-bold leading-none text-paper sm:text-[0.72rem]">
                SIH 2026
              </span>
            </span>
          </Link>
        </div>

        {/* Center Primary Desktop Navbar Links */}
        <nav className="hidden lg:flex items-center gap-8 mono text-[0.82rem] font-medium text-ink-soft">
          {TOP_NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'transition-colors hover:text-marigold',
                  isActive && 'text-ink font-bold border-b-2 border-marigold pb-0.5'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right User Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {hasRole(user, 'coordinator') ? (
                <Link
                  to="/admin"
                  className="mono rounded bg-marigold px-4 py-2 text-[0.78rem] font-bold text-paper transition-transform hover:scale-105 shadow-sm"
                >
                  ★ Admin Panel
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="mono rounded bg-marigold px-4 py-2 text-[0.78rem] font-bold text-paper transition-transform hover:scale-105 shadow-sm"
                >
                  ★ Dashboard
                </Link>
              )}
              <button
                onClick={logout}
                className="mono hidden sm:inline-block rounded border border-line bg-paper px-3 py-2 text-[0.75rem] text-ink-soft hover:border-red-600 hover:text-red-600 transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="mono rounded border border-line bg-paper px-3.5 py-2 text-[0.75rem] font-medium text-ink hover:border-marigold transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="mono rounded bg-marigold px-4 py-2 text-[0.75rem] font-bold text-paper hover:bg-marigold/90 transition-transform hover:scale-105 shadow-sm"
              >
                Register Team
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* STYLISH RESPONSIVE SIDEBAR DRAWER */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex bg-ink/50 backdrop-blur-sm transition-opacity">
          <div
            ref={sidebarRef}
            className="relative flex w-full max-w-xs flex-col border-r border-line bg-paper p-6 shadow-2xl transition-transform duration-300 overflow-y-auto"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2.5">
                <img src="/nagarjuna-logo.webp" alt="Logo" className="h-8 w-auto" />
                <span className="font-display text-lg font-bold">Ignite Menu</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded border border-line text-ink hover:bg-paper-3"
              >
                ✕
              </button>
            </div>

            {/* Sidebar Navigation Link Groups */}
            <div className="mt-5 space-y-6">
              {SIDEBAR_GROUPS.map((group) => (
                <div key={group.heading}>
                  <div className="mono text-[0.62rem] font-bold uppercase tracking-wider text-marigold mb-2">
                    {group.heading}
                  </div>
                  <div className="space-y-1">
                    {group.links.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'mono flex items-center gap-3 rounded-md px-3 py-2.5 text-[0.8rem] text-ink-soft transition-colors hover:bg-paper-3 hover:text-ink',
                            isActive && 'bg-paper-3 text-ink font-bold border-l-2 border-marigold'
                          )
                        }
                      >
                        <span className="text-base">{link.icon}</span>
                        <span>{link.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Footer User Info / Actions */}
            <div className="mt-8 border-t border-line pt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="mono text-[0.75rem] text-ink-soft">
                    Logged in as: <strong className="text-ink">{user.name}</strong> ({user.role})
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
          </div>
        </div>
      )}
    </>
  );
}
