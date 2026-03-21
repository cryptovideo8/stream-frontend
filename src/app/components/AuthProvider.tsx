'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, logout } from '../store/slices/authSlice';

/** Decode JWT payload (no verification) for rehydrating minimal user when `user` is missing from storage. */
function decodeJwtPayload(token: string): { id?: string; role?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    if (pad) b64 += '='.repeat(4 - pad);
    const json = atob(b64);
    const payload = JSON.parse(json) as { id?: string; role?: string };
    return payload;
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch();

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            // If another tab logs out (clears token/user)
            if (e.key === 'token' && !e.newValue) {
                dispatch(logout());
            }
            // If another tab logs in (sets new token/user)
            if (e.key === 'token' && e.newValue) {
                try {
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        dispatch(setCredentials({ user, token: e.newValue }));
                    }
                } catch (err) {
                    console.error('Error syncing auth state from storage', err);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [dispatch]);

    // Initial client-side sync to ensure Redux state matches localStorage on mount
    // This deals with SSR hydration mismatch issues where the initial Redux state
    // might not have had access to localStorage during server rendering.
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                dispatch(setCredentials({ user, token }));
            } catch (err) {
                console.error('Error loading initial auth state', err);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                dispatch(logout());
            }
            return;
        }

        if (token && !userStr) {
            const payload = decodeJwtPayload(token);
            if (payload?.id) {
                dispatch(
                    setCredentials({
                        token,
                        user: {
                            id: String(payload.id),
                            role: payload.role,
                            name: 'User',
                            email: '',
                        },
                    })
                );
                localStorage.setItem(
                    'user',
                    JSON.stringify({
                        id: String(payload.id),
                        role: payload.role,
                        name: 'User',
                        email: '',
                    })
                );
            } else {
                localStorage.removeItem('token');
                dispatch(logout());
            }
            return;
        }

        if (!token && userStr) {
            localStorage.removeItem('user');
            dispatch(logout());
            return;
        }

        dispatch(logout());
    }, [dispatch]);

    return <>{children}</>;
}
