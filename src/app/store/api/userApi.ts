import { baseApi } from './baseApi';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  // profileImage: string;
  subscriptionId: string | null;
  preferences: {
    quality: string;
    notifications: boolean;
    autoplay: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  activeSubscriptions: number;
}
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}


export interface UpdateUserRequest {
  id: string;
  name?: string;
  phone?: string;
  language?: string;
  preferences?: {
    notifications?: boolean;
    autoplay?: boolean;
    quality?: string;
  };
}

export interface PaginatedUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  subscriptionId: string | null;
  preferences: {
    quality: string;
    notifications: boolean;
    autoplay: boolean;
  };
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
}

export interface GetPaginatedUsersRequest {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedUserResponse {
  users: PaginatedUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}





export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<User[], void>({
      query: () => '/user',
    }),

    getUserById: builder.query<User, string>({
      query: (id) => `/user/${id}`,
    }),

    createUser: builder.mutation<{ message: string; user: User }, CreateUserRequest>({
      query: (body) => ({
        url: '/user',
        method: 'POST',
        body,
      }),
    }),

    deleteUser: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/user/${id}`,
        method: 'DELETE',
      }),
    }),

    updateUser: builder.mutation<{ message: string; user: User }, UpdateUserRequest>({
      query: ({ id, ...body }) => ({
        url: `/user/${id}`,
        method: 'PUT',
        body
      })
    }),

    getPaginatedUsers: builder.query<PaginatedUserResponse, GetPaginatedUsersRequest>({
      query: ({ page = 1, limit = 10, search = '' }) =>
        `/user/users?page=${page}&limit=${limit}&search=${search}`,
    }),

    // New API: User Stats
    getUserStats: builder.query<UserStats, void>({
      query: () => '/user/userStats',
    }),

    toggleUserActive: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/user/${id}/block`,
        method: 'PUT',
      }),
    }),

    getPublicProfile: builder.query<
      {
        _id: string;
        name?: string;
        username?: string;
        profileImage?: string;
        role: string;
        createdAt?: string;
      },
      string
    >({
      query: (id) => `/user/${id}/public`,
    }),

  }),

});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useGetPaginatedUsersQuery,
  useGetUserStatsQuery,
  useToggleUserActiveMutation,
  useGetPublicProfileQuery,
} = userApi;
