'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '@/store/useStore';
import { authAPI } from '@/components/services/api';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [showProfileReminder, setShowProfileReminder] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  const sendOtp = async (email: string) => {
    setOtpLoading(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/send-otp`, { email });
      setOtpSent(true);
      setOtpSuccess('OTP sent to your email.');
      toast.success('OTP sent successfully! Check your email.');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to send OTP.';
      setOtpError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setOtpLoading(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/verify-otp`, { email, otp });
      setOtpVerified(true);
      setOtpSuccess('Email verified! You can now register.');
      toast.success('Email verified successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid or expired OTP.';
      setOtpError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    if (!otpVerified) {
      toast.error('Please verify your email with OTP before registering.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await authAPI.register({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      login(response.user, response.token);
      toast.success('Registration successful!');
      setTimeout(() => setShowProfileReminder(true), 1000); // Show reminder after 1s
      setTimeout(() => router.push('/'), 3500); // Redirect after 3.5s
    } catch (error: any) {
      const backendError = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Registration failed';
      toast.error(backendError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      {/* Profile Setup Reminder Modal */}
      {showProfileReminder && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-xl font-bold mb-4">Welcome!</h2>
            <p className="mb-6">Registration successful. Don’t forget to set up your profile for a better experience!</p>
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              onClick={() => { setShowProfileReminder(false); router.push('/profile'); }}
            >
              Go to Profile Setup
            </button>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back to home */}
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          {/* Register Form */}
          <div className="bg-white rounded-lg shadow-lg p-10 w-full max-w-2xl border border-gray-200">
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Register</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="col-span-1">
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('name')}
                    type="text"
                    id="name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Email Address
                </label>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      {...register('email')}
                      type="email"
                      id="email"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email"
                      disabled={otpSent || otpVerified}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => sendOtp((document.getElementById('email') as HTMLInputElement)?.value)}
                    className="bg-blue-600 text-white font-semibold rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
                    disabled={otpLoading || otpSent || otpVerified}
                  >
                    {otpLoading ? 'Sending...' : otpSent ? 'OTP Sent' : 'Send OTP'}
                  </button>
                </div>
                {otpError && <p className="mt-1 text-sm text-red-600">{otpError}</p>}
                {otpSuccess && <p className="mt-1 text-sm text-green-600">{otpSuccess}</p>}
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* OTP Field */}
              <div className="col-span-1 md:col-span-2 flex gap-2 items-end">
                <div className="flex-1">
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-900 mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter the OTP sent to your email"
                    maxLength={6}
                    disabled={!otpSent || otpVerified}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => verifyOtp((document.getElementById('email') as HTMLInputElement)?.value, otp)}
                  className="bg-green-600 text-white font-semibold rounded-lg px-4 py-2 mb-1 transition-colors disabled:opacity-50"
                  disabled={otpLoading || !otpSent || otpVerified || otp.length !== 6}
                >
                  {otpLoading ? 'Verifying...' : otpVerified ? 'Verified' : 'Verify OTP'}
                </button>
              </div>

              {/* Password */}
              <div className="col-span-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="col-span-1">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Terms and Conditions (full width) */}
              <div className="col-span-1 md:col-span-2 flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button (full width) */}
              <div className="col-span-1 md:col-span-2">
                <button
                  type="submit"
                  disabled={isLoading || !otpVerified}
                  className="bg-accent text-gold hover:bg-gold hover:text-accent font-semibold rounded-lg px-4 py-2 transition-colors w-full mt-4 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>

            {/* Disclaimer for contact info update */}
            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded">
              <strong>Important:</strong> After creating your account, please update your contact information (address and mobile number) in your profile. This is required for order delivery and communication.
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 