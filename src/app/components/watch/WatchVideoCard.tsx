'use client';

import Link from 'next/link';
import { PlayIcon } from '@heroicons/react/24/solid';

export type WatchListVideo = {
  _id: string;
  title: string;
  thumbnailPath?: string;
  previewPath?: string;
  duration?: number;
  createdAt?: string;
  drmEnabled?: boolean;
  stats?: { views?: number };
  creatorId?: { _id?: string; name?: string; username?: string } | string;
  monetization?: { type?: string; price?: number; currency?: string };
};

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

function creatorLabel(v: WatchListVideo) {
  const c = v.creatorId;
  if (c && typeof c === 'object') return c.name || c.username || 'Creator';
  if (typeof c === 'string') return c;
  return 'Creator';
}

type Variant = 'sidebar' | 'grid' | 'rail';

export default function WatchVideoCard({
  video,
  variant = 'grid',
}: {
  video: WatchListVideo;
  variant?: Variant;
}) {
  const href = `/watch/${video._id}`;
  const views = video.stats?.views ?? 0;
  const isPremium = ['rent', 'paid'].includes(video.monetization?.type?.toLowerCase() || '');

  const thumb = (
    <div
      className={
        variant === 'sidebar' 
          ? 'relative overflow-hidden rounded-xl bg-dark-15 w-36 shrink-0 aspect-video ring-1 ring-white/[0.06] group-hover:ring-red-45/40 transition-all'
          : 'video-card-thumb'
      }
    >
      <img
        src={video.thumbnailPath || '/placeholder.jpg'}
        alt=""
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      {video.previewPath && (
        <img
          src={video.previewPath}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {isPremium && <span className="badge-premium">Premium</span>}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="w-10 h-10 rounded-full bg-red-45/90 flex items-center justify-center shadow-lg">
          <PlayIcon className="h-5 w-5 text-white ml-0.5" />
        </div>
      </div>
      {formatDuration(video.duration) && (
        <span className="badge-duration">
          {formatDuration(video.duration)}
        </span>
      )}
      {video.drmEnabled && (
        <span className="absolute top-1.5 right-1.5 rounded bg-amber-500/95 px-1 py-0.5 text-[10px] font-bold text-black">
          DRM
        </span>
      )}
    </div>
  );

  const meta = (
    <div className={variant === 'sidebar' ? "min-w-0 flex-1" : "p-2.5"}>
      <h3 className="text-sm font-medium text-white line-clamp-2 leading-snug group-hover:text-red-45 transition-colors duration-200">
        {video.title}
      </h3>
      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-grey-60">
        <span>{formatCount(views)} views</span>
        <span>•</span>
        <span>{video.createdAt ? new Date(video.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
      </div>
      <p className="text-xs text-grey-60 mt-0.5 line-clamp-1">{creatorLabel(video)}</p>
    </div>
  );

  if (variant === 'sidebar') {
    return (
      <Link href={href} className="group flex gap-3 rounded-lg p-2 transition-colors hover:bg-white/[0.04]">
        {thumb}
        {meta}
      </Link>
    );
  }

  if (variant === 'rail') {
    return (
      <Link
        href={href}
        className="video-card block group w-[min(78vw,280px)] shrink-0 snap-start sm:w-[260px] md:w-[280px]"
      >
        {thumb}
        {meta}
      </Link>
    );
  }

  return (
    <Link href={href} className="video-card block group">
      {thumb}
      {meta}
    </Link>
  );
}
