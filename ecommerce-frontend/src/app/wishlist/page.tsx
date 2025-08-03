'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useStore } from '@/store/useStore';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, removeFromWishlist, addToCart, hydrated } = useStore();
  const [loading, setLoading] = useState(false);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-cream">
        <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-cream">
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-1 bg-accent-500 rounded-full" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-700 mb-4 text-center">
              Your Wishlist
            </h1>
            <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto text-center">
              Save your favorite handcrafted treasures for later. Each item tells a story of tradition and craftsmanship.
            </p>
          </div>

          {/* Back Button */}
          <div className="mb-8">
            <Link
              href="/products"
              className="inline-flex items-center text-accent-600 hover:text-accent-700 font-semibold transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </div>

          {/* Wishlist Content */}
          {wishlist.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white border border-heritage-200 rounded-2xl p-12 shadow-lg max-w-md mx-auto">
                <Heart className="h-16 w-16 text-heritage-400 mx-auto mb-6" />
                <h3 className="text-2xl font-serif font-bold text-primary-700 mb-4">Your wishlist is empty</h3>
                <p className="text-text-secondary mb-8">Start adding products to your wishlist to see them here</p>
                <Link
                  href="/products"
                  className="inline-flex items-center bg-accent-500 text-white px-8 py-3 rounded-xl hover:bg-accent-600 transition-colors font-semibold shadow-lg"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Browse Products
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {wishlist.map((product) => (
                <div key={product._id} className="relative group">
                  <ProductCard product={product} />
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <button
                      onClick={() => {
                        addToCart(product, 1);
                        toast.success('Added to cart!');
                      }}
                      className="bg-accent-500 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:bg-accent-600 transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4 inline mr-1" /> Add to Cart
                    </button>
                    <button
                      onClick={() => {
                        removeFromWishlist(product._id);
                        toast.success('Removed from wishlist');
                      }}
                      className="bg-white/90 border border-accent-500 text-accent-600 px-4 py-2 rounded-xl font-semibold shadow-lg hover:bg-accent-500 hover:text-white transition-colors"
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