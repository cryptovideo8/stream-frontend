'use client';
import { useSearchVideosQuery, VideoDetail } from '../../store/api/videoApi';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FireIcon,
  ClockIcon,
  SparklesIcon,
  StarIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

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
    <div className="rounded-xl overflow-hidden" style={{ background: '#1a1a1a' }}>
      <div
        className="aspect-video"
        style={{
          background: 'linear-gradient(90deg, #1a1a1a 0px, #262626 40%, #1a1a1a 80%)',
          backgroundSize: '700px 100%',
          animation: 'shimmer 2s infinite linear',
        }}
      />
      <div className="p-3 space-y-2">
        <div className="h-4 rounded" style={{ background: 'linear-gradient(90deg, #1f1f1f 0px, #2a2a2a 40%, #1f1f1f 80%)', backgroundSize: '700px 100%', animation: 'shimmer 2s infinite linear', width: '75%' }} />
        <div className="h-3 rounded" style={{ background: 'linear-gradient(90deg, #1f1f1f 0px, #2a2a2a 40%, #1f1f1f 80%)', backgroundSize: '700px 100%', animation: 'shimmer 2s infinite linear', width: '50%' }} />
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

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : '_self'}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="video-card block group"
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
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        {isPremium && <span className="badge-premium">Premium</span>}

        {/* Duration badge */}
        {video.duration ? (
          <span className="badge-duration">{formatDuration(video.duration)}</span>
        ) : null}

        {/* Play icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-10 h-10 rounded-full bg-red-45/90 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white fill-current ml-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <h3 className="text-sm font-medium text-white line-clamp-2 leading-snug group-hover:text-red-45 transition-colors duration-200">
          {video.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-grey-60">
          <span>{formatCount(video.stats?.views || 0)} views</span>
          <span>•</span>
          <span>{new Date(video.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        {video.channel?.name && (
          <p className="text-xs text-grey-60 mt-0.5 hover:text-grey-70 transition-colors">{video.channel.name}</p>
        )}
      </div>
    </a>
  );
}

export default function Home() {
  const [page, setPage] = useState(1);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const search = searchParams.get('search') || '';
  const urlSortBy = searchParams.get('sortBy') || undefined;
  const urlSortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | undefined;
  const urlCategory = searchParams.get('category') || undefined;
  const urlMonetization = searchParams.get('monetization') || undefined;

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
    if (search) params.set('search', search);

    router.push(`/?${params.toString()}`);
  };

  const { data, isLoading, isError, error } = useSearchVideosQuery({
    page,
    limit: 20,
    search: search || undefined,
    sortBy: urlSortBy || 'views', // Default sorting
    sortOrder: urlSortOrder || 'desc',
    category: urlCategory,
    monetization: urlMonetization,
  });

  useEffect(() => {
    setPage(1);
  }, [search]);

  const featuredVideo = data?.videos?.[0];
  const totalPages = Math.ceil((data?.total || 0) / 20);

  return (
    <div className="min-h-screen bg-dark-6">

      {/* ── Hero Banner ─────────────────────────────────── */}
      {!search && featuredVideo && (
        <div className="relative w-full overflow-hidden" style={{ height: '420px' }}>
          {/* Background thumbnail */}
          <img
            src={featuredVideo.thumbnailPath || '/placeholder.jpg'}
            alt={featuredVideo.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'brightness(0.45) blur(1px)' }}
          />
          {/* Gradient overlays */}
          <div className="hero-overlay absolute inset-0" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0F0F0F 0%, transparent 60%)' }} />

          {/* Hero content */}
          <div className="relative h-full flex items-center max-w-[1600px] mx-auto px-6">
            <div className="max-w-lg animate-fade-in">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-red-45 mb-3">
                <FireIcon className="h-3.5 w-3.5" /> Featured
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight text-shadow line-clamp-2">
                {featuredVideo.title}
              </h1>
              <p className="text-grey-70 text-sm mb-6">
                {formatCount(featuredVideo.stats?.views || 0)} views
                {featuredVideo.channel?.name && <> · {featuredVideo.channel.name}</>}
              </p>
              <a
                href={featuredVideo.type === 'thirdparty' ? featuredVideo.filePath : `/watch/${featuredVideo._id}`}
                className="inline-flex items-center gap-2 bg-red-45 hover:bg-red-55 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-red-45/30 hover:shadow-red-45/50 active:scale-95"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                Watch Now
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">

        {/* ── Category Chips ─────────────────────────────── */}
        {!search && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-2" style={{ scrollbarWidth: 'none' }}>
            {CATEGORY_CHIPS.map((chip, idx) => {
              const Icon = chip.icon;
              return (
                <button
                  key={chip.label}
                  onClick={() => handleChipClick(idx)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all duration-200 ${activeChip === idx
                      ? 'bg-red-45 text-white shadow-md shadow-red-45/30'
                      : 'bg-dark-12 text-grey-70 hover:bg-dark-15 hover:text-white border border-dark-25'
                    }`}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {chip.label}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Section Heading ────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {search ? (
              <>Search Results for &ldquo;<span className="text-red-45">{search}</span>&rdquo;</>
            ) : (
              <><FireIcon className="h-5 w-5 text-red-45" /> Trending Videos</>
            )}
          </h2>
          {data?.total != null && (
            <span className="text-xs text-grey-60">{data.total.toLocaleString()} videos</span>
          )}
        </div>

        {/* ── Video Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
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
                Failed to load videos. This can happen if the backend server is unreachable or CORS is blocking the request.
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

        {/* ── Pagination ─────────────────────────────────── */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-dark-12 hover:bg-dark-15 text-grey-70 hover:text-white rounded-lg border border-dark-25 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let p;
                if (totalPages <= 7) {
                  p = i + 1;
                } else if (page <= 4) {
                  p = i + 1;
                } else if (page >= totalPages - 3) {
                  p = totalPages - 6 + i;
                } else {
                  p = page - 3 + i;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${page === p
                        ? 'bg-red-45 text-white shadow-md shadow-red-45/30'
                        : 'bg-dark-12 text-grey-70 hover:bg-dark-15 hover:text-white border border-dark-25'
                      }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!data?.videos || data.videos.length < 20}
              className="px-4 py-2 bg-dark-12 hover:bg-dark-15 text-grey-70 hover:text-white rounded-lg border border-dark-25 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
