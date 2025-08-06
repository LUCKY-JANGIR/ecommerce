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
    
    const { auth } = useStore.getState();
    if (!auth.isAuthenticated || !auth.token) {
      toast.error('Please log in to add items to your wishlist');
      // Optionally redirect to login
      // router.push('/login');
      return;
    }
    
    if (isInWishlist) {
      removeFromWishlist(product._id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  const renderPrice = () => {
    if (product.price === 0) {
      return <span className="text-lg font-serif font-bold text-accent-600">Negotiable</span>;
    }
    return <span className="text-lg font-serif font-bold text-accent-600">${product.price}</span>;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating ? 'text-accent-500 fill-current' : 'text-heritage-300'
        }`}
      />
    ));
  };

  if (viewMode === 'list') {
    return (
      <Link href={`/products/${product._id}`} className="block">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-heritage-200 group">
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
                                                className="object-cover rounded-l-2xl group-hover:scale-105 transition-transform duration-200"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-serif font-semibold text-primary-700 mb-2 group-hover:text-accent-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center mb-3">
                    {renderStars(product.averageRating || 0)}
                    <span className="ml-2 text-sm text-text-muted">
                      ({product.averageRating ? product.averageRating.toFixed(1) : '0.0'})
                    </span>
                    {product.numReviews > 0 && (
                      <span className="ml-3 text-xs text-text-muted">
                        ({product.numReviews} {product.numReviews === 1 ? 'review' : 'reviews'})
                      </span>
                    )}
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
                      className="p-3 bg-accent-500 text-white rounded-xl hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      title="Add to Cart"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2 bg-heritage-100 rounded-xl p-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (cartQuantity > 1) updateCartItemQuantity(product._id, cartQuantity - 1);
                          else removeFromCart(product._id);
                        }}
                        className="p-2 bg-white text-primary-700 rounded-lg hover:bg-heritage-200 transition-colors"
                      >
                        {cartQuantity === 1 ? <Trash2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                      </button>
                      <span className="px-3 text-sm font-semibold text-primary-700">{cartQuantity}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (cartQuantity < product.stock) updateCartItemQuantity(product._id, cartQuantity + 1);
                        }}
                        className="p-2 bg-white text-primary-700 rounded-lg hover:bg-heritage-200 transition-colors"
                        disabled={cartQuantity >= product.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-3 rounded-xl border-2 transition-colors ${
                      isInWishlist
                        ? 'border-red-500 text-red-500 hover:bg-red-50'
                        : 'border-heritage-300 text-heritage-600 hover:border-accent-500 hover:text-accent-600'
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

  // Animation variants - optimized for faster performance
  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring" as const,
        stiffness: 400,
        damping: 25,
        duration: 0.2
      }
    },
    hover: {
      y: -4,
      transition: { 
        type: "spring" as const,
        stiffness: 600,
        damping: 25 
      }
    }
  };

  const imageVariants = {
    hover: { 
      scale: 1.03,
      transition: { duration: 0.2 }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring" as const,
        stiffness: 600,
        damping: 25,
        delay: 0.05
      }
    },
    tap: { scale: 0.95 }
  };

  return (
    <Link href={`/products/${product._id}`} className="block">
      <motion.div 
        className="bg-white rounded-2xl border border-heritage-200 overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-200"
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
            <div className="flex space-x-3">
              <motion.button
                onClick={handleWishlistToggle}
                className={`p-3 rounded-full shadow-lg transition-colors ${
                  isInWishlist
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-white text-primary-700 hover:bg-heritage-100'
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
                className="p-3 bg-accent-500 text-white rounded-full shadow-lg hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Quick Add to Cart"
                variants={buttonVariants}
                whileTap="tap"
              >
                <ShoppingCart className="h-5 w-5" />
              </motion.button>
              
              <motion.div
                className="p-3 bg-white text-primary-700 rounded-full shadow-lg hover:bg-heritage-100 transition-colors"
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
              className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium"
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
              className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              New
            </motion.div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              {renderStars(product.averageRating || 0)}
              <span className="ml-2 text-xs text-text-muted">
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
          
          <h3 className="text-lg font-serif font-semibold text-primary-700 mb-3 line-clamp-2 group-hover:text-accent-600 transition-colors duration-300">
            {product.name}
          </h3>
          
          <p className="text-sm text-text-secondary mb-4 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="text-lg font-serif font-bold text-accent-600">
              {renderPrice()}
            </div>
            
            {cartQuantity === 0 ? (
              <motion.button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="px-4 py-2 bg-accent-500 text-white rounded-xl hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg"
                title="Add to Cart"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm font-medium">Add</span>
              </motion.button>
            ) : (
              <div className="flex items-center space-x-2 bg-heritage-100 rounded-xl p-2">
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (cartQuantity > 1) updateCartItemQuantity(product._id, cartQuantity - 1);
                    else removeFromCart(product._id);
                  }}
                  className="p-2 bg-white text-primary-700 rounded-lg hover:bg-heritage-200 transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  {cartQuantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                </motion.button>
                <span className="px-3 text-sm font-semibold text-primary-700">{cartQuantity}</span>
                <motion.button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (cartQuantity < product.stock) updateCartItemQuantity(product._id, cartQuantity + 1);
                  }}
                  className="p-2 bg-white text-primary-700 rounded-lg hover:bg-heritage-200 transition-colors"
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