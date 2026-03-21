import { baseApi } from './baseApi';

export interface SupportTicket {
  _id: string;
  userId: string;
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
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
    getAllTickets: builder.query<SupportTicket[], void>({
      query: () => '/support/all',
      providesTags: ['AdminTickets'],
    }),
  }),
});

export const {
  useCreateTicketMutation,
  useGetMyTicketsQuery,
  useGetAllTicketsQuery,
} = supportApi;
