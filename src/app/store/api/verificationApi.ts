import { baseApi } from './baseApi';

export type VerificationDocType = 'id_front' | 'id_back' | 'release' | 'other';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface VerificationDoc {
  _id: string;
  userId:
    | string
    | { _id: string; name?: string; email?: string; role?: string };
  docType: VerificationDocType;
  fileUrl: string;
  originalName?: string;
  status: VerificationStatus;
  adminNotes?: string;
  createdAt: string;
  reviewedBy?: { name?: string; email?: string };
}

export const verificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyVerificationDocs: builder.query<{ docs: VerificationDoc[] }, void>({
      query: () => '/verification/me',
      providesTags: ['VerificationDocs'],
    }),
    uploadVerificationDoc: builder.mutation<
      { message: string; doc: VerificationDoc },
      FormData
    >({
      query: (formData) => ({
        url: '/verification',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['VerificationDocs'],
    }),
    adminGetVerificationDocs: builder.query<
      { docs: VerificationDoc[] },
      { status?: string } | void
    >({
      query: (params) => ({
        url: '/verification/admin',
        params: params || {},
      }),
      providesTags: ['AdminVerification'],
    }),
    adminUpdateVerificationDoc: builder.mutation<
      { message: string; doc: VerificationDoc },
      { id: string; status?: VerificationStatus; adminNotes?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/verification/admin/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminVerification', 'VerificationDocs'],
    }),
  }),
});

export const {
  useGetMyVerificationDocsQuery,
  useUploadVerificationDocMutation,
  useAdminGetVerificationDocsQuery,
  useAdminUpdateVerificationDocMutation,
} = verificationApi;
