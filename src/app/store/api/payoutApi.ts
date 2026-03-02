import { baseApi } from './baseApi';

export const payoutApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // ─── Creator ──────────────────────────────────────────────────────────────

        /** Preview: how much the logged-in creator can earn right now */
        getEarnings: builder.query<any, void>({
            query: () => '/payout/earnings',
        }),

        /** Submit a payout request */
        requestPayout: builder.mutation<any, { paymentMethod: string; paymentDetails: string }>({
            query: (body) => ({ url: '/payout/request', method: 'POST', body }),
        }),

        /** List the logged-in creator's own payout requests */
        getMyPayoutRequests: builder.query<any, { page?: number; limit?: number }>({
            query: ({ page = 1, limit = 10 } = {}) =>
                `/payout/my-requests?page=${page}&limit=${limit}`,
        }),

        // ─── Payout Rate ──────────────────────────────────────────────────────────

        getPayoutRate: builder.query<any, void>({
            query: () => '/payout/rate',
        }),

        updatePayoutRate: builder.mutation<any, { ratePerMinute: number; currency?: string }>({
            query: (body) => ({ url: '/payout/rate', method: 'PUT', body }),
        }),

        // ─── Super Admin ──────────────────────────────────────────────────────────

        adminGetAllPayoutRequests: builder.query<
            any,
            { status?: string; creatorId?: string; from?: string; to?: string; page?: number; limit?: number }
        >({
            query: ({ status, creatorId, from, to, page = 1, limit = 20 } = {}) => {
                const params = new URLSearchParams();
                if (status) params.set('status', status);
                if (creatorId) params.set('creatorId', creatorId);
                if (from) params.set('from', from);
                if (to) params.set('to', to);
                params.set('page', String(page));
                params.set('limit', String(limit));
                return `/payout/admin/requests?${params.toString()}`;
            },
        }),

        adminGetPayoutStats: builder.query<any, void>({
            query: () => '/payout/admin/stats',
        }),

        adminGetPayoutRequestDetail: builder.query<any, string>({
            query: (id) => `/payout/admin/requests/${id}`,
        }),

        adminSettlePayoutRequest: builder.mutation<any, { id: string; adminNote?: string }>({
            query: ({ id, adminNote }) => ({
                url: `/payout/admin/requests/${id}/settle`,
                method: 'PUT',
                body: { adminNote: adminNote || '' },
            }),
        }),

        adminRejectPayoutRequest: builder.mutation<any, { id: string; adminNote: string }>({
            query: ({ id, adminNote }) => ({
                url: `/payout/admin/requests/${id}/reject`,
                method: 'PUT',
                body: { adminNote },
            }),
        }),
    }),
});

export const {
    useGetEarningsQuery,
    useRequestPayoutMutation,
    useGetMyPayoutRequestsQuery,
    useGetPayoutRateQuery,
    useUpdatePayoutRateMutation,
    useAdminGetAllPayoutRequestsQuery,
    useAdminGetPayoutStatsQuery,
    useAdminGetPayoutRequestDetailQuery,
    useAdminSettlePayoutRequestMutation,
    useAdminRejectPayoutRequestMutation,
} = payoutApi;
