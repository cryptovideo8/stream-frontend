'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../../store/api/authApi';
import { setCredentials } from '../../store/slices/authSlice';
import { useAppSelector } from '../../store/hooks';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [login] = useLoginMutation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login({ email, password }).unwrap();

      dispatch(setCredentials({ user: res.user, token: res.token }));
      toast.success('Login successful');
      router.push('/subscriptions'); // or dashboard
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-6 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Welcome Back</h1>
          <p className="text-grey-70">Sign in to continue watching</p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-dark-10 rounded-2xl p-8 shadow-xl"
        >
          {/* Email Field */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-grey-70 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-dark-15 border border-dark-25 rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-red-45 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-grey-70 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-dark-15 border border-dark-25 rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-red-45 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-70 hover:text-primary"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Remember Me + Forgot Password */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-dark-25 bg-dark-15 text-red-45 focus:ring-red-45"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-grey-70">
                Remember me
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm text-red-45 hover:text-red-55"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-45 text-primary py-3 rounded-lg font-medium hover:bg-red-55 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Signup Link */}
          <p className="mt-6 text-center text-grey-70">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-red-45 hover:text-red-55">
              Sign up
            </Link>
          </p>
        </form>

        {/* Creator Callout */}
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-red-45/10 to-transparent border border-red-45/20 text-center animate-fade-in group hover:border-red-45/40 transition-all cursor-pointer" onClick={() => router.push('/signup')}>
           <p className="text-xs font-bold text-red-45 uppercase tracking-widest mb-1">Want to share your content?</p>
           <h3 className="text-white font-bold text-sm">Join as a <span className="text-red-45">Creator</span> and start uploading videos today!</h3>
        </div>
      </div>
    </div>
  );
}
