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
import BrandLogo from './BrandLogo';
import { BRAND } from '../config/brand';

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
      if (otpSent && (!formData.otp || formData.otp.length < 6)) newErrors.otp = '6-digit OTP is required';
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
        toast.success(
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-green-500" />
            Welcome back!
          </div>
        );
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
        toast.success(
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-green-500 animate-pulse" />
            Account created! Please sign in.
          </div>
        );
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-mesh">
      {/* Animated background blobs */}
      <div className="absolute inset-0 bg-dark-6 opacity-90 z-0"></div>
      <div className="absolute w-[600px] h-[600px] rounded-full pointer-events-none z-0 mix-blend-screen" style={{ background: 'radial-gradient(circle, rgba(227,0,0,0.15) 0%, transparent 70%)', top: '-200px', right: '-200px', animation: 'glowPulse 6s ease-in-out infinite' }} />
      <div className="absolute w-[400px] h-[400px] rounded-full pointer-events-none z-0 mix-blend-screen" style={{ background: 'radial-gradient(circle, rgba(227,0,0,0.08) 0%, transparent 70%)', bottom: '-100px', left: '-100px', animation: 'glowPulse 8s ease-in-out infinite reverse' }} />
      
      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <div key={i} className={`absolute w-1 h-1 rounded-full bg-red-45/40 pointer-events-none z-0 ${i % 2 === 0 ? 'animate-float' : 'animate-float-slow'}`} style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s` }} />
      ))}

      {/* Auth Card */}
      <div className="theme-panel relative w-full max-w-md rounded-2xl p-8 animate-fade-in z-10 shadow-card-hover">
        
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-1">
            <BrandLogo variant="mark-text" markClassName="h-10 w-10" className="justify-center" priority />
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-grey-60 mb-3">{BRAND.tagline}</p>
          <div className="mt-4">
            <h2 className="text-xl font-bold text-primary tracking-tight">{isLogin ? 'Welcome back' : 'Join the Revolution'}</h2>
            <p className="text-grey-60 text-sm mt-1">{isLogin ? 'Sign in to access your premium content' : 'Create an account and start streaming today'}</p>
          </div>
        </div>

        {/* Role Selection (Signup) */}
        {!isLogin && !otpSent && (
          <div className="grid grid-cols-2 gap-3 mb-6">
             <button type="button" onClick={() => setFormData({...formData, role: 'viewer'})} className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-sm font-medium transition-all duration-300 ${formData.role === 'viewer' ? 'bg-red-45/10 border-red-45 text-primary shadow-glow-sm' : 'bg-dark-15 border-dark-25 text-grey-60 hover:text-primary hover:border-dark-30'}`}>
                <UserIcon className={`w-6 h-6 ${formData.role === 'viewer' ? 'text-red-45' : 'text-grey-60'}`} />
                <span>Viewer</span>
             </button>
             <button type="button" onClick={() => setFormData({...formData, role: 'creator'})} className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-sm font-medium transition-all duration-300 ${formData.role === 'creator' ? 'bg-red-45/10 border-red-45 text-primary shadow-glow-sm' : 'bg-dark-15 border-dark-25 text-grey-60 hover:text-primary hover:border-dark-30'}`}>
                <VideoCameraIcon className={`w-6 h-6 ${formData.role === 'creator' ? 'text-red-45' : 'text-grey-60'}`} />
                <span>Creator</span>
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
            <p className="text-xs text-grey-60">We sent a 6-digit code to <span className="text-primary font-medium">{formData.email}</span></p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && !otpSent && (
            <div className="animate-slide-up relative">
              <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} placeholder=" " className={`block px-4 pb-2.5 pt-5 w-full text-sm text-primary bg-dark-15 rounded-xl border ${errors.name ? 'border-red-500/60 focus:ring-red-500/40' : 'border-dark-25 focus:border-red-45'} appearance-none focus:outline-none focus:ring-0 peer transition-colors`} />
              <label htmlFor="name" className="absolute text-sm text-grey-60 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-red-45 cursor-text">Full Name</label>
              <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-grey-60 pointer-events-none" />
              {errors.name && <p className="text-red-500 text-[10px] ml-4 mt-1">{errors.name}</p>}
            </div>
          )}

          {!otpSent && (
            <div className="animate-slide-up relative">
              <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} placeholder=" " className={`block px-4 pb-2.5 pt-5 w-full text-sm text-primary bg-dark-15 rounded-xl border ${errors.email ? 'border-red-500/60 focus:ring-red-500/40' : 'border-dark-25 focus:border-red-45'} appearance-none focus:outline-none focus:ring-0 peer transition-colors`} />
              <label htmlFor="email" className="absolute text-sm text-grey-60 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-red-45 cursor-text">Email Address</label>
              <EnvelopeIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-grey-60 pointer-events-none" />
              {errors.email && <p className="text-red-500 text-[10px] ml-4 mt-1">{errors.email}</p>}
            </div>
          )}

          {!otpSent && (
            <div className="animate-slide-up relative">
              <input type={showPassword ? 'text' : 'password'} name="password" id="password" value={formData.password} onChange={handleInputChange} placeholder=" " className={`block px-4 pb-2.5 pt-5 pr-11 w-full text-sm text-primary bg-dark-15 rounded-xl border ${errors.password ? 'border-red-500/60 focus:ring-red-500/40' : 'border-dark-25 focus:border-red-45'} appearance-none focus:outline-none focus:ring-0 peer transition-colors`} />
              <label htmlFor="password" className="absolute text-sm text-grey-60 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-red-45 cursor-text">Password</label>
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-grey-60 hover:text-primary transition-colors">
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
              {errors.password && <p className="text-red-500 text-[10px] ml-4 mt-1">{errors.password}</p>}
            </div>
          )}

          {!isLogin && !otpSent && (
            <div className="animate-slide-up relative">
              <input type={showPassword ? 'text' : 'password'} name="confirmPassword" id="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder=" " className={`block px-4 pb-2.5 pt-5 pr-11 w-full text-sm text-primary bg-dark-15 rounded-xl border ${errors.confirmPassword ? 'border-red-500/60 focus:ring-red-500/40' : 'border-dark-25 focus:border-red-45'} appearance-none focus:outline-none focus:ring-0 peer transition-colors`} />
              <label htmlFor="confirmPassword" className="absolute text-sm text-grey-60 duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] left-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-red-45 cursor-text">Confirm Password</label>
              <LockClosedIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-grey-60 pointer-events-none" />
              {errors.confirmPassword && <p className="text-red-500 text-[10px] ml-4 mt-1">{errors.confirmPassword}</p>}
            </div>
          )}

          {!isLogin && otpSent && (
            <div className="animate-scale-in">
              <div className="flex justify-between gap-2 mb-2">
                {[0,1,2,3,4,5].map((idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={formData.otp?.[idx] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!/^[0-9]*$/.test(val)) return;
                      const newOtp = (formData.otp || '').split('');
                      newOtp[idx] = val;
                      setFormData({...formData, otp: newOtp.join('').slice(0,6)});
                      if (val && e.target.nextElementSibling) {
                        (e.target.nextElementSibling as HTMLInputElement).focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !formData.otp?.[idx] && e.currentTarget.previousElementSibling) {
                        (e.currentTarget.previousElementSibling as HTMLInputElement).focus();
                      }
                    }}
                    className={`w-12 h-14 text-center text-xl font-bold bg-dark-15 border rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-red-45/40 ${errors.otp ? 'border-red-500/60' : 'border-dark-25 focus:border-red-45'}`}
                  />
                ))}
              </div>
              {errors.otp && <p className="text-red-500 text-[10px] ml-4 mt-1 text-center">{errors.otp}</p>}
              <div className="text-center mt-4">
                <button type="button" onClick={handleSendOtp} disabled={isLoading} className="text-xs text-grey-60 hover:text-red-45 transition-colors underline decoration-dotted underline-offset-4">
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
            className={`btn-primary mt-4 py-3 text-sm font-semibold tracking-wide ${!isLogin && !otpSent ? 'bg-white text-black hover:bg-white/90 shadow-white/20' : ''}`}
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

        {/* Social Proof */}
        <p className="text-center text-[11px] font-medium text-grey-60 mt-5 animate-fade-in flex items-center justify-center gap-1.5 opacity-80">
          <ShieldCheckIcon className="w-3.5 h-3.5 text-green-45" /> Join 50K+ members already on {BRAND.name}
        </p>
      </div>
    </div>
  );
}