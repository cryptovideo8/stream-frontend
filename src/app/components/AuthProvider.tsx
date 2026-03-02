'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials, logout } from '../store/slices/authSlice';

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
        } else {
            // Ensure Redux is cleared if localStorage is missing
            dispatch(logout());
        }
    }, [dispatch]);

    return <>{children}</>;
}
