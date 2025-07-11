'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { authAPI } from '@/services/api';
import { ArrowLeft, User, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { auth, hydrated, setHydrated } = useStore();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Set hydrated to true on mount
  useEffect(() => {
    setHydrated(true);
  }, [setHydrated]);

  useEffect(() => {
    if (!hydrated) return; // Wait for store hydration
    if (!auth.isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        setProfile(response.user);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [auth.isAuthenticated, hydrated, router]);

  if (!hydrated) return null; // Don't render until hydrated
  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="bg-neutral-900 rounded-lg shadow-lg p-8 w-full max-w-lg border border-neutral-800">
        <h1 className="text-3xl font-display font-bold text-white mb-6">Profile</h1>
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        {/* Profile Card */}
        <div className="bg-neutral-900 rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your account information</p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading profile...</p>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="border-b pb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{profile.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{profile.email}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 font-medium">{profile.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              {profile.address && (
                <div className="border-b pb-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Address</h2>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      {profile.address.street && <p>{profile.address.street}</p>}
                      <p>{profile.address.city}, {profile.address.state} {profile.address.zipCode}</p>
                      <p>{profile.address.country}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Info */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Account Information</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Account Type:</span>
                    <span className="font-medium capitalize">{profile.role}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Member Since:</span>
                    <span className="font-medium">
                      {new Date(profile.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Failed to load profile</p>
            </div>
          )}
        </div>
        {/* Admin Panel Button */}
        {auth.user?.role === 'admin' && (
          <Link
            href="/admin"
            className="block bg-primary text-gold hover:bg-gold hover:text-primary font-semibold rounded-lg px-4 py-2 transition-colors w-full mb-2 text-center mt-4"
          >
            Go to Admin Panel
          </Link>
        )}
        <button className="bg-accent text-gold hover:bg-gold hover:text-accent font-semibold rounded-lg px-4 py-2 transition-colors w-full mt-4">Update Profile</button>
        <button
          className="bg-red-600 text-white hover:bg-red-700 font-semibold rounded-lg px-4 py-2 transition-colors w-full mt-2"
          onClick={() => {
            useStore.getState().logout();
            toast.success('Logged out successfully');
            router.push('/');
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
} 