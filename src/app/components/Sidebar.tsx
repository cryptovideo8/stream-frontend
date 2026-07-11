'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGetGenericMasterByKeyQuery } from '../store/api/commonApi';
import {
  RssIcon,
  HandThumbUpIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  TagIcon,
  FireIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

function SidebarLink({ href, icon: Icon, label, isCollapsed }: { href: string; icon: React.ElementType; label: string; isCollapsed: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`sidebar-link ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center px-0' : ''}`}
      title={isCollapsed ? label : undefined}
    >
      <Icon className="h-4.5 w-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );
}

export default function Sidebar() {
  const { data: categoryData = [], isLoading } = useGetGenericMasterByKeyQuery('category');
  const [filter, setFilter] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredCategories = (categoryData as any[]).filter((cat: any) =>
    cat.value.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div
      className={`min-h-full flex-shrink-0 py-3 transition-all duration-300 hidden md:flex flex-col ${isCollapsed ? 'w-16' : 'w-60'}`}
      style={{ background: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="px-3 flex justify-end mb-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-grey-60 hover:text-white hover:bg-dark-15 transition-colors"
        >
          {isCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
        </button>
      </div>
      <div className="px-3 space-y-1">

        {/* Library */}
        {!isCollapsed && <p className="sidebar-section-title">Library</p>}
        <SidebarLink href="/subscriptions" icon={RssIcon} label="Subscriptions" isCollapsed={isCollapsed} />
        <SidebarLink href="/categories" icon={TagIcon} label="Categories" isCollapsed={isCollapsed} />

        <div className="my-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }} />

        {/* Discover */}
        {!isCollapsed && <p className="sidebar-section-title">Discover</p>}
        <SidebarLink href="/?sortBy=views&sortOrder=desc" icon={FireIcon} label="Trending" isCollapsed={isCollapsed} />
        <SidebarLink href="/?sortBy=createdAt&sortOrder=desc" icon={ClockIcon} label="Newest Videos" isCollapsed={isCollapsed} />
        <SidebarLink href="/?sortBy=views&sortOrder=desc" icon={HandThumbUpIcon} label="Most Viewed" isCollapsed={isCollapsed} />

        <div className="my-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }} />

        {/* Categories */}
        {!isCollapsed && <p className="sidebar-section-title">Categories</p>}
        {!isCollapsed && (
          <div className="relative mb-3">
          <input
            type="text"
            placeholder="Filter categories..."
            className="w-full h-8 bg-dark-12 rounded-lg py-1.5 px-3 pl-8 text-xs text-grey-70 placeholder-grey-60 border border-dark-20/50 focus:outline-none focus:border-dark-25 transition-colors"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-grey-60" />
        </div>
        )}

        <div className={`overflow-y-auto pr-1 ${isCollapsed ? 'space-y-2 flex flex-col items-center' : 'flex flex-wrap gap-1.5'}`} style={{ maxHeight: '300px', scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}>
          {isLoading ? (
            <>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`${isCollapsed ? 'h-8 w-8' : 'h-7 w-16'} rounded-full animate-pulse`} style={{ background: 'rgba(255,255,255,0.05)' }} />
              ))}
            </>
          ) : filteredCategories.length === 0 ? (
            !isCollapsed && <p className="text-xs text-grey-60 px-2 py-2 w-full">No matching categories</p>
          ) : (
            filteredCategories.map((cat: any) => (
              isCollapsed ? (
                <Link
                  key={cat._id}
                  href={`/?category=${encodeURIComponent(cat.value)}`}
                  className="sidebar-link justify-center px-0 w-10 text-xs"
                  title={cat.value}
                >
                  <TagIcon className="h-4.5 w-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
                </Link>
              ) : (
                <Link
                  key={cat._id}
                  href={`/?category=${encodeURIComponent(cat.value)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-dark-12 text-grey-70 hover:bg-dark-15 hover:text-white border border-dark-20/50 hover:border-dark-25 transition-all"
                >
                  <span className="truncate max-w-[100px]">{cat.value}</span>
                  <span className="bg-dark-20 text-[9px] px-1.5 py-0.5 rounded-full text-grey-60">{Math.floor(Math.random() * 100) + 10}</span>
                </Link>
              )
            ))
          )}
        </div>
      </div>
    </div>
  );
}