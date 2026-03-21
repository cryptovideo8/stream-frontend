'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useSendOtpMutation, useSignUpMutation } from '../../store/api/authApi';

export default function SignUpPage() {
  const router = useRouter();
  const [sendOtp, { isLoading: otpLoading }] = useSendOtpMutation();
  const [signUp, { isLoading: signupLoading }] = useSignUpMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState<'viewer' | 'creator'>('viewer');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

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
      toast.error(err?.data?.message || 'Failed to send OTP');
    }
  };

  const handleSignup = async () => {
    if (!acceptTerms) {
      toast.error('You must accept the terms and conditions');
      return;
    }

    try {
      await signUp({ name, email, password, otp, role }).unwrap();
      toast.success('Signup successful');
      router.push('/login');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-dark-6 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Create Account</h1>
          <p className="text-grey-70">Join our community of video enthusiasts</p>
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
          className="bg-dark-10 rounded-2xl p-8 shadow-xl"
        >
          {/* Role Selection */}
          {!otpSent && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-grey-70 mb-3">
                I am signing up as a:
              </label>
              <div className="grid grid-cols-2 gap-3 p-1 bg-dark-15 rounded-xl border border-dark-25">
                <button
                  type="button"
                  onClick={() => setRole('viewer')}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    role === 'viewer'
                      ? 'bg-red-45 text-white shadow-lg shadow-red-500/10'
                      : 'text-grey-70 hover:text-primary'
                  }`}
                >
                  Viewer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('creator')}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    role === 'creator'
                      ? 'bg-red-45 text-white shadow-lg shadow-red-500/10'
                      : 'text-grey-70 hover:text-primary'
                  }`}
                >
                  Creator
                </button>
              </div>
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
              className="w-full px-4 py-3 bg-dark-15 border border-dark-25 rounded-lg text-primary disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-red-45"
              placeholder="Enter your full name"
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
              className="w-full px-4 py-3 bg-dark-15 border border-dark-25 rounded-lg text-primary disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-red-45"
              placeholder="Enter your email"
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
                className="w-full px-4 py-3 bg-dark-15 border border-dark-25 rounded-lg text-primary disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-red-45"
                placeholder="Create a password"
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
            <p className="mt-2 text-sm text-grey-70">
              Must be at least 8 characters long
            </p>
          </div>

          {/* OTP */}
          {otpSent && (
            <div className="mb-6">
              <label htmlFor="otp" className="block text-sm font-medium text-grey-70 mb-2">
                OTP
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 bg-dark-15 border border-dark-25 rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-red-45"
                placeholder="Enter the OTP"
                required
              />
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
                <label htmlFor="terms" className="ml-2 text-sm text-grey-70">
                  I agree to the{' '}
                  <Link href="/terms" className="text-red-45 hover:text-red-55">Terms of Service</Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-red-45 hover:text-red-55">Privacy Policy</Link>
                </label>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={otpLoading || signupLoading}
            className="w-full bg-red-45 text-primary py-3 rounded-lg font-medium hover:bg-red-55 transition-colors disabled:opacity-60"
          >
            {otpLoading || signupLoading ? 'Please wait...' : otpSent ? 'Create Account' : 'Send OTP'}
          </button>

          {/* Login Link */}
          <p className="mt-6 text-center text-grey-70">
            Already have an account?{' '}
            <Link href="/login" className="text-red-45 hover:text-red-55">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
