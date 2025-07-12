'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { authAPI } from '@/services/api';
import { ArrowLeft, User, Mail, Phone, MapPin, Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ProductCard from '@/components/ProductCard';

export default function ProfilePage() {
  const router = useRouter();
  const { auth, hydrated, setHydrated, wishlist, removeFromWishlist, addToCart } = useStore();
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
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-start">
      <div className="container w-full px-4 py-8 md:py-16">
        {/* Top Section: Profile Info and Actions */}
        <div className="bg-black/40 backdrop-blur border-[#d4af37] rounded-xl shadow-lg animate-fadein px-6 py-8 md:p-12 w-full mb-10">
          {/* User Avatar */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-[#d4af37] rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 mx-auto">
              {profile?.name ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
            </div>
            <h1 className="text-4xl font-cinzel font-bold text-white mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your account information</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Basic Info */}
            <div className="bg-neutral-900/30 border border-[#d4af37] rounded-lg p-6 shadow-md">
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
              <div className="bg-neutral-900/30 border border-[#d4af37] rounded-lg p-6 shadow-md">
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
            <div className="bg-neutral-900/30 border border-[#d4af37] rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-playfair font-bold text-[#d4af37] mb-4 flex items-center gap-2"><User className="h-6 w-6" /> Account Information</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Account Type:</span>
                  <span className="font-medium capitalize">{profile?.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-medium">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : ''}
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
            <button className="bg-accent text-gold hover:bg-gold hover:text-accent font-semibold rounded-lg px-4 py-2 transition-colors w-full md:w-auto">Update Profile</button>
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
        {/* Bottom Section: Wishlist */}
        <div className="bg-black/40 backdrop-blur border-[#d4af37] rounded-xl shadow-lg animate-fadein px-6 py-8 md:p-12 w-full">
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