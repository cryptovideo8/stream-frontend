import { baseApi } from './baseApi';

export interface SupportTicket {
  _id: string;
  userId: string | { _id: string; name?: string; email?: string };
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  adminNotes?: string;
  createdAt: string;
}

export interface CreateTicketRequest {
  subject: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
}

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTicket: builder.mutation<{ message: string; ticket: SupportTicket }, CreateTicketRequest>({
      query: (body) => ({
        url: '/support',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MyTickets'],
    }),
    getMyTickets: builder.query<SupportTicket[], void>({
      query: () => '/support/my-tickets',
      providesTags: ['MyTickets'],
    }),
    getAllTickets: builder.query<SupportTicket[], { status?: string } | void>({
      query: (params) => ({
        url: '/support/all',
        params: params || {},
      }),
      providesTags: ['AdminTickets'],
    }),
    adminUpdateTicket: builder.mutation<
      { message: string; ticket: SupportTicket },
      { id: string; status?: string; adminNotes?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/support/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminTickets'],
    }),
  }),
});

export const {
  useCreateTicketMutation,
  useGetMyTicketsQuery,
  useGetAllTicketsQuery,
  useAdminUpdateTicketMutation,
} = supportApi;
