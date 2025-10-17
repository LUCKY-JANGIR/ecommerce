'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/store/useStore';
import { useStore } from '@/store/useStore';
import { ShoppingCart, Star, Minus, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { getOptimizedImageUrl, getImagePreset } from '@/lib/cloudinary';
import { getResponsiveImageSizes, getBlurPlaceholder } from '@/lib/imageUtils';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const { addToCart, updateCartItemQuantity, removeFromCart } = useStore();
  const cartItem = useStore((state) => state.cart.items.find((item) => item.product._id === product._id));
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    toast.success('✨ Added to your collection');
  };

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
            <div className="relative w-32 h-32 flex-shrink-0">
              <Image
                src={
                  typeof product.images?.[0] === 'string'
                    ? getImagePreset(product.images[0], 'card')
                    : product.images?.[0]?.url 
                    ? getImagePreset(product.images[0].url, 'card')
                    : '/placeholder-product.svg'
                }
                alt={product.name}
                fill
                className="object-contain rounded-l-xl group-hover:scale-105 transition-transform duration-200 bg-dark-bg-tertiary"
                sizes={getResponsiveImageSizes('thumbnail')}
                quality={95}
                placeholder="blur"
                blurDataURL={getBlurPlaceholder(40, 30)}
                priority={false}
              />
            </div>

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

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3 ml-6">
                  {cartQuantity === 0 ? (
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      className="p-3 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Add to Cart"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2 bg-dark-bg-hover rounded-lg p-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (cartQuantity > 1) updateCartItemQuantity(product._id, cartQuantity - 1);
                          else removeFromCart(product._id);
                        }}
                        className="p-2 bg-dark-bg-primary text-dark-text-secondary rounded-md hover:bg-dark-bg-hover transition-colors"
                      >
                        {cartQuantity === 1 ? <Trash2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                      </button>
                      <span className="px-3 text-sm font-semibold text-dark-text-secondary">{cartQuantity}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (cartQuantity < product.stock) updateCartItemQuantity(product._id, cartQuantity + 1);
                        }}
                        className="p-2 bg-dark-bg-primary text-dark-text-secondary rounded-md hover:bg-dark-bg-hover transition-colors"
                        disabled={cartQuantity >= product.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  )}
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
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={
              typeof product.images?.[0] === 'string'
                ? getImagePreset(product.images[0], 'hero')
                : product.images?.[0]?.url 
                ? getImagePreset(product.images[0].url, 'hero')
                : '/placeholder-product.svg'
            }
            alt={product.name}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-300 bg-dark-bg-tertiary"
            sizes={getResponsiveImageSizes('product-card')}
            quality={95}
            placeholder="blur"
            blurDataURL={getBlurPlaceholder(50, 50)}
            priority={false}
          />
          
          {/* Handwoven Pattern Overlay */}
          <div className="absolute inset-0 bg-handloom-pattern opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          
          {/* Quick Add Button - Only show on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (product.stock > 0) {
                  addToCart(product, 1);
                  toast.success('✨ Added to your collection');
                }
              }}
              disabled={product.stock === 0}
              className="p-4 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-full shadow-lg hover:from-accent-600 hover:to-accent-700 transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Quick Add to Collection"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            >
              <ShoppingCart className="h-5 w-5" />
            </motion.button>
          </div>

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
          
          {/* Price and Add Button */}
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-dark-text-primary">
              {renderPrice()}
            </div>
            
            {cartQuantity === 0 ? (
              <motion.button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="px-6 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl hover:from-accent-600 hover:to-accent-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                title="Add to Collection"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add to Cart
              </motion.button>
            ) : (
              <motion.div 
                className="flex items-center space-x-2 bg-gradient-to-r from-dark-bg-hover to-dark-bg-primary rounded-xl p-2 border border-dark-border-primary"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (cartQuantity > 1) updateCartItemQuantity(product._id, cartQuantity - 1);
                    else removeFromCart(product._id);
                  }}
                  className="p-2 bg-dark-bg-secondary text-dark-text-secondary rounded-lg hover:bg-dark-bg-hover transition-colors hover:text-accent-500"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {cartQuantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                </motion.button>
                <span className="px-3 text-sm font-bold text-dark-text-primary bg-dark-bg-secondary rounded-lg py-2 min-w-[2rem] text-center">{cartQuantity}</span>
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (cartQuantity < product.stock) updateCartItemQuantity(product._id, cartQuantity + 1);
                  }}
                  className="p-2 bg-dark-bg-secondary text-dark-text-secondary rounded-lg hover:bg-dark-bg-hover transition-colors hover:text-accent-500"
                  disabled={cartQuantity >= product.stock}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Plus className="h-4 w-4" />
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}