import { baseApi } from './baseApi';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role : string,
    subscriptionId : string,
    autoplay : boolean
  };
  token: string;
}

interface SendOtpRequest {
  email: string;
}

interface SignupRequest {
  name: string;
  email: string;
  password: string;
  otp: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),

    // ✅ Send OTP
    sendOtp: builder.mutation<void, SendOtpRequest>({
      query: ({ email }) => ({
        url: '/auth/send-otp',
        method: 'POST',
        body: { email },
      }),
    }),

    // ✅ Signup
    signUp: builder.mutation<void, SignupRequest>({
      query: ({ name, email, password, otp }) => ({
        url: '/auth/signup',
        method: 'POST',
        body: { name, email, password, otp },
      }),
    }),
  }),
});
export const {
  useLoginMutation,
  useLogoutMutation,
  useSendOtpMutation,
  useSignUpMutation,
} = authApi;