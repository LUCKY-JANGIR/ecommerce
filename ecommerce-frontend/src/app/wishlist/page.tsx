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
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <h1 className="text-3xl md:text-4xl font-playfair font-bold text-[#d4af37] mb-6">Your Wishlist</h1>
        <div className="max-w-5xl mx-auto">
          <Link
            href="/products"
            className="inline-flex items-center text-[#d4af37] hover:text-white mb-6 font-semibold"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>

          {/* Wishlist Content */}
          {wishlist.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-[#d4af37]/60 mx-auto mb-4" />
              <h3 className="text-lg font-playfair font-medium text-[#d4af37] mb-2">Your wishlist is empty</h3>
              <p className="text-gray-400 mb-6">Start adding products to your wishlist to see them here</p>
              <Link
                href="/products"
                className="inline-flex items-center bg-[#d4af37] text-black px-6 py-2 rounded-lg hover:bg-[#e6c385] transition-colors font-bold"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 animate-fadein">
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