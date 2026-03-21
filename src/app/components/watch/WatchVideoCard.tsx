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
  creatorId?: { name?: string; username?: string } | string;
};

function formatDuration(sec?: number) {
  if (sec == null || Number.isNaN(sec)) return '';
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
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

  const thumb = (
    <div
      className={`relative overflow-hidden rounded-xl bg-dark-15 ring-1 ring-white/[0.06] group-hover:ring-red-45/40 transition-all ${
        variant === 'sidebar' ? 'w-36 shrink-0 aspect-video' : 'aspect-video w-full'
      }`}
    >
      <img
        src={video.thumbnailPath || '/placeholder.jpg'}
        alt=""
        className="h-full w-full object-cover"
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
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        <PlayIcon className="h-10 w-10 text-white drop-shadow-lg" />
      </div>
      {formatDuration(video.duration) && (
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-medium text-white tabular-nums">
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
    <div className="min-w-0 flex-1">
      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-red-45 transition-colors">
        {video.title}
      </h3>
      <p className="mt-1 text-xs text-grey-60 line-clamp-1">{creatorLabel(video)}</p>
      <p className="text-xs text-grey-50">
        {views.toLocaleString()} views
        {video.createdAt && (
          <span className="text-grey-60"> · {new Date(video.createdAt).toLocaleDateString()}</span>
        )}
      </p>
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
        className="group w-[min(78vw,280px)] shrink-0 snap-start sm:w-[260px] md:w-[280px]"
      >
        {thumb}
        <div className="mt-2">{meta}</div>
      </Link>
    );
  }

  return (
    <Link href={href} className="group block">
      {thumb}
      <div className="mt-2">{meta}</div>
    </Link>
  );
}
