'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChartBarIcon,
  VideoCameraIcon,
  UsersIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  RectangleStackIcon,
} from '@heroicons/react/24/outline';
import { useAppSelector } from '../store/hooks';
import { selectCurrentUser } from '../store/slices/authSlice';

interface SideNavigationProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  onCollapse: (collapsed: boolean) => void;
}

export default function SideNavigation({ mobileOpen, onMobileClose, onCollapse }: SideNavigationProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const currentUser = useAppSelector(selectCurrentUser);
  // isSuperAdmin is only true after mount — Redux is null on SSR (localStorage unavailable)
  const isSuperAdmin = mounted && currentUser?.role === 'superadmin';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset collapse state when switching between mobile and desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) { // md breakpoint
        setIsCollapsed(false);
        onCollapse(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onCollapse]);

  const toggleDrawer = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapse(newCollapsed);
  };

  const menuItems = [
    { text: 'Dashboard', icon: ChartBarIcon, path: '/dashboard' },
    { text: 'Videos', icon: VideoCameraIcon, path: '/dashboard/videos' },
    { text: 'Users', icon: UsersIcon, path: '/dashboard/users' },
    { text: 'Channels', icon: UserCircleIcon, path: '/dashboard/channels' },
    { text: 'Payouts', icon: CurrencyDollarIcon, path: '/dashboard/payouts' },
    { text: 'Settings', icon: Cog6ToothIcon, path: '/dashboard/settings' },
    ...(isSuperAdmin
      ? [
        { text: 'Admin Payouts', icon: ShieldCheckIcon, path: '/dashboard/admin/payouts' },
        {
          text: 'Subscription plans',
          icon: RectangleStackIcon,
          path: '/dashboard/admin/subscriptions?tab=plans',
        },
      ]
      : []),
  ];

  const drawer = (
    <div className="h-full flex flex-col bg-dark-6">
      <div className="flex justify-end p-2 md:p-3">
        <button
          onClick={toggleDrawer}
          className="hidden md:block p-2 rounded-lg text-grey-70 hover:text-primary hover:bg-dark-15"
        >
          {isCollapsed ? (
            <ChevronRightIcon className="h-6 w-6" />
          ) : (
            <ChevronLeftIcon className="h-6 w-6" />
          )}
        </button>
      </div>

      <nav className="flex-1 px-2 py-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const pathBase = item.path.split('?')[0];
          const isActive = pathname === pathBase;
          return (
            <Link
              key={item.text}
              href={item.path}
              onClick={() => {
                if (window.innerWidth < 768) {
                  onMobileClose();
                }
              }}
              className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 ${isActive
                ? 'bg-red-45 text-primary'
                : 'text-grey-70 hover:text-primary hover:bg-dark-15'
                }`}
            >
              <Icon className="h-6 w-6 flex-shrink-0" />
              {!isCollapsed && <span className="truncate">{item.text}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile navigation overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile navigation drawer */}
      <div
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-[240px] 
          transform transition-transform duration-300 ease-in-out z-50
          md:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {drawer}
      </div>

      {/* Desktop navigation */}
      <div
        className={`
          hidden md:block fixed top-16 left-0 h-[calc(100vh-4rem)]
          transform transition-all duration-200 ease-in-out z-30
          ${isCollapsed ? 'w-[72px]' : 'w-[240px]'}
        `}
      >
        {drawer}
      </div>
    </>
  );
} 