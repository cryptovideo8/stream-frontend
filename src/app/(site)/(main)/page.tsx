'use client';
import { useSearchVideosQuery, VideoDetail } from '../../store/api/videoApi';
import { useGetContinueWatchingQuery } from '../../store/api/interactionApi';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FireIcon,
  ClockIcon,
  SparklesIcon,
  StarIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { useAppSelector } from '../../store/hooks';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

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

const CATEGORY_CHIPS = [
  { label: 'All', icon: FireIcon, query: {} },
  { label: 'Trending', icon: FireIcon, query: { sortBy: 'views', sortOrder: 'desc' } },
  { label: 'Newest', icon: ClockIcon, query: { sortBy: 'createdAt', sortOrder: 'desc' } },
  { label: 'Moments', icon: SparklesIcon, query: { category: 'Moments' } },
  { label: 'Premium', icon: StarIcon, query: { monetization: 'premium' } },
  { label: 'Top Rated', icon: TrophyIcon, query: { sortBy: 'likes', sortOrder: 'desc' } },
  { label: 'Indian', query: { category: 'Indian' } },
  { label: 'Amateur', query: { category: 'Amateur' } },
  { label: 'Mature', query: { category: 'Mature' } },
];

// Shimmer skeleton card
function VideoCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-dark-12 border border-dark-20/20 shadow-sm">
      <div
        className="aspect-video bg-dark-15 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
      </div>
      <div className="p-3 flex gap-3">
        <div className="w-9 h-9 rounded-full bg-dark-15 flex-shrink-0 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        </div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 rounded bg-dark-15 relative overflow-hidden w-[85%]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          </div>
          <div className="h-3 rounded bg-dark-15 relative overflow-hidden w-[50%]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface VideoCardProps {
  video: VideoDetail;
}

