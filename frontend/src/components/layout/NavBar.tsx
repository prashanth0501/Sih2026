import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth, hasRole } from '@/lib/auth';
import { cn } from '@/lib/utils';

const LINKS = [
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
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 sm:px-8">
      <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
        <img src="/nagarjuna-logo.webp" alt="" className="h-14 w-auto sm:h-16" width={144} height={144} />
        <span className="flex items-center gap-2.5">
          <span className="font-display text-[1.6rem] font-bold leading-none sm:text-[1.9rem]">Ignite</span>
          <span className="mono rounded-full bg-marigold px-2.5 py-1 text-[0.72rem] font-bold leading-none text-paper sm:text-[0.8rem]">
            SIH 2026
          </span>
        </span>
      </Link>

      <div className="flex items-center gap-2.5" ref={menuRef}>
        <div className="relative">
          <button
            type="button"
            aria-haspopup="true"
            aria-expanded={open}
            aria-label="Open navigation"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((o) => !o);
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper/70 backdrop-blur"
          >
            ✦
          </button>

          <nav
            className={cn(
              'absolute right-0 top-14 grid max-h-[calc(100vh-88px)] w-64 gap-0.5 overflow-y-auto rounded-sm border border-line bg-paper-2 p-2.5 shadow-2xl shadow-ink/10 transition-all duration-200',
              'max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:right-auto max-md:max-h-[80vh] max-md:w-full max-md:rounded-t-2xl max-md:rounded-b-none max-md:p-4',
              open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'pointer-events-none opacity-0 -translate-y-2 max-md:translate-y-full'
            )}
          >
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'mono flex items-center gap-2.5 rounded-[2px] px-3 py-2.5 text-[0.7rem] text-ink-soft hover:bg-paper-3 hover:text-ink max-md:py-3.5 max-md:text-[0.76rem]',
                    isActive && 'text-ink bg-paper-3'
                  )
                }
              >
                <span className="text-marigold">{link.n}</span> {link.label}
              </NavLink>
            ))}
            <div className="my-1.5 border-t border-line" />
            {user ? (
              <>
                {hasRole(user, 'coordinator') ? (
                  <NavLink
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="mono flex items-center gap-2.5 rounded-[2px] px-3 py-2.5 text-[0.7rem] text-ink-soft hover:bg-paper-3 hover:text-ink max-md:py-3.5"
                  >
                    <span className="text-marigold">★</span> Admin panel
                  </NavLink>
                ) : (
                  <NavLink
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="mono flex items-center gap-2.5 rounded-[2px] px-3 py-2.5 text-[0.7rem] text-ink-soft hover:bg-paper-3 hover:text-ink max-md:py-3.5"
                  >
                    <span className="text-marigold">★</span> Dashboard
                  </NavLink>
                )}
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="mono flex items-center gap-2.5 rounded-[2px] px-3 py-2.5 text-left text-[0.7rem] text-ink-soft hover:bg-paper-3 hover:text-ink max-md:py-3.5"
                >
                  <span className="text-marigold">→</span> Log out ({user.name})
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="mono flex items-center gap-2.5 rounded-[2px] px-3 py-2.5 text-[0.7rem] text-ink-soft hover:bg-paper-3 hover:text-ink max-md:py-3.5"
                >
                  <span className="text-marigold">→</span> Log in
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="mono flex items-center gap-2.5 rounded-[2px] px-3 py-2.5 text-[0.7rem] text-ink-soft hover:bg-paper-3 hover:text-ink max-md:py-3.5"
                >
                  <span className="text-marigold">→</span> Register your team
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
