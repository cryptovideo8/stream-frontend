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
      // Do not invalidate Video — reminting Bunny src remounts the iframe mid-playback.
      invalidatesTags: (result, error, { videoId }) => [
        { type: 'VideoInteraction' as const, id: videoId },
      ],
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
  useReportVideoMutation
} = interactionApi;
