'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-950">
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-primary mb-6">Your Wishlist</h1>
        <div className="max-w-4xl mx-auto">
          {/* Back to home */}
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          {/* Wishlist Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">My Wishlist</h1>
            <p className="text-gray-600">Save your favorite products for later</p>
          </div>

          {/* Empty Wishlist */}
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Start adding products to your wishlist to see them here</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 