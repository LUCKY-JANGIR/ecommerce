'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/store/useStore';
import { useStore } from '@/store/useStore';
import { Heart, ShoppingCart, Star, Minus, Plus, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, updateCartItemQuantity, removeFromCart } = useStore();
  
  const isInWishlist = wishlist.some(item => item._id === product._id);
  const cartItem = useStore((state) => state.cart.items.find((item) => item.product._id === product._id));
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
      addToCart(product, 1);
    toast.success('Added to cart');
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist) {
      removeFromWishlist(product._id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  // Remove price display and replace with 'Negotiable' label
  const renderNegotiable = () => (
    <span className="text-lg font-bold text-blue-600">Negotiable</span>
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (viewMode === 'list') {
  return (
      <Link href={`/products/${product._id}`} className="block">
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200">
          <div className="flex">
            {/* Product Image */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <Image
                src={
                  typeof product.images?.[0] === 'string'
                    ? product.images[0]
                    : product.images?.[0]?.url || '/placeholder-product.svg'
                }
                alt={product.name}
                fill
                className="object-cover rounded-l-lg"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center mb-2">
                    {renderStars(product.averageRating || 0)}
                    <span className="ml-1 text-sm text-gray-500">
                      ({product.averageRating ? product.averageRating.toFixed(1) : '0.0'})
                    </span>
                    {product.numReviews > 0 && (
                      <span className="ml-2 text-xs text-gray-400">
                        ({product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    {renderNegotiable()}
                    <span className={`text-sm ${
                      product.stock > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
      </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-4">
                  {cartQuantity === 0 ? (
          <button
            onClick={handleAddToCart}
                      disabled={product.stock === 0}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Add to Cart"
          >
              <ShoppingCart className="h-4 w-4" />
          </button>
        ) : (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (cartQuantity > 1) updateCartItemQuantity(product._id, cartQuantity - 1);
                          else removeFromCart(product._id);
                        }}
                        className="p-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        {cartQuantity === 1 ? <Trash2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                      </button>
                      <span className="px-2 text-sm font-semibold text-gray-900">{cartQuantity}</span>
            <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (cartQuantity < product.stock) updateCartItemQuantity(product._id, cartQuantity + 1);
                        }}
                        className="p-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                        disabled={cartQuantity >= product.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-2 rounded-lg border-2 transition-colors ${
                      isInWishlist
                        ? 'border-red-500 text-red-500 hover:bg-red-50'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                    title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        duration: 0.4
      }
    },
    hover: {
      y: -5,
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      transition: { 
        type: "spring" as const,
        stiffness: 500,
        damping: 30 
      }
    }
  };

  const imageVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.3 }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring" as const,
        stiffness: 500,
        damping: 30,
        delay: 0.1
      }
    },
    tap: { scale: 0.95 }
  };

  return (
    <Link href={`/products/${product._id}`} className="block">
      <motion.div 
        className="bg-white rounded-lg border border-gray-200 overflow-hidden group glass-light dark:glass-dark"
        initial="hidden"
        animate="visible"
        whileHover="hover"
        variants={cardVariants}
      >
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden">
          <motion.div variants={imageVariants} className="h-full w-full">
            <Image
              src={
                typeof product.images?.[0] === 'string'
                  ? product.images[0]
                  : product.images?.[0]?.url || '/placeholder-product.svg'
              }
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          </motion.div>
          
          {/* Quick Action Buttons */}
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              <motion.button
                onClick={handleWishlistToggle}
                className={`p-3 rounded-full shadow-lg transition-colors ${
                  isInWishlist
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                variants={buttonVariants}
                whileTap="tap"
              >
                <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
              </motion.button>
              
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (product.stock > 0) {
                    addToCart(product, 1);
                    toast.success('Added to cart');
                  }
                }}
                disabled={product.stock === 0}
                className="p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Quick Add to Cart"
                variants={buttonVariants}
                whileTap="tap"
              >
                <ShoppingCart className="h-5 w-5" />
              </motion.button>
              
              <motion.div
                className="p-3 bg-white text-gray-700 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                title="Quick View"
                variants={buttonVariants}
                whileTap="tap"
              >
                <Eye className="h-5 w-5" />
              </motion.div>
            </div>
          </div>

          {/* Stock Badge */}
          {product.stock === 0 && (
            <motion.div 
              className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Out of Stock
            </motion.div>
          )}
          
          {/* New Badge - for products less than 30 days old */}
          {new Date(product.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000 && (
            <motion.div 
              className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              New
            </motion.div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {renderStars(product.averageRating || 0)}
              <span className="ml-1 text-xs text-gray-500">
                ({product.averageRating ? product.averageRating.toFixed(1) : '0.0'})
              </span>
            </div>
            
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              product.stock > 10 ? 'bg-green-100 text-green-800' : 
              product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {product.stock > 10 ? 'In Stock' : 
               product.stock > 0 ? `Only ${product.stock} left` : 
               'Out of Stock'}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {product.name}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-primary">
              {renderNegotiable()}
            </div>
            
            {cartQuantity === 0 ? (
              <motion.button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                title="Add to Cart"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Add</span>
              </motion.button>
            ) : (
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (cartQuantity > 1) updateCartItemQuantity(product._id, cartQuantity - 1);
                    else removeFromCart(product._id);
                  }}
                  className="p-1 bg-white text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  {cartQuantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                </motion.button>
                <span className="px-3 text-sm font-semibold text-gray-900">{cartQuantity}</span>
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (cartQuantity < product.stock) updateCartItemQuantity(product._id, cartQuantity + 1);
                  }}
                  className="p-1 bg-white text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={cartQuantity >= product.stock}
                  whileTap={{ scale: 0.9 }}
                >
                  <Plus className="h-4 w-4" />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}