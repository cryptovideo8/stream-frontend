'use client';

import { useState, useEffect } from 'react';
import Navigation from '../components/SideNavigation';
import DashboardHeader from '../components/DashboardHeader';
import DashboardFooter from '../components/DashboardFooter';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark-6 text-primary">
      <DashboardHeader onMobileMenuToggle={handleDrawerToggle} />

      {/* Main content area */}
      <div className="flex flex-1 pt-16">
        <Navigation
          mobileOpen={mobileOpen}
          onMobileClose={handleDrawerToggle}
          onCollapse={handleCollapse}
        />

        {/* Main content wrapper */}
        <main
          className={`
              flex-1 
              min-h-[calc(100vh-4rem)] 
              overflow-y-auto
              p-4 sm:p-6 
              transition-all duration-200 
              ${mobileOpen ? 'blur-sm md:blur-none pointer-events-none md:pointer-events-auto' : ''} 
              ${isCollapsed ? 'md:ml-[72px]' : 'md:ml-[240px]'}
            `}
        >
          {/* Content container with max width */}
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <div className={`
          relative 
          ${isCollapsed ? 'md:ml-[72px]' : 'md:ml-[240px]'}
          transition-all duration-200
        `}>
        <DashboardFooter />
      </div>
    </div>
  );
}