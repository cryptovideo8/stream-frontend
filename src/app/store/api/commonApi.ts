import { baseApi } from './baseApi';

export interface GenericMaster {
  _id: string;
  key: string;
  value: string;
  desc?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateGenericMasterRequest {
  key: string;
  value: string;
  desc?: string;
}

export interface UpdateGenericMasterRequest {
  id: string;
  key?: string;
  value?: string;
  desc?: string;
}

export const commonApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Get all records by key (e.g., 'category', 'tag')
    getGenericMasterByKey: builder.query<GenericMaster[], string>({
      query: (key) => `/genericMaster/${key}`,
      providesTags: [],
    }),

    // ✅ Create a new record
    createGenericMaster: builder.mutation<{ message: string; data: GenericMaster }, CreateGenericMasterRequest>({
      query: (body) => ({
        url: '/genericMaster',
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),

    // ✅ Update existing record
    updateGenericMaster: builder.mutation<{ message: string }, UpdateGenericMasterRequest>({
      query: ({ id, ...body }) => ({
        url: `/genericMaster/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [],
    }),

    // ✅ Delete record by ID
    deleteGenericMaster: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/genericMaster/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [],
    }),
  }),
});

export const {
  useGetGenericMasterByKeyQuery,
  useCreateGenericMasterMutation,
  useUpdateGenericMasterMutation,
  useDeleteGenericMasterMutation,
} = commonApi;
