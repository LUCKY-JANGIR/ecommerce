'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { authAPI } from '@/components/services/api';
import { ArrowLeft, User, Mail, Phone, MapPin, Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ProductCard from '@/components/ProductCard';
import { Dialog } from '@headlessui/react';

export default function ProfilePage() {
  const router = useRouter();
  const { auth, hydrated, setHydrated, wishlist, removeFromWishlist, addToCart } = useStore();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
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
      try {
        const response = await authAPI.getProfile();
        setProfile(response.user);
        // Pre-fill form
        setForm({
          name: response.user.name || '',
          phone: response.user.phone || '',
          address: {
            street: response.user.address?.street || '',
            city: response.user.address?.city || '',
            state: response.user.address?.state || '',
            zipCode: response.user.address?.zipCode || '',
            country: response.user.address?.country || '',
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

  if (!hydrated) return null; // Don't render until hydrated
  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start">
      <div className="container w-full px-4 pt-24 pb-8">
        {/* Top Section: Profile Info and Actions */}
        <div className="bg-white/80 backdrop-blur border-gray-200 rounded-xl shadow-lg animate-fadein px-6 py-8 md:p-12 w-full mb-10">
          {/* User Avatar */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-[#d4af37] rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 mx-auto">
              {profile?.name ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
            </div>
            <h1 className="text-4xl font-cinzel font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your account information</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Basic Info */}
            <div className="bg-white/30 border border-gray-200 rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-playfair font-bold text-[#d4af37] mb-4 flex items-center gap-2"><User className="h-6 w-6" /> Basic Information</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{profile?.name}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{profile?.email}</span>
                </div>
                {profile?.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 font-medium">{profile.phone}</span>
                  </div>
                )}
              </div>
            </div>
            {/* Address */}
            {profile?.address && (
              <div className="bg-white/30 border border-gray-200 rounded-lg p-6 shadow-md">
                <h2 className="text-2xl font-playfair font-bold text-[#d4af37] mb-4 flex items-center gap-2"><MapPin className="h-6 w-6" /> Address</h2>
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
            <div className="bg-white/30 border border-gray-200 rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-playfair font-bold text-[#d4af37] mb-4 flex items-center gap-2"><User className="h-6 w-6" /> Account Information</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Account Type:</span>
                  <span className="font-medium capitalize">{profile?.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-medium">
                    {profile?.createdAt && !isNaN(new Date(profile.createdAt).getTime())
                      ? new Date(profile.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 mt-8">
            {auth.user?.role === 'admin' && (
              <Link
                href="/admin"
                className="block bg-primary text-gold hover:bg-gold hover:text-primary font-semibold rounded-lg px-4 py-2 transition-colors w-full md:w-auto text-center"
              >
                Go to Admin Panel
              </Link>
            )}
            <button
              className="bg-accent text-gold hover:bg-gold hover:text-accent font-semibold rounded-lg px-4 py-2 transition-colors w-full md:w-auto"
              onClick={() => setIsModalOpen(true)}
            >
              Update Profile
            </button>
            <button
              className="bg-blue-600 text-white hover:bg-blue-700 font-semibold rounded-lg px-4 py-2 transition-colors w-full md:w-auto"
              onClick={() => setIsChangePasswordOpen(true)}
            >
              Change Password
            </button>
            <button
              className="bg-red-600 text-white hover:bg-red-700 font-semibold rounded-lg px-4 py-2 transition-colors w-full md:w-auto"
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
        {/* Profile Update Modal */}
        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          <div className="flex items-center justify-center min-h-screen px-4">
            <Dialog.Panel className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-auto p-8 z-50">
              <Dialog.Title className="text-2xl font-bold mb-4 text-center">Update Profile</Dialog.Title>
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
                    setProfile(response.user);
                  } catch (err) {
                    toast.error('Failed to update profile');
                  } finally {
                    setSaving(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Street</label>
                  <input
                    type="text"
                    value={form.address.street}
                    onChange={e => setForm(f => ({ ...f, address: { ...f.address, street: e.target.value } }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      value={form.address.city}
                      onChange={e => setForm(f => ({ ...f, address: { ...f.address, city: e.target.value } }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <input
                      type="text"
                      value={form.address.state}
                      onChange={e => setForm(f => ({ ...f, address: { ...f.address, state: e.target.value } }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Zip Code</label>
                    <input
                      type="text"
                      value={form.address.zipCode}
                      onChange={e => setForm(f => ({ ...f, address: { ...f.address, zipCode: e.target.value } }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <input
                      type="text"
                      value={form.address.country}
                      onChange={e => setForm(f => ({ ...f, address: { ...f.address, country: e.target.value } }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 font-semibold"
                    onClick={() => setIsModalOpen(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-primary text-gold font-bold hover:bg-gold hover:text-primary transition-colors disabled:opacity-60"
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
            <Dialog.Panel className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-auto p-8 z-50">
              <Dialog.Title className="text-2xl font-bold mb-4 text-center">Change Password</Dialog.Title>
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
                  } catch (err: any) {
                    toast.error(err?.message || 'Failed to change password.');
                  } finally {
                    setChanging(false);
                  }
                }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <button
                  type="submit"
                  disabled={changing}
                  className="w-full py-2 px-4 bg-primary text-white font-bold rounded hover:bg-primary-dark transition disabled:opacity-60"
                >
                  {changing ? 'Changing...' : 'Change Password'}
                </button>
                <div className="text-center mt-4">
                  <Link href="/forgot-password" className="text-blue-600 hover:underline text-sm">Forgot Password?</Link>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Dialog>
        {/* Bottom Section: Wishlist */}
        <div className="bg-white/80 backdrop-blur border-gray-200 rounded-xl shadow-lg animate-fadein px-6 py-8 md:p-12 w-full">
          <h2 className="text-2xl font-playfair font-bold text-[#d4af37] mb-4 flex items-center gap-2"><Heart className="h-6 w-6" /> My Wishlist</h2>
          {wishlist.length === 0 ? (
            <div className="text-gray-400 text-center py-8">Your wishlist is empty.</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {wishlist.map((product) => (
                <div key={product._id} className="relative group">
                  <ProductCard product={product} />
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <button
                      onClick={() => {
                        addToCart(product, 1);
                        toast.success('Added to cart!');
                      }}
                      className="bg-[#d4af37] text-black px-3 py-1 rounded-lg font-bold shadow hover:bg-[#e6c385] transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4 inline mr-1" /> Add to Cart
                    </button>
                    <button
                      onClick={() => {
                        removeFromWishlist(product._id);
                        toast.success('Removed from wishlist');
                      }}
                      className="bg-black/60 border border-[#d4af37] text-[#d4af37] px-3 py-1 rounded-lg font-bold shadow hover:bg-[#d4af37] hover:text-black transition-colors"
                    >
                      <Heart className="h-4 w-4 inline mr-1" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 