import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../index'

interface AuthState {
  isAuthenticated: boolean
  user: {
    id?: string
    email?: string
    name?: string
    role?: string;
    subscriptionId?: string;
    autoplay?: boolean;
  } | null
  token: string | null
}

// const initialState: AuthState = {
//   isAuthenticated: false,
//   user: null,
//   token: null,
// }


const tokenFromStorage =
  typeof window !== 'undefined' ? localStorage.getItem('token') : null;
const userFromStorage =
  typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || 'null')
    : null;

const initialState: AuthState = {
  isAuthenticated: !!tokenFromStorage,
  user: userFromStorage,
  token: tokenFromStorage,
};


export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthState['user']; token: string }>
    ) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.isAuthenticated = true
      // Sync with localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      // Sync with localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    },
    setSubscriptionId: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.subscriptionId = action.payload
        // Sync with localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      }
    }
  },
})

export const { setCredentials, logout, setSubscriptionId } = authSlice.actions

// Selectors
export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectToken = (state: RootState) => state.auth.token

export default authSlice.reducer 