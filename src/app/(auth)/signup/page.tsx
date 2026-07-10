'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, User, Video } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useSendOtpMutation, useSignUpMutation } from '../../store/api/authApi';

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sendOtp, { isLoading: otpLoading }] = useSendOtpMutation();
  const [signUp, { isLoading: signupLoading }] = useSignUpMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState<'viewer' | 'creator'>('viewer');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [confirmAge, setConfirmAge] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'creator' || roleParam === 'viewer') {
      setRole(roleParam as 'viewer' | 'creator');
    }
  }, [searchParams]);

  const isStrongPassword = (password: string) => {
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return strongRegex.test(password);
  };

  const handleSendOtp = async () => {
    if (!isStrongPassword(password)) {
      toast.error(
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
      );
      return;
    }

    try {
      await sendOtp({ email }).unwrap();
      toast.success('OTP sent successfully');
      setOtpSent(true);
    } catch (err: any) {
      console.error('Send OTP error:', err);
      const message = err?.data?.message || err?.error || 'Failed to send OTP. Please try again.';
      toast.error(message);
    }
  };

  const handleSignup = async () => {
    if (!acceptTerms) {
      toast.error('You must accept the terms and conditions');
      return;
    }
    if (!confirmAge) {
      toast.error('You must confirm you are 18 years of age or older');
      return;
    }

    try {
      await signUp({ name, email, password, otp, role }).unwrap();
      toast.success('Signup successful');
      router.push('/login');
    } catch (err: any) {
      console.error('Signup error:', err);
      const message = err?.data?.message || err?.error || 'Signup failed. Please try again.';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-dark-6 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Create Account</h1>
          <p className="text-grey-70 text-sm">
            {role === 'creator' 
              ? 'Start your journey as a content creator today' 
              : 'Join our community of video enthusiasts'}
          </p>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (otpSent) {
              await handleSignup();
            } else {
              await handleSendOtp();
            }
          }}
          className="bg-dark-10 rounded-2xl p-8 shadow-xl border border-dark-25"
        >
          {/* Role Selection */}
          {!otpSent && (
            <div className="mb-6">
              <label className="block text-xs font-bold text-red-45 uppercase tracking-wider mb-3">
                Choose your path:
              </label>
              <div className="grid grid-cols-2 gap-3 p-1 bg-dark-15 rounded-xl border border-dark-25">
                <button
                  type="button"
                  onClick={() => setRole('viewer')}
                  className={`py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    role === 'viewer'
                      ? 'bg-red-45 text-white shadow-lg shadow-red-500/10'
                      : 'text-grey-70 hover:text-primary hover:bg-dark-20'
                  }`}
                >
                  <User size={16} />
                  Viewer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('creator')}
                  className={`py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    role === 'creator'
                      ? 'bg-red-45 text-white shadow-lg shadow-red-500/10'
                      : 'text-grey-70 hover:text-primary hover:bg-dark-20'
                  }`}
                >
                  <Video size={16} />
                  Creator
                </button>
              </div>
              {role === 'creator' && (
                <p className="mt-3 text-[10px] text-red-45/80 bg-red-45/5 py-2 px-3 rounded-lg border border-red-45/10 animate-fade-in">
                  ✨ Excellent choice! Creators get access to analytics, monetization, and video management tools.
                </p>
              )}
            </div>
          )}

          {/* Name */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-grey-70 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              disabled={otpSent}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-dark-15 border border-dark-25 rounded-lg text-primary disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-red-45 h-12"
              placeholder="e.g. John Doe"
              required
            />
          </div>

          {/* Email */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-grey-70 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              disabled={otpSent}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-dark-15 border border-dark-25 rounded-lg text-primary disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-red-45 h-12"
              placeholder="name@example.com"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-grey-70 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                disabled={otpSent}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-dark-15 border border-dark-25 rounded-lg text-primary disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-red-45 h-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-grey-70 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {!otpSent && (
              <p className="mt-2 text-[11px] text-grey-70">
                Minimum 8 characters with upper, lower, numbers & symbols.
              </p>
            )}
          </div>

          {/* OTP */}
          {otpSent && (
            <div className="mb-6 flex flex-col items-center">
              <label htmlFor="otp" className="block text-sm font-medium text-grey-70 mb-2 w-full">
                Enter Verification Code
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 bg-dark-15 border border-red-45/30 rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-red-45 text-center text-2xl tracking-[0.5em] h-14"
                placeholder="000000"
                maxLength={6}
                required
              />
              <p className="mt-2 text-xs text-grey-60">We sent a 6-digit code to your email.</p>
            </div>
          )}

          {/* Terms & Conditions */}
          {otpSent && (
            <div className="mb-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 mt-1 rounded border-dark-25 bg-dark-15 text-red-45 focus:ring-red-45"
                  required
                />
                <label htmlFor="terms" className="ml-2 text-xs text-grey-70 leading-relaxed">
                  By joining, I agree to the{' '}
                  <Link href="/terms" className="text-red-45 hover:underline">Terms</Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-red-45 hover:underline">Privacy Policy</Link>.
                </label>
              </div>
              <div className="flex items-start mt-3">
                <input
                  type="checkbox"
                  id="age"
                  checked={confirmAge}
                  onChange={(e) => setConfirmAge(e.target.checked)}
                  className="w-4 h-4 mt-1 rounded border-dark-25 bg-dark-15 text-red-45 focus:ring-red-45"
                  required
                />
                <label htmlFor="age" className="ml-2 text-xs text-grey-70 leading-relaxed">
                  I confirm that I am 18 years of age or older and that adult content may be present on this platform.
                </label>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={otpLoading || signupLoading}
            className={`w-full bg-red-45 text-primary py-3.5 rounded-xl font-bold transition-all disabled:opacity-60 shadow-lg ${
              !otpSent ? 'hover:bg-red-55 shadow-red-45/10' : 'hover:bg-red-55 shadow-red-45/20'
            }`}
          >
            {otpLoading || signupLoading 
              ? 'Processing...' 
              : otpSent 
                ? 'Complete Registration' 
                : 'Get Started'}
          </button>

          {/* Login Link */}
          <p className="mt-6 text-center text-xs text-grey-70">
            Already have an account?{' '}
            <Link href="/login" className="text-red-45 font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-6 flex items-center justify-center text-red-45">Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
