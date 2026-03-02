import { baseApi } from './baseApi';

export interface Comment {
  _id: string;
  videoId: string;
  userId?: string;
  text: string;
  timestamp: Date;
  ip: string;
  likes: number;
  replies: Reply[];
}

export interface Reply {
  fromUser: string;
  like: number;
  reply: string;
  ipAddress: string;
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
      // providesTags: ['Comment']
    }),

    createComment: builder.mutation<Comment, { videoId: string; text: string }>({
      query: ({ videoId, text }) => ({
        url: '/interaction/comments',
        method: 'POST',
        body: { videoId, text }
      }),
      // invalidatesTags: ['Comment']
    }),

    addReply: builder.mutation<Comment, { commentId: string; reply: string }>({
      query: ({ commentId, reply }) => ({
        url: `/interaction/comments/${commentId}/replies`,
        method: 'POST',
        body: { reply }
      }),
      // invalidatesTags: ['Comment']
    }),

    // View endpoints
    addView: builder.mutation<View, string>({
      query: (videoId) => ({
        url: `/interaction/videos/${videoId}/views`,
        method: 'POST'
      }),
      // invalidatesTags: ['View']
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
      // providesTags: ['Like']
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
      // invalidatesTags: ['Like']
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
      // providesTags: ['Dislike']
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
  useGetDislikesQuery
} = interactionApi;
