"use client";
import { useSearchVideosQuery, useGetLikedVideosQuery } from '../../../store/api/videoApi';
import { useEffect, useState, use } from 'react';
import { useSearchParams } from 'next/navigation';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function Home({ params }: PageProps) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const limit = 20;
  const [isClient, setIsClient] = useState(false);
  // const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);



  // Extract search parameters from URL
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const monetization = searchParams.get('monetization') || '';
  const visibility = searchParams.get('visibility') || '';
  const tags = searchParams.get('tags') || '';
  const sortBy = searchParams.get('sortBy') || 'views';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

  const { data, isLoading, isError } = useSearchVideosQuery({
    page,
    limit,
    search,
    category,
    monetization,
    visibility,
    tags,
    sortBy,
    sortOrder,
    id: resolvedParams.id
  });
  const videos = data?.videos || [];
  const totalVideos = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  // console.log("Loaded videos", videos)
  // console.log("Loaded  totalVideos", totalVideos)
  // console.log("Loaded totalPages", totalPages)

  // console.log("Loaded Data", data)
  // Early return for loading state
  if (isLoading) {
    return (
      <div className="p-6 bg-[#0f1216]">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Loading...</h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-video bg-[#1a1f25] rounded-lg"></div>
                <div className="mt-2 space-y-2">
                  <div className="h-4 bg-[#1a1f25] rounded w-3/4"></div>
                  <div className="h-3 bg-[#1a1f25] rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Early return for error state
  if (isError) {
    return (
      <div className="p-6 bg-[#0f1216]">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Error loading videos</h1>
          </div>
          <div className="text-red-500 text-center">
            Failed to load videos. Please try again later.
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="p-6 bg-[#0f1216]">
      <div className="max-w-[1600px] mx-auto">
        {/* Header with search results info */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">
            {resolvedParams.id === 'liked'
              ? 'Liked videos'
              : search
                ? `Search Results for "${search}"`
                : 'All Videos'}
          </h1>
          <div className="text-gray-400">
            {totalVideos} videos found
          </div>
        </div>

        {/* No results message */}
        {videos.length === 0 ? (
          <div className="text-center py-12 border border-dark-25 rounded-xl bg-dark-10">
            <h2 className="text-xl text-white">
              {resolvedParams.id === 'liked' ? 'No liked videos yet' : 'No videos found'}
            </h2>
            <p className="text-grey-60 mt-2">
              {resolvedParams.id === 'liked'
                ? 'Like videos while watching and they will show up here.'
                : 'Try adjusting your search criteria or browse all videos'}
            </p>
            {resolvedParams.id === 'liked' && (
              <a href="/" className="inline-block mt-4 text-red-45 hover:underline text-sm">
                Browse catalogue
              </a>
            )}
          </div>
        ) : (
          <>
            {/* Video Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {data?.videos?.map((video: any) => {
                const isPremium = ['rent', 'paid'].includes(video.monetization?.type);
                return (
                  <a
                    href={video.type === 'thirdparty' ? video.filePath : `/watch/${video._id}`}
                    target={video.type === 'thirdparty' ? '_blank' : '_self'}
                    rel={video.type === 'thirdparty' ? 'noopener noreferrer' : undefined}
                    key={video._id}
                    className="block"
                  >
                    <div className="bg-dark-10 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200 h-full">
                      <div className="aspect-video bg-dark-15 relative group">
                        <img
                          src={video.thumbnailPath || '/placeholder.jpg'}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {video.previewPath && (
                          <img
                            src={video.previewPath}
                            alt="Preview"
                            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            loading="lazy"
                          />
                        )}
                        {isPremium && (
                          <span className="absolute top-2 right-2 bg-red-45 text-primary text-xs font-bold px-1.5 py-0.5 rounded">
                            PREMIUM
                          </span>
                        )}
                      </div>
                      <div className="p-2 sm:p-3">
                        <h3 className="text-primary text-sm sm:text-[15px] font-medium line-clamp-2">{video.title}</h3>
                        <p className="text-grey-70 text-xs sm:text-[13px] mt-1">
                          {video.stats?.views?.toLocaleString() || 0} views • {new Date(video.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-[#1a1f25] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-white">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-[#1a1f25] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
