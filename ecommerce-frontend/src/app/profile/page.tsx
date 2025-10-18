'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { authAPI } from '@/components/services/api';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Dialog } from '@headlessui/react';
import { ProfilePageSkeleton } from '@/components/ui/Skeleton';

export default function ProfilePage() {
  const router = useRouter();
  const { auth, hydrated, setHydrated } = useStore();

  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    phone?: string;
    role?: string;
    createdAt?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  // Modal and form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });
  const [saving, setSaving] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);

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
      setLoading(true);
      try {
        const response = await authAPI.getProfile();
        setProfile(response);
        // Pre-fill form
        setForm({
          name: response.name || '',
          phone: response.phone || '',
          address: {
            street: response.address?.street || '',
            city: response.address?.city || '',
            state: response.address?.state || '',
            zipCode: response.address?.zipCode || '',
            country: response.address?.country || '',
          },
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [auth.isAuthenticated, hydrated, router]);

  useEffect(() => {
    if (hydrated && auth.isAuthenticated) {
      // Removed wishlist fetch as wishlist is removed
    }
  }, [hydrated, auth.isAuthenticated]);


  if (!hydrated) return null; // Don't render until hydrated
  if (!auth.isAuthenticated) {
    return null;
  }
  
  if (loading) {
    return <ProfilePageSkeleton />;
  }


  return (
    <div className="min-h-screen bg-dark-bg-primary">
      <div className="container w-full px-4 pt-24 pb-8">
        {/* Top Section: Profile Info and Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-dark-bg-secondary border border-dark-border-primary rounded-2xl shadow-lg p-8 md:p-12 w-full mb-10"
        >
          {/* User Avatar */}
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-gradient-to-r from-accent-500 to-primary-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-6 mx-auto shadow-lg">
              {profile?.name ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
            </div>
            <h1 className="text-4xl font-serif font-bold text-dark-text-primary mb-3">My Profile</h1>
            <p className="text-dark-text-secondary text-lg">Manage your account information</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Basic Info */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-dark-bg-tertiary border border-dark-border-primary rounded-xl p-6 shadow-md"
            >
              <h2 className="text-2xl font-serif font-bold text-dark-text-primary mb-6 flex items-center gap-3">
                <User className="h-6 w-6 text-accent-500" /> Basic Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-dark-text-secondary mr-3" />
                  <span className="text-dark-text-secondary">Name:</span>
                  <span className="ml-2 font-semibold text-dark-text-primary">{profile?.name}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-dark-text-secondary mr-3" />
                  <span className="text-dark-text-secondary">Email:</span>
                  <span className="ml-2 font-semibold text-dark-text-primary">{profile?.email}</span>
                </div>
                {profile?.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-dark-text-secondary mr-3" />
                    <span className="text-dark-text-secondary">Phone:</span>
                    <span className="ml-2 font-semibold text-dark-text-primary">{profile.phone}</span>
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Address */}
            {profile?.address && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-dark-bg-tertiary border border-dark-border-primary rounded-xl p-6 shadow-md"
              >
                <h2 className="text-2xl font-serif font-bold text-dark-text-primary mb-6 flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-accent-500" /> Address
                </h2>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-dark-text-secondary mr-3 mt-1" />
                  <div className="text-dark-text-secondary">
                    {profile.address.street && <p className="mb-1">{profile.address.street}</p>}
                    <p className="mb-1">{profile.address.city}, {profile.address.state} {profile.address.zipCode}</p>
                    <p>{profile.address.country}</p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Account Info */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-dark-bg-tertiary border border-dark-border-primary rounded-xl p-6 shadow-md"
            >
              <h2 className="text-2xl font-serif font-bold text-dark-text-primary mb-6 flex items-center gap-3">
                <User className="h-6 w-6 text-accent-500" /> Account Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-dark-text-secondary">Account Type:</span>
                  <span className="font-semibold text-dark-text-primary capitalize">{profile?.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-text-secondary">Member Since:</span>
                  <span className="font-semibold text-dark-text-primary">
                    {profile?.createdAt && !isNaN(new Date(profile.createdAt).getTime())
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col md:flex-row gap-4 mt-10"
          >
            {auth.user?.role === 'admin' && (
              <Link
                href="/admin"
                className="block bg-accent-500 text-white hover:bg-accent-600 font-semibold rounded-xl px-6 py-3 transition-colors w-full md:w-auto text-center shadow-lg"
              >
                Go to Admin Panel
              </Link>
            )}
            <button
              className="bg-primary-500 text-white hover:bg-primary-600 font-semibold rounded-xl px-6 py-3 transition-colors w-full md:w-auto shadow-lg"
              onClick={() => setIsModalOpen(true)}
            >
              Update Profile
            </button>
            <button
              className="bg-purple-600 text-white hover:bg-purple-700 font-semibold rounded-xl px-6 py-3 transition-colors w-full md:w-auto shadow-lg"
              onClick={() => setIsChangePasswordOpen(true)}
            >
              Change Password
            </button>
            <button
              className="bg-red-500 text-white hover:bg-red-600 font-semibold rounded-xl px-6 py-3 transition-colors w-full md:w-auto shadow-lg"
              onClick={() => {
                useStore.getState().logout();
                toast.success('Logged out successfully');
                router.push('/');
              }}
            >
              Logout
            </button>
          </motion.div>
        </motion.div>
        
        {/* Profile Update Modal */}
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          <div className="flex items-center justify-center min-h-screen px-4">
            <Dialog.Panel className="relative bg-dark-bg-secondary border border-gray-200 rounded-2xl shadow-xl w-full max-w-lg mx-auto p-8 z-50">
              <Dialog.Title className="text-2xl font-serif font-bold text-dark-text-primary mb-6 text-center">Update Profile</Dialog.Title>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  try {
                    const payload = {
                      name: form.name,
                      phone: form.phone,
                      address: { ...form.address },
                    };
                    await authAPI.updateProfile(payload);
                    toast.success('Profile updated successfully');
                    setIsModalOpen(false);
                    // Refresh profile info
                    const response = await authAPI.getProfile();
                    setProfile(response);
                                     } catch {
                     toast.error('Failed to update profile');
                  } finally {
                    setSaving(false);
                  }
                }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-dark-text-secondary mb-2">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-dark-border-primary rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-dark-bg-secondary text-dark-text-primary placeholder-dark-text-secondary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-text-secondary mb-2">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-dark-border-primary rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-dark-bg-secondary text-dark-text-primary placeholder-dark-text-secondary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-text-secondary mb-2">Street</label>
                  <input
                    type="text"
                    value={form.address.street}
                    onChange={e => setForm(f => ({ ...f, address: { ...f.address, street: e.target.value } }))}
                    className="w-full border border-dark-border-primary rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-dark-bg-secondary text-dark-text-primary placeholder-dark-text-secondary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-text-secondary mb-2">City</label>
                    <input
                      type="text"
                      value={form.address.city}
                      onChange={e => setForm(f => ({ ...f, address: { ...f.address, city: e.target.value } }))}
                      className="w-full border border-dark-border-primary rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-dark-bg-secondary text-dark-text-primary placeholder-dark-text-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-text-secondary mb-2">State</label>
                    <input
                      type="text"
                      value={form.address.state}
                      onChange={e => setForm(f => ({ ...f, address: { ...f.address, state: e.target.value } }))}
                      className="w-full border border-dark-border-primary rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-dark-bg-secondary text-dark-text-primary placeholder-dark-text-secondary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-text-secondary mb-2">Zip Code</label>
                    <input
                      type="text"
                      value={form.address.zipCode}
                      onChange={e => setForm(f => ({ ...f, address: { ...f.address, zipCode: e.target.value } }))}
                      className="w-full border border-dark-border-primary rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-dark-bg-secondary text-dark-text-primary placeholder-dark-text-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-text-secondary mb-2">Country</label>
                    <input
                      type="text"
                      value={form.address.country}
                      onChange={e => setForm(f => ({ ...f, address: { ...f.address, country: e.target.value } }))}
                      className="w-full border border-dark-border-primary rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-dark-bg-secondary text-dark-text-primary placeholder-dark-text-secondary"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-xl border border-dark-border-primary bg-dark-bg-secondary hover:bg-dark-bg-hover font-semibold transition-colors text-dark-text-secondary"
                    onClick={() => setIsModalOpen(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-accent-500 text-white font-bold hover:bg-accent-600 transition-colors disabled:opacity-60 shadow-lg"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Dialog>
        
        {/* Change Password Modal */}
        <Dialog open={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          <div className="flex items-center justify-center min-h-screen px-4">
            <Dialog.Panel className="relative bg-dark-bg-secondary border border-gray-200 rounded-2xl shadow-xl w-full max-w-lg mx-auto p-8 z-50">
              <Dialog.Title className="text-2xl font-serif font-bold text-dark-text-primary mb-6 text-center">Change Password</Dialog.Title>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (newPassword.length < 6) {
                    toast.error('New password must be at least 6 characters.');
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    toast.error('Passwords do not match.');
                    return;
                  }
                  setChanging(true);
                  try {
                    await authAPI.changePassword({ currentPassword, newPassword });
                    toast.success('Password changed successfully!');
                    setIsChangePasswordOpen(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  } catch (err: unknown) {
                    const errorMessage = err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Failed to change password.';
                    toast.error(errorMessage);
                  } finally {
                    setChanging(false);
                  }
                }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-dark-text-secondary mb-2">Current Password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full border border-dark-border-primary rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-dark-bg-secondary text-dark-text-primary placeholder-dark-text-secondary"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-dark-text-secondary mb-2">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full border border-dark-border-primary rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-dark-bg-secondary text-dark-text-primary placeholder-dark-text-secondary"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-text-secondary mb-2">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full border border-dark-border-primary rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-dark-bg-secondary text-dark-text-primary placeholder-dark-text-secondary"
                  />
                </div>
                <button
                  type="submit"
                  disabled={changing}
                  className="w-full py-3 px-6 bg-accent-500 text-white font-bold rounded-xl hover:bg-accent-600 transition-colors disabled:opacity-60 shadow-lg"
                >
                  {changing ? 'Changing...' : 'Change Password'}
                </button>
                <div className="text-center mt-4">
                  <Link href="/forgot-password" className="text-accent-500 hover:text-blue-700 underline text-sm">Forgot Password?</Link>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </div>
  );
} 