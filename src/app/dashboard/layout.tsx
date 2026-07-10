'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/SideNavigation';
import DashboardHeader from '../components/DashboardHeader';
import DashboardFooter from '../components/DashboardFooter';
import { useAppSelector } from '../store/hooks';
import { selectIsAuthenticated, selectToken, selectCurrentUser } from '../store/slices/authSlice';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const token = useAppSelector(selectToken);
  const user = useAppSelector(selectCurrentUser);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    let role = user?.role;
    if (!role && typeof window !== 'undefined') {
      try {
        role = JSON.parse(localStorage.getItem('user') || 'null')?.role;
      } catch {
        role = undefined;
      }
    }

    if (!t && !isAuthenticated) {
      router.replace('/login?next=/dashboard');
      return;
    }
    if (role === 'viewer') {
      router.replace('/');
      return;
    }
    setReady(true);
  }, [isAuthenticated, token, user, router]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-dark-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-45" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-dark-6 text-primary">
      <DashboardHeader onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />
      <div className="flex flex-1 pt-16">
        <Navigation
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          onCollapse={setIsCollapsed}
        />
        <main
          className={`
              flex-1 min-h-[calc(100vh-4rem)] overflow-y-auto p-4 sm:p-6 transition-all duration-200
              ${mobileOpen ? 'blur-sm md:blur-none pointer-events-none md:pointer-events-auto' : ''}
              ${isCollapsed ? 'md:ml-[72px]' : 'md:ml-[240px]'}
            `}
        >
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
      <div className={`relative ${isCollapsed ? 'md:ml-[72px]' : 'md:ml-[240px]'} transition-all duration-200`}>
        <DashboardFooter />
      </div>
    </div>
  );
}
