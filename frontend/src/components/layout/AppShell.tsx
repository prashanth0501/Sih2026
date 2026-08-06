import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

export type AppNavItem = { to: string; label: string };

export function AppShell({ title, navItems }: { title: string; navItems: AppNavItem[] }) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-paper-2">
      <header className="flex items-center justify-between border-b border-line bg-paper px-5 py-3.5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/nagarjuna-logo.webp" alt="" className="h-7 w-auto" />
          <span className="font-display text-[0.95rem] font-bold">
            Ignite <span className="mono text-[0.55rem] font-normal text-ink-soft">/ {title}</span>
          </span>
        </Link>
        <div className="mono flex items-center gap-4 text-[0.68rem] text-ink-soft">
          <span>{user?.name}</span>
          <button onClick={logout} className="text-marigold hover:underline">
            Log out
          </button>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1400px] gap-0">
        <nav className="mono sticky top-0 hidden h-[calc(100vh-57px)] w-56 shrink-0 flex-col gap-1 border-r border-line bg-paper p-4 text-[0.7rem] sm:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                cn(
                  'rounded-[2px] px-3 py-2.5 text-ink-soft hover:bg-paper-3 hover:text-ink',
                  isActive && 'bg-paper-3 text-ink'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <main className="min-w-0 flex-1 p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
