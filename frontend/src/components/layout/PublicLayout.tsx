import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar';
import { Footer } from './Footer';
import { MarginRail } from './MarginRail';
import { CallToAction } from './CallToAction';
import { cn } from '@/lib/utils';

export function PublicLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-paper">
      <div className="grain" />
      <div className="lattice" />
      <MarginRail />
      <NavBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Area — dynamically adjusts layout margin when sidebar is docked open */}
      <main
        className={cn(
          'relative z-[3] flex-1 pt-16 transition-all duration-300',
          sidebarOpen && 'lg:pl-80'
        )}
      >
        <Outlet />
      </main>

      {/* Global Call To Action Banner on every public page + Footer */}
      <div className={cn('mt-auto shrink-0 relative z-[3] transition-all duration-300', sidebarOpen && 'lg:pl-80')}>
        <CallToAction />
        <Footer />
      </div>
    </div>
  );
}
