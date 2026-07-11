'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSearchVideosQuery, VideoDetail } from '../../../store/api/videoApi';

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatDuration(sec?: number) {
  if (sec == null || Number.isNaN(sec)) return '';
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m.toString().padStart(2, '0')}:${r.toString().padStart(2, '0')}`;
}

function VideoCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-dark-12 border border-dark-20/20">
      <div className="aspect-video bg-dark-15 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"
          style={{ backgroundSize: '200% 100%' }}
        />
      </div>
      <div className="p-3 space-y-2">
        <div className="h-4 rounded bg-dark-15 w-[85%]" />
        <div className="h-3 rounded bg-dark-15 w-[50%]" />
      </div>
    </div>
  );
}

function VideoCard({ video }: { video: VideoDetail }) {
  const isPremium = ['rent', 'paid'].includes(video.monetization?.type || '');
  const href = video.type === 'thirdparty' ? video.filePath : `/watch/${video._id}`;
  const isExternal = video.type === 'thirdparty';

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : '_self'}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="video-card block group"
    >
      <div className="video-card-thumb">
        <img
          src={video.thumbnailPath || '/placeholder.jpg'}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {isPremium && <span className="badge-premium">Premium</span>}
        {video.duration ? (
          <span className="badge-duration">{formatDuration(video.duration)}</span>
        ) : null}
      </div>
      <div className="p-2.5">
        <h3 className="text-sm font-medium text-primary line-clamp-2 leading-snug group-hover:text-red-45 transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-grey-60">
          <span>{formatCount(video.stats?.views || 0)} views</span>
          {video.channel?.name && (
            <>
              <span>•</span>
              <span className="truncate">{video.channel.name}</span>
            </>
          )}
        </div>
      </div>
    </a>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  const [inputValue, setInputValue] = useState(urlQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(urlQuery);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setInputValue(urlQuery);
    setDebouncedQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = inputValue.trim();
      setDebouncedQuery(trimmed);
      setPage(1);

      const params = new URLSearchParams();
      if (trimmed) params.set('q', trimmed);
      const next = params.toString() ? `/search?${params.toString()}` : '/search';
      const current = urlQuery ? `/search?q=${encodeURIComponent(urlQuery)}` : '/search';
      if (next !== current) {
        router.replace(next, { scroll: false });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [inputValue, router, urlQuery]);

  const { data, isLoading, isFetching, isError } = useSearchVideosQuery(
    {
      page: 1,
      limit: 20 * page,
      search: debouncedQuery || undefined,
      sortBy: 'views',
      sortOrder: 'desc',
    },
    { skip: !debouncedQuery }
  );

  const videos = data?.videos || [];
  const total = data?.total || 0;
  const hasMore = videos.length < total;

  const clearSearch = () => {
    setInputValue('');
    setDebouncedQuery('');
    router.replace('/search', { scroll: false });
  };

  return (
    <div className="min-h-screen bg-dark-6 px-4 sm:px-6 py-6 max-w-[1600px] mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = inputValue.trim();
          setDebouncedQuery(trimmed);
          if (trimmed) {
            router.replace(`/search?q=${encodeURIComponent(trimmed)}`, { scroll: false });
          } else {
            router.replace('/search', { scroll: false });
          }
        }}
        className="mb-6"
      >
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-grey-60 pointer-events-none" />
          <input
            type="search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search videos, creators, categories..."
            autoFocus
            autoComplete="off"
            className="w-full h-12 bg-dark-12 rounded-xl pl-11 pr-11 text-sm text-primary placeholder-grey-60 border border-dark-25 focus:outline-none focus:border-red-45/60 focus:bg-dark-10 transition-all shadow-xl"
          />
          {inputValue && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-grey-60 hover:text-primary transition-colors"
              aria-label="Clear search"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {!debouncedQuery ? (
        <div className="py-20 text-center">
          <MagnifyingGlassIcon className="h-12 w-12 text-grey-60 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-primary mb-2">Search videos</h2>
          <p className="text-grey-60 text-sm max-w-sm mx-auto">
            Type a title, creator, or category to find something to watch.
          </p>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
          {[...Array(10)].map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="py-20 text-center bg-red-45/10 rounded-2xl border border-red-45/30">
          <h3 className="text-xl font-semibold text-primary mb-2">Connection Issue</h3>
          <p className="text-grey-70 mb-4">Failed to load results. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-45 hover:bg-red-55 text-white rounded-lg transition-all"
          >
            Retry
          </button>
        </div>
      ) : videos.length === 0 ? (
        <div className="py-20 text-center bg-dark-10 rounded-2xl border border-dark-25">
          <h3 className="text-xl font-semibold text-primary mb-2">No results</h3>
          <p className="text-grey-70">
            Nothing matched &ldquo;<span className="text-red-45">{debouncedQuery}</span>&rdquo;. Try a different term.
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-primary">
              Results for &ldquo;<span className="text-red-45">{debouncedQuery}</span>&rdquo;
            </h2>
            <span className="text-xs text-grey-60">{total.toLocaleString()} videos</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-10 flex justify-center pb-8">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={isFetching}
                className="inline-flex items-center gap-2 bg-dark-15 hover:bg-dark-20 border border-dark-25 hover:border-red-45/50 text-primary font-medium px-8 py-3 rounded-xl transition-all disabled:opacity-50 shadow-sm"
              >
                {isFetching ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-dark-6 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-red-45 border-t-transparent animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
