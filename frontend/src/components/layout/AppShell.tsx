import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

export type AppNavItem = { to: string; label: string };

export function AppShell({ title, navItems }: { title: string; navItems: AppNavItem[] }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-paper-2">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-paper px-4 py-3 sm:px-8">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded border border-line text-ink sm:hidden"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <img src="/nagarjuna-logo.webp" alt="Nagarjuna Logo" className="h-7 w-auto" />
            <span className="font-display text-[0.95rem] font-bold">
              Ignite <span className="mono text-[0.6rem] font-normal text-ink-soft">/ {title}</span>
            </span>
          </Link>
        </div>

        <div className="mono flex items-center gap-3 text-[0.72rem] text-ink-soft">
          <span className="hidden text-ink sm:inline font-medium">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="rounded bg-paper-3 px-2.5 py-1 text-marigold hover:underline sm:bg-transparent sm:p-0"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Mobile Horizontal Sub-nav Strip (Quick access on phones) */}
      <div className="border-b border-line bg-paper px-4 py-2 sm:hidden overflow-x-auto">
        <div className="flex items-center gap-2 w-max text-[0.75rem] mono">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'rounded px-3 py-1.5 transition-colors text-ink-soft hover:text-ink',
                  isActive && 'bg-paper-3 text-ink font-semibold border border-line'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-[1400px]">
        {/* Desktop Sidebar Nav */}
        <nav className="mono sticky top-[53px] hidden h-[calc(100vh-53px)] w-60 shrink-0 flex-col gap-1.5 border-r border-line bg-paper p-4 text-[0.75rem] sm:flex">
          <div className="mb-2 text-[0.62rem] font-bold tracking-wider text-marigold uppercase">Portal Quick Access</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  'rounded-xl px-3.5 py-2.5 text-ink-soft transition-all hover:bg-paper-3 hover:text-ink',
                  isActive && 'bg-marigold/15 text-marigold font-bold border-l-4 border-marigold'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile Slide-out Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex flex-col bg-paper p-6 sm:hidden">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <span className="font-display font-bold text-lg">SIH 2026 Portal Menu</span>
              <button onClick={() => setMobileOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-lg font-bold">✕</button>
            </div>
            <div className="mono mt-4 flex flex-col gap-2 text-[0.9rem]">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl p-3 text-ink-soft transition-all',
                      isActive && 'bg-marigold/15 text-marigold font-bold border-l-4 border-marigold'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
