'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useGetGenericMasterByKeyQuery } from '../store/api/commonApi';
import { useGetCategoryCountsQuery } from '../store/api/videoApi';
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

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function Sidebar() {
  const { data: categoryData = [], isLoading } = useGetGenericMasterByKeyQuery('category');
  const { data: categoryCounts = [], isLoading: countsLoading } = useGetCategoryCountsQuery();
  const [filter, setFilter] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || '';

  const countMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of categoryCounts) {
      if (row.category) {
        map.set(row.category.toLowerCase(), row.count);
      }
    }
    return map;
  }, [categoryCounts]);

  const filteredCategories = useMemo(() => {
    const q = filter.toLowerCase();
    return (categoryData as { _id: string; value: string }[])
      .filter((cat) => cat.value.toLowerCase().includes(q))
      .map((cat) => ({
        ...cat,
        count: countMap.get(cat.value.toLowerCase()) ?? 0,
      }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.value.localeCompare(b.value);
      });
  }, [categoryData, filter, countMap]);

  return (
    <div
      className={`theme-shell min-h-full flex-shrink-0 py-3 transition-all duration-300 hidden md:flex flex-col border-r ${isCollapsed ? 'w-16' : 'w-60'}`}
    >
      <div className="px-3 flex justify-end mb-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-grey-60 hover:text-primary hover:bg-dark-15 transition-colors"
        >
          {isCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
        </button>
      </div>
      <div className="px-3 space-y-1">

        {/* Library */}
        {!isCollapsed && <p className="sidebar-section-title">Library</p>}
        <SidebarLink href="/subscriptions" icon={RssIcon} label="Subscriptions" isCollapsed={isCollapsed} />
        <SidebarLink href="/categories" icon={TagIcon} label="Categories" isCollapsed={isCollapsed} />

        <div className="my-3 border-t theme-hairline" />

        {/* Discover */}
        {!isCollapsed && <p className="sidebar-section-title">Discover</p>}
        <SidebarLink href="/?sortBy=views&sortOrder=desc" icon={FireIcon} label="Trending" isCollapsed={isCollapsed} />
        <SidebarLink href="/?sortBy=createdAt&sortOrder=desc" icon={ClockIcon} label="Newest Videos" isCollapsed={isCollapsed} />
        <SidebarLink href="/?sortBy=views&sortOrder=desc" icon={HandThumbUpIcon} label="Most Viewed" isCollapsed={isCollapsed} />

        <div className="my-3 border-t theme-hairline" />

        {/* Categories */}
        {!isCollapsed && <p className="sidebar-section-title">Categories</p>}
        {!isCollapsed && (
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Filter categories..."
              className="w-full h-9 bg-dark-10 rounded-lg py-1.5 px-3 pl-8 text-xs text-grey-70 placeholder-grey-60 border border-dark-25 focus:outline-none focus:border-red-45/40 focus:bg-dark-12 transition-colors"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-grey-60" />
          </div>
        )}

        <div
          className={`overflow-y-auto pr-1 ${isCollapsed ? 'space-y-2 flex flex-col items-center' : 'flex flex-col gap-1'}`}
          style={{ maxHeight: '300px', scrollbarWidth: 'thin' }}
        >
          {isLoading || countsLoading ? (
            <>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`${isCollapsed ? 'h-8 w-8' : 'h-9 w-full'} rounded-lg animate-pulse theme-soft-fill-strong`}
                />
              ))}
            </>
          ) : filteredCategories.length === 0 ? (
            !isCollapsed && <p className="text-xs text-grey-60 px-2 py-2 w-full">No matching categories</p>
          ) : (
            filteredCategories.map((cat) => {
              const isActive = activeCategory.toLowerCase() === cat.value.toLowerCase();
              return isCollapsed ? (
                <Link
                  key={cat._id}
                  href={`/?category=${encodeURIComponent(cat.value)}`}
                  className={`sidebar-link justify-center px-0 w-10 text-xs ${isActive ? 'active' : ''}`}
                  title={`${cat.value} (${cat.count})`}
                >
                  <TagIcon className="h-4.5 w-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
                </Link>
              ) : (
                <Link
                  key={cat._id}
                  href={`/?category=${encodeURIComponent(cat.value)}`}
                  className={`flex items-center justify-between gap-2 w-full min-h-[36px] px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${
                    isActive
                      ? 'bg-red-45/15 text-primary border border-red-45/40'
                      : 'bg-dark-12/80 text-grey-70 hover:bg-dark-15 hover:text-primary border border-transparent hover:border-dark-25'
                  }`}
                >
                  <span className="truncate flex-1 text-left">{cat.value}</span>
                  <span
                    className={`flex-shrink-0 min-w-[1.5rem] text-center text-[10px] px-1.5 py-0.5 rounded-md tabular-nums ${
                      isActive ? 'bg-red-45/30 text-primary' : 'bg-dark-20 text-grey-60'
                    }`}
                  >
                    {formatCount(cat.count)}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
