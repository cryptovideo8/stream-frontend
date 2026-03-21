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
    } catch (err: any) {
      console.error('Login error:', err);
      // RTK Query errors often look like { status, data: { message } } OR { error }
      const message = err?.data?.message || err?.error || 'Login failed. Please try again.';
      toast.error(message);
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
        <div 
          className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-red-45/20 via-red-45/5 to-transparent border border-red-45/30 text-center animate-fade-in group hover:border-red-45/60 transition-all cursor-pointer shadow-lg hover:shadow-red-45/5" 
          onClick={() => router.push('/signup?role=creator')}
        >
           <div className="flex justify-center mb-3">
             <div className="w-10 h-10 rounded-full bg-red-45/20 flex items-center justify-center group-hover:scale-110 transition-transform">
               <svg className="w-5 h-5 text-red-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
               </svg>
             </div>
           </div>
           <p className="text-[10px] font-black text-red-45 uppercase tracking-[0.2em] mb-1">Upload & Earn</p>
           <h3 className="text-white font-bold text-base mb-1">Become a <span className="text-red-45 italic">Creator</span></h3>
           <p className="text-grey-70 text-xs">Share your videos with our community and start building your audience today!</p>
           
           <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-red-45 group-hover:gap-3 transition-all">
             Register Now <span className="text-lg">→</span>
           </div>
        </div>
      </div>
    </div>
  );
}
