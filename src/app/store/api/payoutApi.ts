import { baseApi } from './baseApi';

export interface EarningsResponse {
  totalEarned: number;
  pendingPayouts: number;
  availableToRequest: number;
  currency: string;
}

export interface PayoutRequest {
  _id: string;
  creatorId: { _id: string; name: string; email: string };
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentDetails: string;
  status: 'pending' | 'settled' | 'rejected';
  adminNote?: string;
  requestedAt: string;
  settledAt?: string;
  periodStart: string;
  periodEnd: string;
  totalWatchMinutes: number;
  ratePerMinute: number;
  videoBreakdown?: Array<{
    videoId: string;
    title: string;
    watchMinutes: number;
  }>;
  createdAt: string;
}

export interface PayoutRate {
  ratePerMinute: number;
  currency: string;
  updatedAt: string;
}

export interface PayoutStats {
  counts: {
    pending: number;
    settled: number;
    rejected: number;
  };
  amounts: {
    pending: number;
    settled: number;
    rejected: number;
  };
  monthlyVolume: Array<{
    _id: string; // month
    amount: number;
    count: number;
  }>;
  topCreators: Array<{
    creator: { _id: string; name: string; email: string };
    totalEarned: number;
  }>;
}

export const payoutApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        // ─── Creator ──────────────────────────────────────────────────────────────

        /** Preview: how much the logged-in creator can earn right now */
        getEarnings: builder.query<EarningsResponse, void>({
            query: () => '/payout/earnings',
        }),

        /** Submit a payout request */
        requestPayout: builder.mutation<{ message: string; request: PayoutRequest }, { paymentMethod: string; paymentDetails: string }>({
            query: (body) => ({ url: '/payout/request', method: 'POST', body }),
        }),

        /** List the logged-in creator's own payout requests */
        getMyPayoutRequests: builder.query<{ requests: PayoutRequest[]; total: number; page: number; totalPages: number }, { page?: number; limit?: number }>({
            query: ({ page = 1, limit = 10 } = {}) =>
                `/payout/my-requests?page=${page}&limit=${limit}`,
        }),

        // ─── Payout Rate ──────────────────────────────────────────────────────────

        getPayoutRate: builder.query<PayoutRate, void>({
            query: () => '/payout/rate',
        }),

        updatePayoutRate: builder.mutation<{ message: string; rate: PayoutRate }, { ratePerMinute: number; currency?: string }>({
            query: (body) => ({ url: '/payout/rate', method: 'PUT', body }),
        }),

        // ─── Super Admin ──────────────────────────────────────────────────────────

        adminGetAllPayoutRequests: builder.query<
            { requests: PayoutRequest[]; total: number; page: number; totalPages: number },
            {
                status?: string;
                creatorId?: string;
                creatorEmail?: string;
                from?: string;
                to?: string;
                minAmount?: string;
                page?: number;
                limit?: number;
            }
        >({
            query: ({ status, creatorId, creatorEmail, from, to, minAmount, page = 1, limit = 20 } = {}) => {
                const params = new URLSearchParams();
                if (status) params.set('status', status);
                if (creatorId) params.set('creatorId', creatorId);
                if (creatorEmail) params.set('creatorEmail', creatorEmail);
                if (from) params.set('from', from);
                if (to) params.set('to', to);
                if (minAmount !== undefined && minAmount !== '') params.set('minAmount', String(minAmount));
                params.set('page', String(page));
                params.set('limit', String(limit));
                return `/payout/admin/requests?${params.toString()}`;
            },
        }),

        adminGetPayoutStats: builder.query<PayoutStats, void>({
            query: () => '/payout/admin/stats',
        }),

        adminGetPayoutRequestDetail: builder.query<PayoutRequest, string>({
            query: (id) => `/payout/admin/requests/${id}`,
        }),

        adminSettlePayoutRequest: builder.mutation<{ message: string }, { id: string; adminNote?: string }>({
            query: ({ id, adminNote }) => ({
                url: `/payout/admin/requests/${id}/settle`,
                method: 'PUT',
                body: { adminNote: adminNote || '' },
            }),
        }),

        adminRejectPayoutRequest: builder.mutation<{ message: string }, { id: string; adminNote: string }>({
            query: ({ id, adminNote }) => ({
                url: `/payout/admin/requests/${id}/reject`,
                method: 'PUT',
                body: { adminNote },
            }),
        }),

        /** Paid/rent watch-time heartbeat (authenticated viewer) */
        trackWatchTime: builder.mutation<
            {
                message: string;
                credited: number;
                totalUniqueSeconds?: number;
                maxCompletedSessionSeconds?: number;
                currentSessionSeconds?: number;
            },
            { videoId: string; seconds: number; deviceFingerprint: string }
        >({
            query: ({ videoId, seconds, deviceFingerprint }) => ({
                url: `/payout/video/${videoId}/watchtime`,
                method: 'POST',
                body: { seconds, deviceFingerprint },
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
    useTrackWatchTimeMutation,
} = payoutApi;
