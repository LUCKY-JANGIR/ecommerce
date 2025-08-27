'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { productsAPI } from '@/components/services/api';
import { getOptimizedImageUrl } from '@/lib/imageUtils';
import { ShoppingCart } from 'lucide-react';
import { useStore, Product } from '@/store/useStore';
import toast from 'react-hot-toast';

interface RecommendedProductsProps {
  currentProductId: string;
}

export default function RecommendedProducts({ 
  currentProductId
}: RecommendedProductsProps) {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { addToCart, auth } = useStore();

  useEffect(() => {
    // Add a delay before fetching to make it feel more natural
    const timer = setTimeout(async () => {
      try {
        // Simply fetch some products and exclude the current one
        const response = await productsAPI.getAll({ limit: 12 });
        
        if (response?.products) {
          const filteredProducts = response.products
            .filter((p: Product) => p._id !== currentProductId)
            .slice(0, 8); // Limit to 8 products
          
          setRecommendedProducts(filteredProducts);
        }
      } catch (error) {
        console.error('Error fetching recommended products:', error);
      } finally {
        setHasLoaded(true);
      }
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [currentProductId]);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    toast.success("Item added to cart");
  };



  if (!hasLoaded) {
    return (
      <div className="mt-16">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-serif font-bold text-primary-700 mb-2">
            You Might Also Like
          </h3>
          <p className="text-text-secondary">Loading recommendations...</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-4 animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendedProducts.length === 0) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-16"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-primary-700 mb-2">
          You Might Also Like
        </h3>
        <p className="text-text-secondary text-sm sm:text-base">
          Discover more handcrafted treasures from our collection
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {recommendedProducts.map((product, index) => {
          const imageUrl = product.images?.[0]?.url 
            ? getOptimizedImageUrl(product.images[0].url) 
            : '/placeholder-product.svg';
          
          return (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Product Image */}
                <Link href={`/products/${product._id}`}>
                  <div className="relative h-48 sm:h-56 overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link href={`/products/${product._id}`}>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-2 group-hover:text-accent-600 transition-colors line-clamp-2">
                      {product.name}
                    </h4>
                  </Link>
                  
                  {product.category && (
                    <p className="text-gray-500 text-xs sm:text-sm mb-2">
                      {typeof product.category === 'object' ? product.category.name : product.category}
                    </p>
                  )}

                  {/* Rating */}
                  {product.averageRating && product.averageRating > 0 && (
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${
                              i < Math.round(product.averageRating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-xs sm:text-sm text-gray-600">
                        ({product.numReviews || 0})
                      </span>
                    </div>
                  )}

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg sm:text-xl font-bold text-accent-600">
                      {product.price === 0 ? 'Negotiable' : `$${product.price}`}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="p-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
} 