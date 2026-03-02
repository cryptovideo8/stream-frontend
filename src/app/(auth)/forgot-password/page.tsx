'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRequestResetPasswordMutation, useVerifyResetPasswordMutation } from '../../store/api/authApi';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password

  const [requestReset, { isLoading: isRequesting }] = useRequestResetPasswordMutation();
  const [verifyReset, { isLoading: isVerifying }] = useVerifyResetPasswordMutation();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestReset({ email }).unwrap();
      toast.success('OTP sent to your email');
      setStep(2);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyReset({ email, otp, newPassword }).unwrap();
      toast.success('Password reset successfully');
      router.push('/login');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen bg-dark-6 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Reset Password</h1>
          <p className="text-grey-70">
            {step === 1
              ? "Enter your email address and we'll send you instructions to reset your password"
              : "Enter the 6-digit OTP sent to your email and your new password"
            }
          </p>
        </div>

        <div className="bg-dark-10 rounded-2xl p-8 shadow-xl">
          {step === 1 ? (
            <form onSubmit={handleRequestReset}>
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

              <button
                type="submit"
                disabled={isRequesting}
                className="w-full bg-red-45 text-primary py-3 rounded-lg font-medium hover:bg-red-55 transition-colors disabled:opacity-50"
              >
                {isRequesting ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyReset}>
              <div className="mb-4">
                <label htmlFor="otp" className="block text-sm font-medium text-grey-70 mb-2">
                  6-Digit OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-15 border border-dark-25 rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-red-45 focus:border-transparent"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="newPassword" className="block text-sm font-medium text-grey-70 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-15 border border-dark-25 rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-red-45 focus:border-transparent"
                  placeholder="Enter new password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-red-45 text-primary py-3 rounded-lg font-medium hover:bg-red-55 transition-colors disabled:opacity-50"
              >
                {isVerifying ? 'Resetting...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full mt-4 text-sm text-grey-70 hover:text-primary transition-colors"
              >
                Change Email
              </button>
            </form>
          )}

          {/* Back to Login (Only show in step 1 or at bottom) */}
          <p className="mt-6 text-center text-grey-70">
            Remember your password?{' '}
            <Link href="/login" className="text-red-45 hover:text-red-55">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 