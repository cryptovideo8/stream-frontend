'use client';

import { Suspense, use } from 'react';
import Link from 'next/link';
import { useSearchVideosQuery } from '../../../../store/api/videoApi';
import { useGetPublicProfileQuery } from '../../../../store/api/userApi';

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function ChannelContent({ id }: { id: string }) {
  const { data: profile, isLoading: profileLoading, isError: profileError } =
    useGetPublicProfileQuery(id);
  const { data, isLoading: videosLoading } = useSearchVideosQuery({
    creatorId: id,
    page: 1,
    limit: 48,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  if (profileLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-grey-60">
        Loading channel…
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-grey-60 px-4">
        <p>Creator not found.</p>
        <Link href="/" className="text-red-45 hover:underline">
          Go home
        </Link>
      </div>
    );
  }

  const name = profile.name || profile.username || 'Creator';
  const videos = data?.videos || [];

  return (
    <div className="min-h-screen bg-dark-6">
      <div className="border-b border-dark-25 bg-dark-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-10 flex items-center gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-dark-15 border border-dark-25 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                profile.profileImage ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
              }
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">{name}</h1>
            <p className="text-sm text-grey-60 mt-1">
              {data?.total != null ? `${data.total.toLocaleString()} videos` : 'Creator'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-lg font-bold text-primary mb-5">Videos</h2>
        {videosLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-video rounded-xl bg-dark-12 animate-pulse" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <p className="text-grey-60 py-16 text-center border border-dark-25 rounded-xl bg-dark-10">
            No public videos yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
            {videos.map((video) => {
              const href =
                video.type === 'thirdparty' ? video.filePath : `/watch/${video._id}`;
              return (
                <a key={video._id} href={href} className="video-card block group">
                  <div className="video-card-thumb">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={video.thumbnailPath || '/placeholder.jpg'}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2.5">
                    <h3 className="text-sm font-medium text-primary line-clamp-2 group-hover:text-red-45">
                      {video.title}
                    </h3>
                    <p className="text-xs text-grey-60 mt-1">
                      {formatCount(video.stats?.views || 0)} views
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChannelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center text-grey-60">
          Loading…
        </div>
      }
    >
      <ChannelContent id={id} />
    </Suspense>
  );
}