function VideoCard({ video }: VideoCardProps) {
  const isPremium = ['rent', 'paid'].includes(video.monetization?.type || '');
  const href = video.type === 'thirdparty' ? video.filePath : `/watch/${video._id}`;
  const isExternal = video.type === 'thirdparty';
  const channelHref = video.creatorId?._id ? `/channel/${video.creatorId._id}` : null;
  const creatorLabel = video.creatorId?.name || video.channel?.name;

  return (
    <div className="video-card group">
      <a
        href={href}
        target={isExternal ? '_blank' : '_self'}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className="block"
      >
      {/* Thumbnail */}
      <div className="video-card-thumb">
        <img
          src={video.thumbnailPath || '/placeholder.jpg'}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Preview on hover */}
        {video.previewPath && (
          <img
            src={video.previewPath}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            loading="lazy"
          />
        )}
        {/* Rich gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Hover overlay metadata */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 translate-y-2 group-hover:translate-y-0">
          <div className="flex items-center gap-2 text-white text-xs font-medium drop-shadow-md">
            <span className="flex items-center gap-1">
              <FireIcon className="w-3.5 h-3.5 text-red-45 animate-pulse" />
              {formatCount(video.stats?.views || 0)}
            </span>
            {video.stats?.likes && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-red-45 fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                {formatCount(video.stats.likes)}
              </span>
            )}
          </div>
        </div>

        {/* Badges */}
        {isPremium && <span className="badge-premium">Premium</span>}

        {/* Duration badge */}
        {video.duration ? (
          <span className="badge-duration group-hover:opacity-0 transition-opacity">{formatDuration(video.duration)}</span>
        ) : null}

        {/* Play icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-full bg-red-45/90 flex items-center justify-center shadow-[0_0_20px_rgba(227,0,0,0.6)] animate-scale-in">
            <svg className="w-6 h-6 text-white fill-current ml-1" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      </a>

      {/* Info */}
      <div className="p-2.5 flex gap-3">
        <div className="w-9 h-9 rounded-full bg-dark-15 flex-shrink-0 overflow-hidden border border-dark-25 group-hover:border-red-45/30 transition-colors">
          {channelHref ? (
            <Link href={channelHref} className="block w-full h-full">
              <img
                src={
                  video.creatorId?.profileImage ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.creatorId?.name || video.channel?.name || 'User'}`
                }
                alt=""
                className="w-full h-full object-cover"
              />
            </Link>
          ) : (
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${video.channel?.name || 'User'}`}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <a href={href} className="block">
            <h3 className="text-sm font-medium text-white line-clamp-2 leading-snug group-hover:text-red-45 transition-colors duration-200">
              {video.title}
            </h3>
          </a>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-grey-60">
            <span>{formatCount(video.stats?.views || 0)} views</span>
            <span>•</span>
            <span>{new Date(video.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          {creatorLabel && (
            channelHref ? (
              <Link
                href={channelHref}
                className="text-xs text-grey-60 mt-0.5 hover:text-white transition-colors truncate block"
              >
                {creatorLabel}
              </Link>
            ) : (
              <p className="text-xs text-grey-60 mt-0.5 truncate">{creatorLabel}</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function HomeContent() {
  const [page, setPage] = useState(1);
  const searchParams = useSearchParams();
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Unify text search to /search?q=
  useEffect(() => {
    const legacy = searchParams.get('search');
    if (legacy) {
      router.replace(`/search?q=${encodeURIComponent(legacy)}`);
    }
  }, [searchParams, router]);

  const urlSortBy = searchParams.get('sortBy') || undefined;
  const urlSortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | undefined;
  const urlCategory = searchParams.get('category') || undefined;
  const urlMonetization = searchParams.get('monetization') || undefined;

  const { data: continueData } = useGetContinueWatchingQuery(
    { limit: 12 },
    { skip: !mounted || !isAuthenticated }
  );

  // Derive active chip from URL
  let activeChip = 0;
  for (let i = 0; i < CATEGORY_CHIPS.length; i++) {
    const q = CATEGORY_CHIPS[i].query as Record<string, string>;
    
    // Default 'All'
    if (i === 0) {
      if (!urlSortBy && !urlCategory && !urlMonetization) {
        activeChip = 0;
        break;
      }
      continue;
    }

    const matchCategory = q.category === urlCategory;
    const matchMonetization = q.monetization === urlMonetization;
    const matchSortBy = q.sortBy === urlSortBy;
    const matchSortOrder = q.sortOrder === urlSortOrder || (!q.sortOrder && !urlSortOrder);
    
    if (matchCategory && matchMonetization && matchSortBy && matchSortOrder) {
      activeChip = i;
      break;
    }
  }

  const handleChipClick = (idx: number) => {
    const q = CATEGORY_CHIPS[idx].query as Record<string, string>;
    const params = new URLSearchParams();
    
    if (q.sortBy) params.set('sortBy', q.sortBy);
    if (q.sortOrder) params.set('sortOrder', q.sortOrder);
    if (q.category) params.set('category', q.category);
    if (q.monetization) params.set('monetization', q.monetization);

    router.push(`/?${params.toString()}`);
  };

  const { data, isLoading, isError, error } = useSearchVideosQuery({
    page: 1,
    limit: 20 * page,
    sortBy: urlSortBy || 'views',
    sortOrder: urlSortOrder || 'desc',
    category: urlCategory,
    monetization: urlMonetization,
  });

  const featuredVideo = data?.videos?.[0];
  const totalPages = Math.ceil((data?.total || 0) / 20);
  const continueItems = continueData?.items || [];

  return (
    <div className="min-h-screen bg-dark-6">

      {/* ── Hero Banner ─────────────────────────────────── */}
      {featuredVideo && (
        <div className="relative w-full overflow-hidden h-[50vh] md:h-[420px]">
          {/* Background thumbnail */}
          <img
            src={featuredVideo.thumbnailPath || '/placeholder.jpg'}
            alt={featuredVideo.title}
            className="absolute inset-0 w-full h-full object-cover scale-105 animate-float-slow"
            style={{ filter: 'brightness(0.4) blur(2px)' }}
          />
          {/* Parallax-like gradient overlays */}
          <div className="hero-overlay absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-6 via-transparent to-transparent opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-red-45/10 to-transparent mix-blend-overlay" />

          {/* Hero content */}
          <div className="relative h-full flex items-center max-w-[1600px] mx-auto px-6">
            <div className="max-w-xl animate-slide-up">
              <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white mb-4 bg-red-45/90 px-2 py-1 rounded shadow-glow-sm">
                <FireIcon className="h-3.5 w-3.5" /> Featured
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight text-shadow line-clamp-3">
                {featuredVideo.title}
              </h1>
              <p className="text-grey-75 text-sm sm:text-base mb-8 max-w-md">
                {formatCount(featuredVideo.stats?.views || 0)} views
                {featuredVideo.channel?.name && <> • {featuredVideo.channel.name}</>}
              </p>
              <a
                href={featuredVideo.type === 'thirdparty' ? featuredVideo.filePath : `/watch/${featuredVideo._id}`}
                className="group relative inline-flex items-center justify-center gap-2 bg-red-45 text-white font-bold px-8 py-3.5 rounded-xl transition-all duration-300 overflow-hidden shadow-[0_0_30px_rgba(227,0,0,0.4)] hover:shadow-[0_0_40px_rgba(227,0,0,0.6)] hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:animate-shimmer-slide skew-x-[-20deg]" />
                <svg className="w-5 h-5 fill-current relative z-10" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                <span className="relative z-10">Watch Now</span>
              </a>
            </div>
          </div>
          
          {/* Scroll down indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50 animate-bounce-subtle pointer-events-none">
            <span className="text-[10px] text-white uppercase tracking-widest font-semibold">Scroll</span>
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">

        {mounted && isAuthenticated && continueItems.length > 0 && (
          <section className="mb-8" aria-labelledby="continue-watching-heading">
            <h2 id="continue-watching-heading" className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-red-45" /> Continue watching
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-3 [scrollbar-width:thin] snap-x snap-mandatory">
              {continueItems.map((item) => {
                const v = item.video;
                if (!v?._id) return null;
                const duration = item.durationSeconds || v.duration || 0;
                const pct =
                  duration > 0
                    ? Math.min(100, Math.round((item.progressSeconds / duration) * 100))
                    : 0;
                return (
                  <Link
                    key={item._id}
                    href={`/watch/${v._id}`}
                    className="snap-start shrink-0 w-[220px] sm:w-[260px] group"
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-dark-12 border border-dark-25">
                      <img
                        src={v.thumbnailPath || '/placeholder.jpg'}
                        alt={v.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {pct > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-dark-20">
                          <div className="h-full bg-red-45" style={{ width: `${pct}%` }} />
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-white line-clamp-2 group-hover:text-red-45 transition-colors">
                      {v.title}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Category Chips ─────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-2" style={{ scrollbarWidth: 'none' }}>
            {CATEGORY_CHIPS.map((chip, idx) => {
              const Icon = chip.icon;
              return (
                <button
                  key={chip.label}
                  onClick={() => handleChipClick(idx)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all duration-300 relative overflow-hidden ${activeChip === idx
                      ? 'text-white shadow-[0_0_15px_rgba(227,0,0,0.3)]'
                      : 'bg-dark-12 text-grey-70 hover:bg-dark-15 hover:text-white border border-dark-25'
                    }`}
                >
                  {activeChip === idx && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-45 to-red-55 -z-10" />
                  )}
                  {Icon && <Icon className="h-3.5 w-3.5 relative z-10" />}
                  <span className="relative z-10">{chip.label}</span>
                </button>
              );
            })}
          </div>

        {/* ── Section Heading ────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FireIcon className="h-5 w-5 text-red-45" /> Trending Videos
          </h2>
          {data?.total != null && (
            <span className="text-xs text-grey-60">{data.total.toLocaleString()} videos</span>
          )}
        </div>

        {/* ── Video Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
          {isLoading ? (
            [...Array(12)].map((_, i) => <VideoCardSkeleton key={i} />)
          ) : isError ? (
            <div className="col-span-full py-20 text-center bg-red-45/10 rounded-2xl border border-red-45/30">
              <div className="flex justify-center mb-4">
                <svg className="h-12 w-12 text-red-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Connection Issue</h3>
              <p className="text-grey-70 mb-4 px-4 max-w-md mx-auto">
                Failed to load videos. Please check your connection and try again.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-red-45 hover:bg-red-55 text-white rounded-lg transition-all"
              >
                Retry
              </button>
            </div>
          ) : data?.videos && data.videos.length > 0 ? (
            data.videos.map((video) => <VideoCard key={video._id} video={video} />)
          ) : (
            <div className="col-span-full py-20 text-center bg-dark-10 rounded-2xl border border-dark-25">
              <div className="flex justify-center mb-4">
                <ClockIcon className="h-12 w-12 text-grey-60" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No Videos Available
              </h3>
              <p className="text-grey-70">
                Please check back later or try a different category.
              </p>
            </div>
          )}
        </div>

        {/* ── Load More Pagination ─────────────────────────────────── */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-10 flex justify-center pb-8">
            {(data?.videos?.length || 0) < (data?.total || 0) ? (
              <button
                onClick={() => setPage(p => p + 1)}
                className="group relative inline-flex items-center gap-2 bg-dark-15 hover:bg-dark-20 border border-dark-25 hover:border-red-45/50 text-white font-medium px-8 py-3 rounded-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-45/0 via-red-45/10 to-red-45/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                <SparklesIcon className="w-5 h-5 text-red-45" />
                <span className="relative z-10">Load More</span>
              </button>
            ) : (
              <p className="text-grey-60 text-sm font-medium">You&apos;ve reached the end</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-6 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-red-45 border-t-transparent animate-spin"></div></div>}>
      <HomeContent />
    </Suspense>
  );
}
