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
} from '@heroicons/react/24/outline';

function SidebarLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`sidebar-link ${isActive ? 'active' : ''}`}
    >
      <Icon className="h-4.5 w-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const { data: categoryData = [], isLoading } = useGetGenericMasterByKeyQuery('category');
  const [filter, setFilter] = useState('');

  const filteredCategories = (categoryData as any[]).filter((cat: any) =>
    cat.value.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div
      className="w-60 min-h-full flex-shrink-0 py-3"
      style={{ background: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="px-3 space-y-1">

        {/* Library */}
        <p className="sidebar-section-title">Library</p>
        <SidebarLink href="/subscriptions" icon={RssIcon} label="Subscriptions" />
        <SidebarLink href="/categories" icon={TagIcon} label="Categories" />

        <div className="my-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }} />

        {/* Discover */}
        <p className="sidebar-section-title">Discover</p>
        <SidebarLink href="/?sortBy=views&sortOrder=desc" icon={FireIcon} label="Trending" />
        <SidebarLink href="/?sortBy=createdAt&sortOrder=desc" icon={ClockIcon} label="Newest Videos" />
        <SidebarLink href="/?sortBy=views&sortOrder=desc" icon={HandThumbUpIcon} label="Most Viewed" />

        <div className="my-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }} />

        {/* Categories */}
        <p className="sidebar-section-title">Categories</p>
        <div className="relative mb-2">
          <input
            type="text"
            placeholder="Filter categories..."
            className="w-full h-8 bg-dark-12 rounded-lg py-1.5 px-3 pl-8 text-xs text-grey-70 placeholder-grey-60 border border-dark-20/50 focus:outline-none focus:border-dark-25 transition-colors"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-grey-60" />
        </div>

        <div className="max-h-[300px] overflow-y-auto pr-1 space-y-0.5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}>
          {isLoading ? (
            <>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
              ))}
            </>
          ) : filteredCategories.length === 0 ? (
            <p className="text-xs text-grey-60 px-2 py-2">No matching categories</p>
          ) : (
            filteredCategories.map((cat: any) => (
              <Link
                key={cat._id}
                href={`/?category=${encodeURIComponent(cat.value)}`}
                className="sidebar-link text-xs"
              >
                <TagIcon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{cat.value}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}