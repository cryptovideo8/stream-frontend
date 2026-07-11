import { baseApi } from './baseApi';

export interface Plan {
  _id: string;
  name: string;
  description?: string;
  features: string[];
  price: number;
  currency: string;
  validity: number;
  validityDays: number;
  isActive: boolean;
  highlight: boolean;
  sortOrder: number;
  maxScreens: number;
  createdAt: string;
}

export interface PromoValidationResponse {
  valid: boolean;
  code?: string;
  discountType?: 'percent' | 'flat';
  discountValue?: number;
  discountAmount?: number;
  originalPrice?: number;
  finalPrice?: number;
  description?: string;
  message?: string;
}

export interface SubscribeRequest {
  planId: string;
  paymentMethod: string;
  transactionId: string;
  amountPaid: number;
  promoCode?: string;
  autoRenew?: boolean;
}

export interface Promo {
  _id: string;
  code: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  applicablePlans: string[] | Plan[];
  validFrom: string;
  validUntil?: string;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface Subscription {
  _id: string;
  userId: string | { _id: string; name: string; email: string };
  planId: string | Plan;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  paymentDetails: {
    paymentMethod: string;
    transactionId: string;
    amountPaid: number;
  };
  promoCodeId?: string;
  promoCode?: string;
  discountApplied: number;
  finalAmountPaid: number;
  autoRenew: boolean;
  createdAt: string;
}

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─── Public ─────────────────────────────────────────────────────────────
    getPlans: builder.query<Plan[], void>({
      query: () => '/subscription/plans',
      providesTags: ['Plans'],
    }),

    // ─── User ───────────────────────────────────────────────────────────────
    validatePromo: builder.mutation<PromoValidationResponse, { code: string; planId?: string }>({
      query: (body) => ({
        url: '/subscription/promo/validate',
        method: 'POST',
        body,
      }),
    }),

    subscribeToPlan: builder.mutation<{ message: string; subscription: Subscription }, SubscribeRequest>({
      query: (body) => ({
        url: '/subscription/subscribe',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MySubscription', 'SubscriptionHistory', 'AdminSubscriptions', 'AdminSubscriptionStats'],
    }),

    getMySubscription: builder.query<{ active: boolean; subscription: Subscription | null }, void>({
      query: () => '/subscription/my',
      providesTags: ['MySubscription'],
    }),

    getPaymentConfig: builder.query<
      {
        mode: 'gateway' | 'manual';
        manualEnabled: boolean;
        gatewayEnabled: boolean;
        razorpayKeyId: string | null;
        gatewayMisconfigured?: boolean;
      },
      void
    >({
      query: () => '/subscription/payment-config',
    }),

    createRazorpayOrder: builder.mutation<
      {
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
        planId: string;
        planName: string;
        amountInr: number;
        discountApplied: number;
      },
      { planId: string; promoCode?: string }
    >({
      query: (body) => ({
        url: '/subscription/razorpay/create-order',
        method: 'POST',
        body,
      }),
    }),

    verifyRazorpayPayment: builder.mutation<
      {
        success: boolean;
        alreadyProcessed?: boolean;
        message: string;
        subscription?: Subscription;
      },
      {
        planId: string;
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        promoCode?: string;
      }
    >({
      query: (body) => ({
        url: '/subscription/razorpay/verify',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MySubscription', 'SubscriptionHistory', 'AdminSubscriptions', 'AdminSubscriptionStats'],
    }),

    cancelSubscription: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/subscription/cancel',
        method: 'POST',
      }),
      invalidatesTags: ['MySubscription', 'SubscriptionHistory', 'AdminSubscriptions', 'AdminSubscriptionStats'],
    }),

    // ─── Super Admin: Plans ─────────────────────────────────────────────────
    adminGetPlans: builder.query<Plan[], void>({
      query: () => '/subscription/admin/plans',
      providesTags: ['Plans'],
    }),
    createPlan: builder.mutation<{ message: string; plan: Plan }, Partial<Plan>>({
      query: (body) => ({ url: '/subscription/admin/plans', method: 'POST', body }),
      invalidatesTags: ['Plans'],
    }),
    updatePlan: builder.mutation<{ message: string; plan: Plan }, { id: string; data: Partial<Plan> }>({
      query: ({ id, data }) => ({ url: `/subscription/admin/plans/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Plans'],
    }),
    togglePlan: builder.mutation<{ message: string; plan: Plan }, string>({
      query: (id) => ({ url: `/subscription/admin/plans/${id}/toggle`, method: 'PATCH' }),
      invalidatesTags: ['Plans'],
    }),
    deletePlan: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/subscription/admin/plans/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Plans'],
    }),

    // ─── Super Admin: Promos ────────────────────────────────────────────────
    adminGetPromos: builder.query<{ promos: Promo[]; total: number; page: number; totalPages: number }, { page?: number; limit?: number; active?: boolean }>({
      query: (params) => ({ url: '/subscription/admin/promo', params }),
      providesTags: ['Promos'],
    }),
    createPromo: builder.mutation<{ message: string; promo: Promo }, Partial<Promo>>({
      query: (body) => ({ url: '/subscription/admin/promo', method: 'POST', body }),
      invalidatesTags: ['Promos'],
    }),
    updatePromo: builder.mutation<{ message: string; promo: Promo }, { id: string; data: Partial<Promo> }>({
      query: ({ id, data }) => ({ url: `/subscription/admin/promo/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Promos'],
    }),
    togglePromo: builder.mutation<{ message: string; promo: Promo }, string>({
      query: (id) => ({ url: `/subscription/admin/promo/${id}/toggle`, method: 'PATCH' }),
      invalidatesTags: ['Promos'],
    }),

    // ─── Admin / Super Admin: Subscriptions ─────────────────────────────────
    adminGetSubscriptions: builder.query<{ subscriptions: Subscription[]; total: number; page: number; totalPages: number }, any>({
      query: (params) => ({ url: '/subscription/admin/list', params }),
      providesTags: ['AdminSubscriptions'],
    }),
    adminGrantSubscription: builder.mutation<{ message: string; subscription: Subscription }, { userId: string; planId: string; note?: string }>({
      query: (body) => ({ url: '/subscription/admin/grant', method: 'POST', body }),
      invalidatesTags: ['AdminSubscriptions', 'AdminSubscriptionStats', 'MySubscription'],
    }),
    adminGetSubscriptionStats: builder.query<any, void>({
      query: () => '/subscription/admin/stats',
      providesTags: ['AdminSubscriptionStats'],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useValidatePromoMutation,
  useSubscribeToPlanMutation,
  useGetMySubscriptionQuery,
  useGetPaymentConfigQuery,
  useCreateRazorpayOrderMutation,
  useVerifyRazorpayPaymentMutation,
  useCancelSubscriptionMutation,

  useAdminGetPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useTogglePlanMutation,
  useDeletePlanMutation,

  useAdminGetPromosQuery,
  useCreatePromoMutation,
  useUpdatePromoMutation,
  useTogglePromoMutation,

  useAdminGetSubscriptionsQuery,
  useAdminGrantSubscriptionMutation,
  useAdminGetSubscriptionStatsQuery,
} = subscriptionApi;
