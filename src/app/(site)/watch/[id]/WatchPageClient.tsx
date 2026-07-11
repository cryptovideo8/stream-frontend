'use client';

import React from 'react';
import Link from 'next/link';
import VideoPlayer from '../../../components/VideoPlayer';
import WatchVideoCard, { WatchListVideo } from '../../../components/watch/WatchVideoCard';
import { useParams, useRouter } from 'next/navigation';
import { useGetVideoByIdQuery, useGetRelatedVideosQuery } from '../../../store/api/videoApi';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../../store/slices/authSlice';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

function RelatedVideosShelves({
  videos,
  relatedCount,
  isLoading,
}: {
  videos: WatchListVideo[];
  relatedCount: number;
  isLoading: boolean;
}) {
  const related = videos.slice(0, relatedCount);
  const discover = videos.slice(relatedCount);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video rounded-xl bg-dark-10" />
              <div className="mt-2 h-4 w-3/4 rounded bg-dark-10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <p className="rounded-xl border border-dark-25 bg-dark-10 px-4 py-8 text-center text-sm text-grey-60">
        No recommendations yet.{' '}
        <Link href="/" className="text-red-45 hover:underline">
          Browse the catalogue
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {related.length > 0 && (
        <section aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-4 text-lg font-bold tracking-tight text-primary sm:text-xl">
            Related to this video
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {related.map((v) => (
              <WatchVideoCard key={v._id} video={v} variant="grid" />
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && discover.length > 0 && (
        <section aria-labelledby="discover-heading">
          <h2 id="discover-heading" className="mb-4 text-lg font-bold tracking-tight text-primary sm:text-xl">
            More to explore
          </h2>
          <div className="relative">
            <div className="flex gap-3 overflow-x-auto pb-4 pt-1 [scrollbar-width:thin] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-dark-25 snap-x snap-mandatory sm:gap-4 [-webkit-overflow-scrolling:touch]">
              {discover.map((v) => (
                <WatchVideoCard key={v._id} video={v} variant="rail" />
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-dark-6 to-transparent" />
          </div>
        </section>
      )}

      {related.length === 0 && discover.length > 0 && (
        <section aria-labelledby="rec-heading">
          <h2 id="rec-heading" className="mb-4 text-lg font-bold tracking-tight text-primary sm:text-xl">
            Recommended for you
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {discover.map((v) => (
              <WatchVideoCard key={v._id} video={v} variant="grid" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SidebarQueue({
  videos,
  isLoading,
}: {
  videos: WatchListVideo[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex animate-pulse gap-3">
            <div className="h-[81px] w-36 shrink-0 rounded-lg bg-dark-10" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 rounded bg-dark-10" />
              <div className="h-3 w-2/3 rounded bg-dark-10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <aside className="lg:w-[min(100%,380px)] xl:w-[400px]">
      <div className="sticky top-20 max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-2xl border border-white/[0.06] bg-dark-10/90 p-3 shadow-xl backdrop-blur-md sm:top-24 sm:max-h-[calc(100dvh-6rem)] lg:p-4">
        <div className="mb-3 flex items-center justify-between border-b border-white/[0.06] pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-grey-50">Up next</h2>
          <Link
            href="/"
            className="inline-flex items-center gap-0.5 text-xs font-medium text-red-45 hover:text-red-55"
          >
            Home <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        {videos.length === 0 ? (
          <p className="py-6 text-center text-sm text-grey-60">No other videos to show.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {videos.map((v) => (
              <WatchVideoCard key={v._id} video={v} variant="sidebar" />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

export default function WatchPageClient() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { data: videoData, isLoading, isError, error } = useGetVideoByIdQuery(id, {
    skip: !id,
  });

  const { data: relatedPayload, isLoading: isLoadingRelated } = useGetRelatedVideosQuery(
    { videoId: id, limit: 36 },
    { skip: !id }
  );

  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [isLargeScreen, setIsLargeScreen] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsLargeScreen(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const listVideos = (relatedPayload?.videos as WatchListVideo[]) || [];
  const relatedCount = typeof relatedPayload?.relatedCount === 'number' ? relatedPayload.relatedCount : 0;

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4 text-grey-60">
        Loading video…
      </div>
    );
  }

  const isLockedPreview =
    !!videoData &&
    (videoData.preview === true ||
      videoData.requiresAuth === true ||
      videoData.requiresSubscription === true ||
      (!videoData.src &&
        ['paid', 'rent'].includes(videoData.monetization?.type || '')));

  if (isLockedPreview && videoData) {
    const poster = videoData.previewPath || videoData.thumbnailPath || '/placeholder.jpg';
    const needsAuth = videoData.requiresAuth || !isAuthenticated;
    return (
      <div className="px-0 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 sm:px-4 sm:py-6 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:gap-8 lg:flex-row">
          <div className="min-w-0 flex-1 px-3 sm:px-0">
            <div className="relative overflow-hidden rounded-none bg-black ring-0 sm:rounded-2xl sm:ring-1 sm:ring-white/[0.08]">
              <div className="relative pt-[56.25%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={poster}
                  alt={videoData.title || 'Premium content'}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/70 via-black/75 to-black/90 px-4 text-center">
                  <h2 className="mb-2 text-2xl font-bold text-primary">
                    {videoData.title || 'Premium content'}
                  </h2>
                  {needsAuth ? (
                    <>
                      <p className="mb-6 max-w-md text-grey-60">Sign in to unlock this title.</p>
                      <button
                        type="button"
                        onClick={() => router.push('/login')}
                        className="rounded-xl bg-red-45 px-8 py-3 font-semibold text-white transition hover:bg-red-55"
                      >
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="mb-6 max-w-md text-grey-60">
                        Subscribe to a plan to watch this content.
                      </p>
                      <button
                        type="button"
                        onClick={() => router.push('/subscriptions')}
                        className="rounded-xl bg-red-45 px-8 py-3 font-semibold text-white transition hover:bg-red-55"
                      >
                        View plans
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {videoData.description && (
              <p className="mt-4 text-sm text-grey-60 line-clamp-3">{videoData.description}</p>
            )}

            <div className="mt-8">
              <RelatedVideosShelves
                videos={listVideos}
                relatedCount={relatedCount}
                isLoading={isLoadingRelated}
              />
            </div>
          </div>

          {isLargeScreen && (
            <SidebarQueue videos={listVideos} isLoading={isLoadingRelated} />
          )}
        </div>
      </div>
    );
  }

  if (isError || !videoData) {
    const errData =
      error && typeof error === 'object' && 'data' in error
        ? (error as { data?: { code?: string; message?: string } }).data
        : undefined;
    if (errData?.code === 'geo_restricted') {
      return (
        <div className="px-4 py-20 text-center max-w-lg mx-auto">
          <h2 className="text-2xl font-bold text-primary mb-3">Not available in your region</h2>
          <p className="text-grey-60 mb-6">
            {errData.message || 'This video cannot be watched from your current location.'}
          </p>
          <Link href="/" className="text-red-45 hover:underline">
            Browse catalogue
          </Link>
        </div>
      );
    }

    return (
      <div className="p-6 text-center text-red-400">
        Failed to load video.{' '}
        <Link href="/" className="underline">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="px-0 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 sm:px-4 sm:pt-6 md:px-6">
      <div className="mx-auto max-w-[1920px]">
        <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-start lg:gap-8">
          <div className="min-w-0 flex-1">
            <div className="sm:rounded-2xl sm:overflow-hidden sm:ring-1 sm:ring-white/[0.06]">
              <VideoPlayer data={videoData} />
            </div>

            <div className="mt-6 px-3 sm:mt-8 sm:px-0">
              <RelatedVideosShelves
                videos={listVideos}
                relatedCount={relatedCount}
                isLoading={isLoadingRelated}
              />
            </div>
          </div>

          {isLargeScreen && (
            <SidebarQueue videos={listVideos} isLoading={isLoadingRelated} />
          )}
        </div>
      </div>
    </div>
  );
}
