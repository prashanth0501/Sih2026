import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth, hasRole } from '@/lib/auth';
import { cn } from '@/lib/utils';

// Primary Navbar options displayed on desktop header
const PRIMARY_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/problem-statements', label: 'Explorer' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/results', label: 'Results' },
];

// All links in the menu drawer
const ALL_LINKS = [
  { to: '/', label: 'Home', n: '00' },
  { to: '/why-sih', label: 'Why SIH', n: '01' },
  { to: '/why-join', label: 'Why Join', n: '02' },
  { to: '/timeline', label: 'Timeline', n: '03' },
  { to: '/problem-statements', label: 'Explorer', n: '04' },
  { to: '/rules', label: 'Rules', n: '05' },
  { to: '/spark-story', label: "Spark's Story", n: '06' },
  { to: '/people', label: 'People', n: '07' },
  { to: '/gallery', label: 'Gallery', n: '08' },
  { to: '/developers', label: 'Developers', n: '09' },
  { to: '/updates', label: 'Updates', n: '10' },
  { to: '/spread-the-spark', label: 'Spread the Spark', n: '11' },
  { to: '/results', label: 'Results', n: '12' },
  { to: '/faq', label: 'FAQ', n: '13' },
  { to: '/contact', label: 'Contact', n: '14' },
  { to: '/privacy', label: 'Privacy', n: '15' },
];

export function NavBar() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 sm:px-8 bg-paper/80 backdrop-blur-md border-b border-line/40">
      <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
        <img src="/nagarjuna-logo.webp" alt="NCET Logo" className="h-12 w-auto sm:h-14" width={144} height={144} />
        <span className="flex items-center gap-2.5">
          <span className="font-display text-[1.5rem] font-bold leading-none sm:text-[1.8rem]">Ignite</span>
          <span className="mono rounded-full bg-marigold px-2.5 py-1 text-[0.7rem] font-bold leading-none text-paper sm:text-[0.75rem]">
            SIH 2026
          </span>
        </span>
      </Link>

      {/* Center Primary Desktop Navigation Bar Links */}
      <nav className="hidden md:flex items-center gap-6 mono text-[0.78rem] text-ink-soft">
        {PRIMARY_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn('transition-colors hover:text-ink', isActive && 'text-ink font-bold underline decoration-marigold decoration-2 underline-offset-4')
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Right User Actions & Menu Drawer Toggle */}
      <div className="flex items-center gap-3" ref={menuRef}>
        {user ? (
          hasRole(user, 'coordinator') ? (
            <Link
              to="/admin"
              className="mono rounded bg-marigold px-3.5 py-2 text-[0.75rem] font-bold text-paper transition-transform hover:scale-105"
            >
              ★ Admin Panel
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="mono rounded bg-marigold px-3.5 py-2 text-[0.75rem] font-bold text-paper transition-transform hover:scale-105"
            >
              ★ Dashboard
            </Link>
          )
        ) : (
          <div className="hidden sm:flex items-center gap-2">
            <Link
              to="/login"
              className="mono rounded border border-line bg-paper px-3.5 py-2 text-[0.75rem] text-ink hover:border-marigold"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="mono rounded bg-marigold px-3 py-2 text-[0.75rem] font-bold text-paper hover:bg-marigold/90"
            >
              Register Team
            </Link>
          </div>
        )}

        {/* Menu Drawer Toggle Button */}
        <div className="relative">
          <button
            type="button"
            aria-haspopup="true"
            aria-expanded={open}
            aria-label="Open navigation menu"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((o) => !o);
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper/80 backdrop-blur shadow-sm hover:border-marigold"
          >
            ✦
          </button>

          {/* Expanded Drawer Sidebar */}
          <nav
            className={cn(
              'absolute right-0 top-14 grid max-h-[calc(100vh-88px)] w-64 gap-0.5 overflow-y-auto rounded-sm border border-line bg-paper-2 p-3 shadow-2xl shadow-ink/10 transition-all duration-200',
              'max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:right-auto max-md:max-h-[80vh] max-md:w-full max-md:rounded-t-2xl max-md:rounded-b-none max-md:p-4',
              open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'pointer-events-none opacity-0 -translate-y-2 max-md:translate-y-full'
            )}
          >
            <div className="mono text-[0.62rem] text-ink-soft uppercase px-3 py-1 font-bold">All Navigation Options</div>
            {ALL_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'mono flex items-center gap-2.5 rounded-[2px] px-3 py-2.5 text-[0.72rem] text-ink-soft hover:bg-paper-3 hover:text-ink max-md:py-3.5',
                    isActive && 'text-ink bg-paper-3 font-bold'
                  )
                }
              >
                <span className="text-marigold">{link.n}</span> {link.label}
              </NavLink>
            ))}
            <div className="my-2 border-t border-line" />
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="mono flex items-center gap-2.5 rounded-[2px] px-3 py-2.5 text-left text-[0.72rem] text-ink-soft hover:bg-paper-3 hover:text-ink max-md:py-3.5"
              >
                <span className="text-marigold">→</span> Log out ({user.name})
              </button>
            ) : (
              <div className="grid gap-1 sm:hidden">
                <NavLink
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="mono flex items-center gap-2.5 rounded-[2px] px-3 py-2.5 text-[0.72rem] text-ink-soft hover:bg-paper-3 hover:text-ink"
                >
                  <span className="text-marigold">→</span> Log in
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="mono flex items-center gap-2.5 rounded-[2px] px-3 py-2.5 text-[0.72rem] text-marigold font-bold hover:bg-paper-3"
                >
                  <span className="text-marigold">→</span> Register team
                </NavLink>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
