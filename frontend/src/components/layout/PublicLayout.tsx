import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar';
import { Footer } from './Footer';
import { MarginRail } from './MarginRail';
import { SparkThread } from '@/components/SparkThread';

export function PublicLayout() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-paper">
      <div className="grain" />
      <div className="lattice" />
      <MarginRail />
      <SparkThread />
      <NavBar />
      <main className="relative z-[3] flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
