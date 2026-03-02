// src/store/api/planApi.ts
import { baseApi } from './baseApi';

export interface Plan {
  _id: string;
  name: string;
  description: string;
  features: string[];
  price: number;
  validity: number;
}

export const planApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllPlans: builder.query<Plan[], void>({
      query: () => ({
        url: '/plan',
        method: 'GET'
      }),
    //   providesTags: ['Plan']
    }),

    getPlanById: builder.query<Plan, string>({
      query: (id) => ({
        url: `/plan/${id}`,
        method: 'GET'
      }),
    //   providesTags: ['Plan']
    }),

    getSubscriptionDetails: builder.query<Plan, string>({
      query: (id) => ({
        url: `/subscription/${id}`,
        method: 'GET'
      }),
    //   providesTags: ['Plan']
    }),

    createPlan: builder.mutation<Plan, Partial<Plan>>({
      query: (body) => ({
        url: '/plan',
        method: 'POST',
        body
      }),
    //   invalidatesTags: ['Plan']
    }),

    updatePlan: builder.mutation<Plan, { id: string; body: Partial<Plan> }>({
      query: ({ id, body }) => ({
        url: `/plan/${id}`,
        method: 'PUT',
        body
      }),
    //   invalidatesTags: ['Plan']
    }),

    deletePlan: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/plan/${id}`,
        method: 'DELETE'
      }),
    //   invalidatesTags: ['Plan']
    })
  })
});

export const {
  useGetAllPlansQuery,
  useGetPlanByIdQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation
} = planApi;


