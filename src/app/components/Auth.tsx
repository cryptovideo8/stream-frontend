'use client';
import { useState } from 'react';
import {
  LockClosedIcon,
  EnvelopeIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  useLoginMutation, 
  useSendOtpMutation, 
  useSignUpMutation 
} from '../store/api/authApi';
import { toast } from 'react-hot-toast';

interface FormData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
  otp?: string;
  role: 'viewer' | 'creator';
}

interface ValidationErrors {
  email?: string;
  password?: string;
  name?: string;
  confirmPassword?: string;
  otp?: string;
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({ 
    email: '', 
    password: '', 
    name: '', 
    confirmPassword: '',
    otp: '',
    role: 'viewer'
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const router = useRouter();

  // RTK Query Mutations
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [sendOtp, { isLoading: isOtpLoading }] = useSendOtpMutation();
  const [signUp, { isLoading: isSignupLoading }] = useSignUpMutation();

  const validateForm = () => {
    const newErrors: ValidationErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.password) newErrors.password = 'Password is required';
    
    if (!isLogin) {
      if (!formData.name) newErrors.name = 'Name is required';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      if (otpSent && !formData.otp) newErrors.otp = 'OTP is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!formData.email || errors.email) {
       setErrors({ ...errors, email: 'Enter valid email first' });
       return;
    }
    try {
      await sendOtp({ email: formData.email }).unwrap();
      setOtpSent(true);
      toast.success('OTP sent to your email!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to send OTP');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isLogin) {
        const res = await login({ email: formData.email, password: formData.password }).unwrap();
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        toast.success('Welcome back!');
        router.push('/dashboard');
      } else {
        if (!otpSent) {
          handleSendOtp();
          return;
        }
        await signUp({ 
          name: formData.name!, 
          email: formData.email, 
          password: formData.password, 
          otp: formData.otp!,
          role: formData.role
        }).unwrap();
        toast.success('Account created! Please sign in.');
        setIsLogin(true);
        setOtpSent(false);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Authentication failed');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const fieldName = name as keyof ValidationErrors;
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: undefined }));
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setOtpSent(false);
    setErrors({});
    setFormData({ email: '', password: '', name: '', confirmPassword: '', otp: '', role: 'viewer' });
  };

  const isLoading = isLoginLoading || isOtpLoading || isSignupLoading;

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
        <div className="text-center mb-6">
          <h1
            className="text-3xl font-black mb-1 cursor-pointer"
            onClick={() => router.push('/')}
            style={{ background: 'linear-gradient(135deg, #E30000, #FF5555)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            NightKing
          </h1>
          <div className="mt-4">
            <h2 className="text-xl font-bold text-white tracking-tight">{isLogin ? 'Welcome back' : 'Join the Revolution'}</h2>
            <p className="text-grey-60 text-sm mt-1">
              {isLogin ? 'Sign in to access your premium content' : 'Create an account and start streaming today'}
            </p>
          </div>
        </div>

        {/* Role Selection (Signup) */}
        {!isLogin && !otpSent && (
          <div className="flex bg-dark-15 p-1 rounded-xl mb-6 border border-dark-25">
             <button 
              type="button"
              onClick={() => setFormData({...formData, role: 'viewer'})}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${formData.role === 'viewer' ? 'bg-red-45 text-white shadow-lg shadow-red-500/10' : 'text-grey-60 hover:text-white'}`}
             >
                <UserIcon className="w-4 h-4" />
                Viewer
             </button>
             <button 
              type="button"
              onClick={() => setFormData({...formData, role: 'creator'})}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${formData.role === 'creator' ? 'bg-red-45 text-white shadow-lg shadow-red-500/10' : 'text-grey-60 hover:text-white'}`}
             >
                <VideoCameraIcon className="w-4 h-4" />
                Creator
             </button>
          </div>
        )}

        {/* OTP Progress Bar (Signup) */}
        {!isLogin && otpSent && (
          <div className="mb-6 animate-slide-up">
            <div className="flex items-center gap-2 text-green-45 text-sm mb-2">
               <ShieldCheckIcon className="w-5 h-5" />
               <span className="font-semibold tracking-wide">Verification Required</span>
            </div>
            <p className="text-xs text-grey-60">We sent a 6-digit code to <span className="text-white font-medium">{formData.email}</span></p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && !otpSent && (
            <div className="animate-slide-up">
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
              {errors.name && <p className="text-red-500 text-[10px] ml-4 mt-1">{errors.name}</p>}
            </div>
          )}

          {!otpSent && (
            <div className="animate-slide-up">
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
              {errors.email && <p className="text-red-500 text-[10px] ml-4 mt-1">{errors.email}</p>}
            </div>
          )}

          {!otpSent && (
            <div className="animate-slide-up">
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-grey-60 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-[10px] ml-4 mt-1">{errors.password}</p>}
            </div>
          )}

          {!isLogin && !otpSent && (
            <div className="animate-slide-up">
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
              {errors.confirmPassword && <p className="text-red-500 text-[10px] ml-4 mt-1">{errors.confirmPassword}</p>}
            </div>
          )}

          {!isLogin && otpSent && (
            <div className="animate-scale-in">
              <div className="relative">
                <ShieldCheckIcon className="input-icon" />
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className={`input-with-icon tracking-[1em] text-center font-bold text-lg ${errors.otp ? 'border-red-500/60 focus:ring-red-500/40' : ''}`}
                />
              </div>
              {errors.otp && <p className="text-red-500 text-[10px] ml-4 mt-1 text-center">{errors.otp}</p>}
              <div className="text-center mt-4">
                <button 
                  type="button" 
                  onClick={handleSendOtp} 
                  disabled={isLoading}
                  className="text-xs text-grey-60 hover:text-red-45 transition-colors underline decoration-dotted underline-offset-4"
                >
                  Didn&apos;t receive code? Resend
                </button>
              </div>
            </div>
          )}

          {isLogin && (
            <div className="text-right">
              <Link href="/forgot-password" data-testid="forgot-password-link" className="text-xs text-grey-60 hover:text-red-45 transition-colors">
                Forgot password?
              </Link>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading} 
            className={`btn-primary mt-4 py-3 text-sm font-semibold tracking-wide ${!isLogin && !otpSent ? 'bg-white text-black hover:bg-white/90' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : (
              isLogin ? 'Sign In' : (otpSent ? 'Verify & Create Account' : 'Send Verification OTP')
            )}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-grey-60 text-sm mt-8 border-t border-dark-25 pt-6">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={switchMode} className="text-red-45 hover:text-red-60 ml-2 font-bold transition-all hover:underline underline-offset-4">
            {isLogin ? 'Create one now' : 'Sign in here'}
          </button>
        </p>
      </div>
    </div>
  );
}