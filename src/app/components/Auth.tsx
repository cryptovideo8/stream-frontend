'use client';
import { useState } from 'react';
import {
  LockClosedIcon,
  EnvelopeIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface FormData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  name?: string;
  confirmPassword?: string;
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({ email: '', password: '', name: '', confirmPassword: '' });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const passwordRequirements = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
    { label: 'Special character', test: (p: string) => /[!@#$%^&*]/.test(p) },
  ];

  const validateForm = () => {
    const newErrors: ValidationErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!isLogin && !formData.name) newErrors.name = 'Name is required';
    if (!isLogin && formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push('/dashboard');
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({ email: '', password: '', name: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#0a0a0a' }}>
      {/* Animated background blobs */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(227,0,0,0.12) 0%, transparent 70%)',
          top: '-200px',
          right: '-200px',
          animation: 'glowPulse 6s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(227,0,0,0.06) 0%, transparent 70%)',
          bottom: '-100px',
          left: '-100px',
          animation: 'glowPulse 8s ease-in-out infinite reverse',
        }}
      />

      {/* Auth Card */}
      <div
        className="relative w-full max-w-md rounded-2xl p-8 animate-fade-in"
        style={{
          background: 'rgba(20,20,20,0.8)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-black mb-1"
            style={{ background: 'linear-gradient(135deg, #E30000, #FF5555)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            NightKing
          </h1>
          <p className="text-sm text-grey-60">Premium Streaming Platform</p>
          <div className="mt-6">
            <h2 className="text-xl font-bold text-white">{isLogin ? 'Welcome back' : 'Create account'}</h2>
            <p className="text-grey-60 text-sm mt-1">
              {isLogin ? 'Sign in to access exclusive content' : 'Join and start streaming today'}
            </p>
          </div>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium text-grey-70 hover:text-white hover:border-dark-30 transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium text-grey-70 hover:text-white hover:border-dark-30 transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <svg className="w-4 h-4" style={{ fill: '#5865F2' }} viewBox="0 0 24 24">
              <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 00-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 00-5.487 0 12.36 12.36 0 00-.617-1.23A.077.077 0 008.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 00-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 00.031.055 20.03 20.03 0 005.993 2.98.078.078 0 00.084-.026 13.83 13.83 0 001.226-1.963.074.074 0 00-.041-.104 13.201 13.201 0 01-1.872-.878.075.075 0 01-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 01.078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 01.079.009c.12.098.245.195.372.288a.075.075 0 01-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 00-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 00.084.028 19.963 19.963 0 006.002-2.981.076.076 0 00.032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 00-.031-.028z" />
            </svg>
            Discord
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center mb-6">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <span className="mx-3 text-xs text-grey-60 font-medium">or continue with email</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field (signup only) */}
          {!isLogin && (
            <div>
              <div className="relative">
                <UserIcon className="input-icon" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className={`input-with-icon ${errors.name ? 'border-red-500/60 focus:ring-red-500/40' : ''}`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
            </div>
          )}

          {/* Email */}
          <div>
            <div className="relative">
              <EnvelopeIcon className="input-icon" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                className={`input-with-icon ${errors.email ? 'border-red-500/60 focus:ring-red-500/40' : ''}`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <LockClosedIcon className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className={`input-with-icon pr-11 ${errors.password ? 'border-red-500/60 focus:ring-red-500/40' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-grey-60 hover:text-grey-70 transition-colors"
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
          </div>

          {/* Confirm Password + Requirements (signup) */}
          {!isLogin && (
            <>
              <div>
                <div className="relative">
                  <LockClosedIcon className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm Password"
                    className={`input-with-icon ${errors.confirmPassword ? 'border-red-500/60 focus:ring-red-500/40' : ''}`}
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword}</p>}
              </div>

              {/* Password strength */}
              <div
                className="rounded-xl p-3 space-y-1.5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {passwordRequirements.map((req, i) => {
                  const ok = req.test(formData.password || '');
                  return (
                    <div key={i} className={`flex items-center gap-2 text-xs transition-colors ${ok ? 'text-green-400' : 'text-grey-60'}`}>
                      {ok ? <CheckCircleIcon className="h-3.5 w-3.5 text-green-400" /> : <XCircleIcon className="h-3.5 w-3.5 text-grey-60" />}
                      {req.label}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Forgot password */}
          {isLogin && (
            <div className="text-right">
              <a href="/forgot-password" className="text-xs text-grey-60 hover:text-red-45 transition-colors">
                Forgot password?
              </a>
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={isLoading} className="btn-primary mt-2">
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-grey-60 text-sm mt-6">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={switchMode} className="text-red-45 hover:text-red-60 ml-1.5 font-medium transition-colors">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}