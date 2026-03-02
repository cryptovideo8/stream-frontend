"use client";
import React from "react";
import VideoPlayer from "../../../components/VideoPlayer";
import { useParams, useRouter } from 'next/navigation';
import { useGetVideoByIdQuery, useGetRelatedVideosQuery } from "../../../store/api/videoApi";
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../../store/slices/authSlice';

export default function WatchPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { data: videoData, isLoading, isError, error } = useGetVideoByIdQuery(id, {
    skip: !id,
  });

  console.log("videoData", videoData);
  const { data: relatedVideosData, isLoading: isLoadingRelated } = useGetRelatedVideosQuery({ videoId: id }, {
    skip: !id,
  });
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Responsive state for large screens
  const [isLargeScreen, setIsLargeScreen] = React.useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : false
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // All related videos
  const allRelatedVideos = relatedVideosData?.videos || [];
  // Sidebar videos only for large screens
  const sidebarVideos = isLargeScreen ? allRelatedVideos.slice(0, 10) : [];
  // Main grid videos: on large screens, exclude sidebar videos; on mobile, show all
  const gridVideos = isLargeScreen ? allRelatedVideos.slice(10) : allRelatedVideos;

  console.log("mainGridVideos", gridVideos);
  console.log("sidebarVideos", sidebarVideos);

  if (isLoading) return <div className="p-6 text-primary">Loading video...</div>;
  if (isError) {
    // Check if the error is unauthorized (401) or forbidden/payment required (403)
    const isAuthError = 'status' in (error as FetchBaseQueryError) &&
      ((error as FetchBaseQueryError).status === 401 || (error as FetchBaseQueryError).status === 403);

    if (isAuthError) {
      return (
        <div className="px-2 sm:px-4 md:px-6 py-6">
          <div>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Main Content */}
              <div className="flex-1 min-w-0">
                {/* Premium Content Message */}
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <div style={{ position: "relative", paddingTop: "56.25%" }}>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-black/80 to-black/60">
                      <h2 className="text-2xl font-bold text-white mb-4">Premium Content</h2>
                      {!isAuthenticated ? (
                        <>
                          <p className="text-white mb-6">Please sign in to access this premium content</p>
                          <button
                            onClick={() => router.push('/login')}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                          >
                            Sign In
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-white mb-6">Please subscribe to a plan to watch this premium content</p>
                          <button
                            onClick={() => router.push('/subscriptions')}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                          >
                            Subscribe Now
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Related Videos Grid */}
                <div
                  className="mt-6 grid gap-4"
                  style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
                >
                  {isLoadingRelated ? (
                    // Loading skeleton
                    Array(6).fill(null).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-video bg-dark-10 rounded-lg"></div>
                        <div className="mt-2 space-y-2">
                          <div className="h-4 bg-dark-10 rounded w-3/4"></div>
                          <div className="h-3 bg-dark-10 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    gridVideos.map((video: any) => (
                      <div key={video._id} className="group cursor-pointer">
                        <div className="relative aspect-video bg-dark-10 rounded-lg overflow-hidden">
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
                          <div className="absolute bottom-1 right-1 bg-black/80 text-primary text-xs px-1 rounded">
                            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                          </div>
                          {video.drmEnabled && (
                            <div className="absolute top-1 right-1 bg-yellow-500 text-black text-xs px-1 rounded font-medium">
                              DRM
                            </div>
                          )}
                        </div>
                        <div className="mt-2">
                          <h3 className="text-primary text-sm font-medium line-clamp-2 group-hover:text-grey-70">
                            {video.title}
                          </h3>
                          <div className="mt-1 flex items-center gap-2 text-grey-70 text-xs">
                            <span>{video.creatorId}</span>
                            <span>•</span>
                            <span>{video.stats.views.toLocaleString()} views</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Sidebar */}
              {isLargeScreen && (
                <div className="hidden lg:block lg:w-[300px] space-y-4">
                  {isLoadingRelated ? (
                    // Loading skeleton for sidebar
                    Array(8).fill(null).map((_, i) => (
                      <div key={i} className="flex gap-2 animate-pulse">
                        <div className="w-[180px] aspect-video bg-dark-10 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-dark-10 rounded w-3/4"></div>
                          <div className="h-3 bg-dark-10 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    sidebarVideos.map((video: any) => (
                      <div key={video._id} className="flex gap-2 group cursor-pointer">
                        <div className="relative w-[180px] aspect-video bg-dark-10 rounded-lg overflow-hidden">
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
                          <div className="absolute bottom-1 right-1 bg-black/80 text-primary text-xs px-1 rounded">
                            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                          </div>
                          {video.drmEnabled && (
                            <div className="absolute top-1 right-1 bg-yellow-500 text-black text-xs px-1 rounded font-medium">
                              DRM
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-primary text-sm font-medium line-clamp-2 group-hover:text-grey-70">
                            {video.title}
                          </h3>
                          <div className="mt-1 text-grey-70 text-xs">
                            <div>{video.stats.views.toLocaleString()} views</div>
                            <div>{new Date(video.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    return <div className="p-6 text-red-500">Failed to load video details.</div>;
  }

  return (
    <div className="px-2 sm:px-4 md:px-6 py-6">
      <div>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <VideoPlayer data={videoData} />

            {/* Related Videos Grid */}
            <div
              className="mt-6 grid gap-4"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
            >
              {isLoadingRelated ? (
                // Loading skeleton
                Array(6).fill(null).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-video bg-dark-10 rounded-lg"></div>
                    <div className="mt-2 space-y-2">
                      <div className="h-4 bg-dark-10 rounded w-3/4"></div>
                      <div className="h-3 bg-dark-10 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : (
                gridVideos.map((video: any) => (
                  <div key={video._id} className="group cursor-pointer">
                    <div className="relative aspect-video bg-dark-10 rounded-lg overflow-hidden">
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
                      <div className="absolute bottom-1 right-1 bg-black/80 text-primary text-xs px-1 rounded">
                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                      </div>
                      {video.drmEnabled && (
                        <div className="absolute top-1 right-1 bg-yellow-500 text-black text-xs px-1 rounded font-medium">
                          DRM
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <h3 className="text-primary text-sm font-medium line-clamp-2 group-hover:text-grey-70">
                        {video.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-grey-70 text-xs">
                        <span>{video.creatorId}</span>
                        <span>•</span>
                        <span>{video.stats.views.toLocaleString()} views</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          {isLargeScreen && (
            <div className="hidden lg:block lg:w-[300px] space-y-4">
              {isLoadingRelated ? (
                // Loading skeleton for sidebar
                Array(8).fill(null).map((_, i) => (
                  <div key={i} className="flex gap-2 animate-pulse">
                    <div className="w-[180px] aspect-video bg-dark-10 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-dark-10 rounded w-3/4"></div>
                      <div className="h-3 bg-dark-10 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : (
                sidebarVideos.map((video: any) => (
                  <div key={video._id} className="flex gap-2 group cursor-pointer">
                    <div className="relative w-[180px] aspect-video bg-dark-10 rounded-lg overflow-hidden">
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
                      <div className="absolute bottom-1 right-1 bg-black/80 text-primary text-xs px-1 rounded">
                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                      </div>
                      {video.drmEnabled && (
                        <div className="absolute top-1 right-1 bg-yellow-500 text-black text-xs px-1 rounded font-medium">
                          DRM
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-primary text-sm font-medium line-clamp-2 group-hover:text-grey-70">
                        {video.title}
                      </h3>
                      <div className="mt-1 text-grey-70 text-xs">
                        <div>{video.stats.views.toLocaleString()} views</div>
                        <div>{new Date(video.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 