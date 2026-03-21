'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  GlobeAltIcon,
  VideoCameraIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon,
  PhotoIcon,
  StarIcon,
  HandThumbUpIcon,
  ClockIcon,
  ChevronDownIcon,
  HomeIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  PresentationChartLineIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAppSelector } from '../store/hooks';
import { selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice';
import { useLogoutMutation } from '../store/api/authApi';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

interface HeaderProps {
  hideNavMenu?: boolean;
}

export default function Header({ hideNavMenu = false }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropDown, setProfileDropDown] = useState(false);
  const [videosDropDown, setVideosDropDown] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileRef = useRef<HTMLDivElement>(null);
  const videosRef = useRef<HTMLLIElement>(null);

  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const dispatch = useDispatch();

  const userName = user?.name || 'Guest';
  const userEmail = user?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) setSearchQuery(search);
  }, [searchParams]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropDown(false);
      }
      if (videosRef.current && !videosRef.current.contains(e.target as Node)) {
        setVideosDropDown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      // Best-effort server logout — we don't block on failure
      await logoutMutation().unwrap();
    } catch {
      // Session may have already expired on server (404 or 401) — still log out client
    } finally {
      // Clear client state via Redux (syncs with localStorage automatically)
      dispatch(logout());
      toast.success('Logged out successfully');
      router.push('/login');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearch(false);
    }
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/categories', label: 'Categories' },
  ];

  return (
    <header
      className="fixed w-full z-[9999] shadow-header"
      style={{
        background: 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-3">

        {/* Logo */}
        <Link
          href="/"
          className="flex-shrink-0 text-xl font-black tracking-tight"
          style={{ background: 'linear-gradient(135deg, #E30000, #FF5555)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          NightKing
        </Link>

        {/* Desktop Search */}
        <form
          onSubmit={handleSearch}
          className="hidden sm:flex flex-1 max-w-xl"
        >
          <div className="relative w-full group">
            <input
              type="text"
              placeholder="Search videos, creators, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 bg-dark-12 rounded-full py-2 pl-4 pr-10 text-sm text-white placeholder-grey-60 border border-dark-25 focus:outline-none focus:border-red-45/60 focus:bg-dark-10 transition-all duration-200"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-60 hover:text-red-45 transition-colors"
            >
              <MagnifyingGlassIcon className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile Search Toggle */}
          <button
            className="sm:hidden p-2 text-grey-70 hover:text-white transition-colors"
            onClick={() => setMobileSearch(!mobileSearch)}
          >
            {mobileSearch ? <XMarkIcon className="h-5 w-5" /> : <MagnifyingGlassIcon className="h-5 w-5" />}
          </button>

          {/* Language */}
          <button className="hidden sm:flex items-center gap-1 p-2 text-grey-70 hover:text-white text-sm transition-colors">
            <GlobeAltIcon className="h-4 w-4" />
            <span className="text-xs font-medium">EN</span>
          </button>

          {/* Auth section — only render on client to avoid hydration mismatch */}
          {!mounted ? (
            /* SSR placeholder */
            <div className="w-[130px] h-8" />
          ) : (
            <>
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/login"
                    className="px-3 py-1.5 text-sm text-grey-70 hover:text-white border border-dark-25 hover:border-dark-30 rounded-lg font-medium transition-all duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-3 py-1.5 text-sm bg-red-45 hover:bg-red-55 rounded-lg font-semibold text-white transition-all duration-200 shadow-md shadow-red-45/20"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <div className="relative" ref={profileRef}>
                  <button
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-dark-15 transition-colors"
                    onClick={() => setProfileDropDown(!profileDropDown)}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden border-2"
                      style={{ borderColor: profileDropDown ? '#E30000' : 'rgba(255,255,255,0.1)', transition: 'border-color 0.2s' }}
                    >
                      {avatarError ? (
                        <span>{userInitial}</span>
                      ) : (
                        <img
                          src="/avatar.jpg"
                          alt={`${userName}`}
                          className="w-full h-full object-cover"
                          onError={() => setAvatarError(true)}
                        />
                      )}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium text-grey-70 hover:text-white transition-colors">
                      {userName}
                    </span>
                    <ChevronDownIcon className={`h-3.5 w-3.5 text-grey-60 transition-transform duration-200 ${profileDropDown ? 'rotate-180' : ''}`} />
                  </button>

                  {profileDropDown && (
                    <div className="dropdown-menu min-w-[200px] animate-fade-in">
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-white/[0.06]">
                        <p className="text-sm font-semibold text-white">{userName}</p>
                        <p className="text-xs text-grey-60 mt-0.5">{userEmail}</p>
                      </div>
                      <div className="py-1">
                        <Link href="/" className="dropdown-item" onClick={() => setProfileDropDown(false)}>
                          <HomeIcon className="h-4 w-4" /> Home
                        </Link>
                        {isAuthenticated && user?.role && user.role !== 'viewer' && (
                          <Link href="/dashboard" className="dropdown-item" onClick={() => setProfileDropDown(false)}>
                            <PresentationChartLineIcon className="h-4 w-4" /> Dashboard
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-white/[0.06] py-1">
                        <button onClick={handleLogout} className="dropdown-item text-red-45 hover:text-red-55 hover:bg-red-45/5">
                          <ArrowRightOnRectangleIcon className="h-4 w-4" /> Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      {mobileSearch && (
        <div className="sm:hidden px-4 pb-3 animate-slide-up">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full h-9 bg-dark-12 rounded-full py-2 pl-4 pr-10 text-sm text-white placeholder-grey-60 border border-dark-25 focus:outline-none focus:border-red-45/60 transition-all"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-60">
                <MagnifyingGlassIcon className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Navigation Bar */}
      {!hideNavMenu && (
        <nav className="header-subnav" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="header-subnav-inner">
            <ul className="header-subnav-list">

              {/* Videos Dropdown */}
              <li className="relative" ref={videosRef}>
                <button
                  className={`nav-link ${videosDropDown ? 'active' : ''}`}
                  onMouseEnter={() => setVideosDropDown(true)}
                  onMouseLeave={() => setVideosDropDown(false)}
                >
                  <VideoCameraIcon className="h-4 w-4" />
                  <span>Videos</span>
                  <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-200 ${videosDropDown ? 'rotate-180' : ''}`} />
                </button>
                {videosDropDown && (
                  <div
                    className="absolute top-full left-0 mt-1 min-w-[180px] rounded-xl shadow-2xl shadow-black/50 py-1.5 animate-fade-in"
                    style={{ background: 'rgba(20,20,20,0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', zIndex: 99999 }}
                    onMouseEnter={() => setVideosDropDown(true)}
                    onMouseLeave={() => setVideosDropDown(false)}
                  >
                    <Link href="/?sortBy=views&sortOrder=desc" className="dropdown-item">
                      <HandThumbUpIcon className="h-4 w-4" /> Best Videos
                    </Link>
                    <Link href="/?sortBy=createdAt&sortOrder=desc" className="dropdown-item">
                      <ClockIcon className="h-4 w-4" /> Newest
                    </Link>
                    <div className="my-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                    <Link href="/?category=Indian" className="dropdown-item">
                      <span className="text-sm">🇮🇳</span> Indian
                    </Link>
                    <Link href="/?category=Amateur" className="dropdown-item">Amateur</Link>
                    <Link href="/?category=Mature" className="dropdown-item">Mature</Link>
                  </div>
                )}
              </li>

              {/* Regular nav items */}
              {navItems.slice(1).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}

              {/* Premium */}
              <li>
                <Link
                  href="/?monetization=premium"
                  className="nav-link text-amber-400 hover:text-amber-300"
                >
                  <StarIcon className="h-4 w-4" />
                  <span>Premium</span>
                </Link>
              </li>

              {/* Dashboard for creators — only render on client */}
              {mounted && isAuthenticated && user?.role && user.role !== 'viewer' && (
                <li>
                  <Link
                    href="/dashboard"
                    className={`nav-link ${pathname?.startsWith('/dashboard') ? 'active' : ''}`}
                  >
                    <PresentationChartLineIcon className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </nav>
      )}
    </header>
  );
}
