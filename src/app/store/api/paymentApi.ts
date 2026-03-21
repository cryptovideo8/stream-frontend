import { baseApi } from './baseApi';

export interface UpiAccount {
  _id: string;
  upiId: string;
  isActive: boolean;
  createdAt: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface PaymentAudit {
  _id: string;
  userId: { _id: string; name: string; email: string; username: string };
  planId: { _id: string; name: string; price: number; validity: number };
  upiIdUsed: string;
  utrNumber: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  remarks: string;
  createdAt: string;
  approvedBy?: { _id: string; name: string; email: string };
  approvedAt?: string;
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ---- UPI APIs ----
    createUpi: builder.mutation<UpiAccount, { upiId: string }>({
      query: (body) => ({
        url: '/upi',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['UpiAccounts'],
    }),
    getAllUpis: builder.query<UpiAccount[], void>({
      query: () => '/upi',
      providesTags: ['UpiAccounts'],
    }),
    getActiveUpi: builder.query<UpiAccount, void>({
      query: () => '/upi/active',
    }),
    toggleUpi: builder.mutation<UpiAccount, string>({
      query: (id) => ({
        url: `/upi/${id}/toggle`,
        method: 'PUT',
      }),
      invalidatesTags: ['UpiAccounts'],
    }),
    deleteUpi: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/upi/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UpiAccounts'],
    }),

    // ---- Payment Audit APIs ----
    submitAudit: builder.mutation<{ message: string; audit: PaymentAudit }, { planId: string; upiIdUsed: string; utrNumber: string }>({
      query: (body) => ({
        url: '/paymentAudit/submit',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MyAudits', 'AdminAudits'],
    }),
    getMyAudits: builder.query<PaymentAudit[], void>({
      query: () => '/paymentAudit/my-audits',
      providesTags: ['MyAudits'],
    }),
    getAllAudits: builder.query<PaymentAudit[], { status?: string; userId?: string; upiId?: string; startDate?: string; endDate?: string }>({
      query: (params) => ({
        url: '/paymentAudit',
        params,
      }),
      providesTags: ['AdminAudits'],
    }),
    approveAudit: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/paymentAudit/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['AdminAudits', 'MyAudits', 'MySubscription', 'AdminSubscriptions', 'AdminSubscriptionStats'],
    }),
    rejectAudit: builder.mutation<{ message: string }, { id: string; remarks: string }>({
      query: ({ id, remarks }) => ({
        url: `/paymentAudit/${id}/reject`,
        method: 'POST',
        body: { remarks },
      }),
      invalidatesTags: ['AdminAudits', 'MyAudits'],
    }),
  }),
});

export const {
  useCreateUpiMutation,
  useGetAllUpisQuery,
  useGetActiveUpiQuery,
  useToggleUpiMutation,
  useDeleteUpiMutation,
  
  useSubmitAuditMutation,
  useGetMyAuditsQuery,
  useGetAllAuditsQuery,
  useApproveAuditMutation,
  useRejectAuditMutation,
} = paymentApi;
