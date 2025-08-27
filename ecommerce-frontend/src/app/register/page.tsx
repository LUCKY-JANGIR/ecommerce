'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
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
  const emailRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

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
    } catch (error: any) {
      const backendError = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message || 'Registration failed';
      toast.error(backendError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center">
      {/* Profile Setup Reminder Modal */}
      {showProfileReminder && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card border border-accent rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
          >
            <h2 className="text-2xl font-serif font-bold text-primary mb-4">Welcome!</h2>
            <p className="text-muted mb-6">Registration successful. Don&apos;t forget to set up your profile for a better experience!</p>
            <button
              className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-accent transition-colors shadow-lg"
              onClick={() => { setShowProfileReminder(false); router.push('/products'); }}
            >
              Go to Products
            </button>
          </motion.div>
        </motion.div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          {/* Back to home */}
          <Link
            href="/"
            className="inline-flex items-center text-muted hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          {/* Register Form */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-card border border-accent rounded-2xl shadow-lg p-10 w-full max-w-2xl"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif font-bold text-primary mb-2">Create Account</h1>
              <p className="text-muted">Join our community today</p>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="col-span-1">
                <label htmlFor="name" className="block text-sm font-medium text-muted mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                  <input
                    {...register('name')}
                    type="text"
                    id="name"
                    className="w-full pl-12 pr-4 py-4 border border-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-card text-primary placeholder-muted"
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-muted mb-2">
                  Email Address
                </label>
                <div className="flex gap-3 items-center">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                    <input
                      {...register('email')}
                      type="email"
                      id="email"
                      ref={emailRef}
                      className="w-full pl-12 pr-4 py-4 border border-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-card text-primary placeholder-muted"
                      placeholder="Enter your email"
                      disabled={otpSent || otpVerified}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => sendOtp(emailRef.current?.value || '')}
                    className="bg-primary text-white font-semibold rounded-xl px-6 py-4 transition-colors disabled:opacity-50 shadow-lg hover:bg-accent"
                    disabled={otpLoading || otpSent || otpVerified}
                  >
                    {otpLoading ? 'Sending...' : otpSent ? 'OTP Sent' : 'Send OTP'}
                  </button>
                </div>
                {otpError && <p className="mt-2 text-sm text-red-600">{otpError}</p>}
                {otpSuccess && <p className="mt-2 text-sm text-green-600">{otpSuccess}</p>}
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* OTP Field */}
              <div className="col-span-1 md:col-span-2 flex gap-3 items-end">
                <div className="flex-1">
                  <label htmlFor="otp" className="block text-sm font-medium text-muted mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="w-full px-4 py-4 border border-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-card text-primary placeholder-muted"
                    placeholder="Enter the OTP sent to your email"
                    maxLength={6}
                    disabled={!otpSent || otpVerified}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => verifyOtp(emailRef.current?.value || '', otp)}
                  className="bg-green-600 text-white font-semibold rounded-xl px-6 py-4 mb-1 transition-colors disabled:opacity-50 shadow-lg hover:bg-green-700"
                  disabled={otpLoading || !otpSent || otpVerified || otp.length !== 6}
                >
                  {otpLoading ? 'Verifying...' : otpVerified ? 'Verified' : 'Verify OTP'}
                </button>
              </div>

              {/* Password */}
              <div className="col-span-1">
                <label htmlFor="password" className="block text-sm font-medium text-muted mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    className="w-full pl-12 pr-12 py-4 border border-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-card text-primary placeholder-muted"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="col-span-1">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-muted mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className="w-full pl-12 pr-12 py-4 border border-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-card text-primary placeholder-muted"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted hover:text-primary transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Terms and Conditions (full width) */}
              <div className="col-span-1 md:col-span-2 flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 h-4 w-4 text-primary focus:ring-accent border-accent rounded"
                  required
                />
                <label htmlFor="terms" className="ml-3 text-sm text-muted">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:text-accent transition-colors">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:text-accent transition-colors">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button (full width) */}
              <div className="col-span-1 md:col-span-2">
                <button
                  type="submit"
                  disabled={isLoading || !otpVerified}
                  className="bg-accent text-white hover:bg-primary font-semibold rounded-xl px-6 py-4 transition-colors w-full mt-6 disabled:opacity-50 shadow-lg"
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
            <div className="mt-8 p-6 bg-accent/10 border border-accent rounded-xl">
              <strong className="text-primary">Important:</strong> After creating your account, please update your contact information (address and mobile number) in your profile. This is required for order delivery and communication.
            </div>

            {/* Divider */}
            <div className="my-8 flex items-center">
              <div className="flex-1 border-t border-accent"></div>
              <span className="px-4 text-sm text-muted">or</span>
              <div className="flex-1 border-t border-accent"></div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-muted">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:text-accent font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 