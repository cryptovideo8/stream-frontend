'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Compass, User } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import { selectIsAuthenticated } from '../store/slices/authSlice';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  // Avoid SSR/client mismatch: Redux auth is hydrated from localStorage only on the client
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const profileHref = mounted && isAuthenticated ? '/profile' : '/login';

  const navItems = [
    { name: 'Home', href: '/', icon: Home, match: (path: string) => path === '/' },
    {
      name: 'Search',
      href: '/search',
      icon: Search,
      match: (path: string) => path === '/search' || path.startsWith('/search/'),
    },
    {
      name: 'Categories',
      href: '/categories',
      icon: Compass,
      match: (path: string) => path === '/categories' || path.startsWith('/categories/'),
    },
    {
      name: 'Profile',
      href: profileHref,
      icon: User,
      match: (path: string) =>
        path === '/profile' || path === '/login' || path === '/signup' || path.startsWith('/profile/'),
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-strong shadow-bottom-nav pb-safe bg-dark-8/90">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = item.match(pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative group transition-colors duration-200 ${
                isActive ? 'text-red-45' : 'text-grey-60 hover:text-white'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-red-45/10 rounded-xl m-1 pointer-events-none" />
              )}

              <div
                className={`relative transition-transform duration-200 group-active:animate-icon-press ${
                  isActive ? 'animate-bounce-subtle' : ''
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-45 rounded-full shadow-glow-red" />
                )}
              </div>

              <span
                className={`text-[10px] font-medium tracking-wide ${
                  isActive ? 'text-red-45 font-semibold' : ''
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
