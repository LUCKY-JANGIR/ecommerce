'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/store/useStore';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { getImagePreset } from '@/lib/cloudinary';
import { getResponsiveImageSizes, getBlurPlaceholder } from '@/lib/imageUtils';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {

  const renderPrice = () => {
    if (product.price === 0) {
      return <span className="text-lg font-semibold text-accent-500 font-handcrafted">Contact for Price</span>;
    }
    return (
      <span className="text-lg font-semibold text-dark-text-primary">
        <span className="text-sm text-dark-text-muted">₹</span>
        {product.price.toLocaleString('en-IN')}
      </span>
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-dark-text-muted'
        }`}
      />
    ));
  };

  if (viewMode === 'list') {
    return (
      <Link href={`/products/${product._id}`} className="block">
        <div className="bg-dark-bg-secondary rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-dark-border-primary group">
          <div className="flex">
            {/* Product Image */}
            <div
              className="relative w-40 h-40 sm:w-56 sm:h-56 flex-shrink-0 bg-dark-bg-tertiary rounded-l-xl"
              aria-label={product.name}
              role="img"
              style={{
                backgroundImage: `url(${typeof product.images?.[0] === 'string' ? getImagePreset(product.images[0], 'card') : product.images?.[0]?.url ? getImagePreset(product.images[0].url, 'card') : '/placeholder-product.svg'})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />

            {/* Product Info */}
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-dark-text-primary mb-2 group-hover:text-accent-500 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-dark-text-secondary mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center mb-3">
                    {renderStars(product.averageRating || 0)}
                    <span className="ml-2 text-sm text-dark-text-muted">
                      ({product.averageRating ? product.averageRating.toFixed(1) : '0.0'})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    {renderPrice()}
                    <span className={`text-sm font-medium ${
                      product.stock > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view - Hastkari handcrafted design
  return (
    <Link href={`/products/${product._id}`} className="block">
      <motion.div 
        className="bg-gradient-to-br from-dark-bg-secondary to-dark-bg-tertiary rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300 border border-dark-border-primary/50 hover:border-accent-500/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      >
        {/* Product Image */}
        <div
          className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[28rem] overflow-hidden bg-dark-bg-tertiary"
          aria-label={product.name}
          role="img"
          style={{
            backgroundImage: `url(${typeof product.images?.[0] === 'string' ? getImagePreset(product.images[0], 'card') : product.images?.[0]?.url ? getImagePreset(product.images[0].url, 'card') : '/placeholder-product.svg'})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          
          {/* Handwoven Pattern Overlay */}
          <div className="absolute inset-0 bg-handloom-pattern opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          

          {/* Stock Badge - Only show if out of stock */}
          {product.stock === 0 && (
            <motion.div 
              className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              Out of Stock
            </motion.div>
          )}
          
          {/* New Badge - Only for recent products */}
          {new Date(product.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000 && (
            <motion.div 
              className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg font-handcrafted"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              ✨ New
            </motion.div>
          )}
        </div>

        {/* Product Info - Hastkari Style */}
        <div className="p-5 relative">
          {/* Artisan Touch Indicator */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-2 h-2 bg-accent-500 rounded-full opacity-60"></div>
          </div>
          
          {/* Rating - Enhanced */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {renderStars(product.averageRating || 0)}
            </div>
            <span className="ml-2 text-xs text-dark-text-muted font-medium">
              {product.numReviews || 0} reviews
            </span>
          </div>
          
          {/* Product Name */}
          <h3 className="text-lg font-semibold text-dark-text-primary mb-3 line-clamp-2 group-hover:text-accent-500 transition-colors leading-tight">
            {product.name}
          </h3>
          
          {/* Price and View Details */}
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-dark-text-primary">
              {renderPrice()}
            </div>
            
            <motion.div 
              className="text-sm text-accent-500 font-medium hover:text-accent-400 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              View Details →
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}