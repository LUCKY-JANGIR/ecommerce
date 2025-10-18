'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { productsAPI } from '@/components/services/api';
import { Product } from '@/store/useStore';
import ProductCard from '@/components/ProductCard';

interface RecommendedProductsProps {
  currentProductId: string;
}

export default function RecommendedProducts({ 
  currentProductId
}: RecommendedProductsProps) {
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

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
        {recommendedProducts.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <ProductCard product={product} viewMode="grid" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
} 