import { baseApi } from './baseApi';

/** Populated user from getComments */
export interface CommentAuthor {
  _id: string;
  username?: string;
  name?: string;
  profileImage?: string;
}

export interface Comment {
  _id: string;
  videoId: string;
  userId?: string | CommentAuthor;
  text: string;
  timestamp: Date;
  ip: string;
  likes: number;
  replies: Reply[];
}

export interface Reply {
  fromUser: string | CommentAuthor;
  like: number;
  reply: string;
  ipAddress: string;
  createdAt?: string | Date;
}

export interface View {
  _id: string;
  videoId: string;
  ip: string;
  userId?: string;
  timestamp: Date;
}

export interface Like {
  _id: string;
  videoId: string;
  isLiked: boolean;
  userId?: string;
  ip: string;
  timestamp: Date;
}

export const interactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Comment endpoints
    getComments: builder.query<Comment[], string>({
      query: (videoId) => ({
        url: `/interaction/videos/${videoId}/comments`,
        method: 'GET'
      }),
      providesTags: (result, error, videoId) => [{ type: 'VideoInteraction' as const, id: videoId }],
    }),

    createComment: builder.mutation<Comment, { videoId: string; text: string }>({
      query: ({ videoId, text }) => ({
        url: '/interaction/comments',
        method: 'POST',
        body: { videoId, text }
      }),
      // Do not invalidate Video — reminting Bunny src remounts the iframe mid-playback.
      invalidatesTags: (result, error, { videoId }) => [
        { type: 'VideoInteraction', id: videoId },
      ],
    }),

    addReply: builder.mutation<Comment, { commentId: string; reply: string; videoId: string }>({
      query: ({ commentId, reply }) => ({
        url: `/interaction/comments/${commentId}/replies`,
        method: 'POST',
        body: { reply }
      }),
      invalidatesTags: (result, error, { videoId }) => [{ type: 'VideoInteraction', id: videoId }],
    }),

    // View endpoints
    addView: builder.mutation<View, string>({
      query: (videoId) => ({
        url: `/interaction/videos/${videoId}/views`,
        method: 'POST'
      }),
      // No Video invalidation — refetch would remint embed URL and remount the player.
    }),

    getViews: builder.query<{ count: number }, string>({
      query: (videoId) => ({
        url: `/interaction/videos/${videoId}/views`,
        method: 'GET'
      }),
      // providesTags: ['View']
    }),

    // Like endpoints
    toggleLike: builder.mutation<Like, string>({
      query: (videoId) => ({
        url: `/interaction/videos/${videoId}/likes`,
        method: 'POST'
      }),
      // invalidatesTags: ['Like']
    }),

    getLikes: builder.query<{ count: number  , likedByCurrentUser :boolean}, string>({
      query: (videoId) => ({
        url: `/interaction/videos/${videoId}/likes`,
        method: 'GET'
      }),
      providesTags: (result, error, videoId) => [{ type: 'VideoInteraction' as const, id: videoId }],
    }),

    // Toggle like or dislike
    toggleLikeDislike: builder.mutation<
      { message: string },
      { videoId: string; isLiked: boolean }
    >({
      query: ({ videoId, isLiked }) => ({
        url: `/interaction/like-dislike/${videoId}`,
        method: 'POST',
        body: { isLiked }
      }),
      invalidatesTags: (result, error, { videoId }) => [{ type: 'VideoInteraction', id: videoId }],
    }),

    // Get likes
    // getLikes: builder.query<
    //   { count: number; likedByCurrentUser: boolean },
    //   string
    // >({
    //   query: (videoId) => ({
    //     url: `/interaction/likes/${videoId}`,
    //     method: 'GET'
    //   }),
    //   // providesTags: ['Like']
    // }),

    // Get dislikes
    getDislikes: builder.query<
      { count: number; dislikedByCurrentUser: boolean },
      string
    >({
      query: (videoId) => ({
        url: `/interaction/dislikes/${videoId}`,
        method: 'GET'
      }),
      providesTags: (result, error, videoId) => [{ type: 'VideoInteraction' as const, id: videoId }],
    }),

    // Report endpoints
    reportVideo: builder.mutation<
      { message: string; reportId: string },
      { videoId: string; reason: string; details?: string }
    >({
      query: ({ videoId, reason, details }) => ({
        url: `/reports/videos/${videoId}`,
        method: 'POST',
        body: { reason, details: details || '' }
      }),
      invalidatesTags: (result, error, { videoId }) => [
        { type: 'VideoInteraction' as const, id: videoId },
        'AdminReports',
      ],
    }),

    adminGetReports: builder.query<
      {
        reports: Array<{
          _id: string;
          reason: string;
          details?: string;
          status: 'open' | 'dismissed' | 'actioned';
          adminNotes?: string;
          createdAt: string;
          videoId?: { _id: string; title?: string; thumbnailPath?: string; isActive?: boolean };
          creatorId?: { name?: string; email?: string };
          reporterUserId?: { name?: string; email?: string };
          reviewedBy?: { name?: string; email?: string };
        }>;
        total: number;
        page: number;
        totalPages: number;
      },
      { status?: string; page?: number; limit?: number }
    >({
      query: (params) => ({ url: '/reports', params }),
      providesTags: ['AdminReports'],
    }),

    adminUpdateReport: builder.mutation<
      { message: string },
      { id: string; status?: string; adminNotes?: string; deactivateVideo?: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/reports/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminReports', 'Video'],
    }),

    upsertWatchHistory: builder.mutation<
      { message: string },
      { videoId: string; progressSeconds?: number; durationSeconds?: number; completed?: boolean }
    >({
      query: ({ videoId, ...body }) => ({
        url: `/interaction/videos/${videoId}/history`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['WatchHistory'],
    }),

    getContinueWatching: builder.query<
      {
        items: Array<{
          _id: string;
          progressSeconds: number;
          durationSeconds: number | null;
          lastWatchedAt: string;
          video: {
            _id: string;
            title: string;
            thumbnailPath?: string;
            previewPath?: string;
            duration?: number;
            monetization?: { type: string };
            stats?: { views?: number };
            creatorId?: { _id?: string; name?: string; username?: string; profileImage?: string };
            type?: string;
            filePath?: string;
          };
        }>;
      },
      { limit?: number } | void
    >({
      query: (params) => ({
        url: '/interaction/history/continue',
        params: params || {},
      }),
      providesTags: ['WatchHistory'],
    }),
  })
});

export const {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useAddReplyMutation,
  useAddViewMutation,
  useGetViewsQuery,
  useToggleLikeMutation,
  useGetLikesQuery,
  useToggleLikeDislikeMutation,
  useGetDislikesQuery,
  useReportVideoMutation,
  useAdminGetReportsQuery,
  useAdminUpdateReportMutation,
  useUpsertWatchHistoryMutation,
  useGetContinueWatchingQuery,
} = interactionApi;
