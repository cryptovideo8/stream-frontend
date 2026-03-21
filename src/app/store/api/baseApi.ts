import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { logout } from '../slices/authSlice'
import { API_BASE_URL } from '../../config/env'

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await baseQuery(args, api, extraOptions);

  // 401 = authentication failure (bad/missing/expired token) → clear session.
  // 403 = forbidden (wrong role, etc.) → do not log the user out; backend uses 403 for that.
  if (result.error && result.error.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    api.dispatch(logout());
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}), // We'll add endpoints in separate files
  tagTypes: [
    'Plans',
    'Promos',
    'MySubscription',
    'SubscriptionHistory',
    'AdminSubscriptions',
    'AdminSubscriptionStats',
    'Video',
    'VideoInteraction',
    'UpiAccounts',
    'AdminAudits',
    'MyAudits',
    'MyTickets',
    'AdminTickets',
  ],
}) 