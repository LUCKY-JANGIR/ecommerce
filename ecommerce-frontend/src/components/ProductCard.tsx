'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/store/useStore';
import { useStore } from '@/store/useStore';
import { ShoppingCart, Star, Minus, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

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
    toast.success('Added to cart');
  };

  const renderPrice = () => {
    if (product.price === 0) {
      return <span className="text-lg font-semibold text-orange-600">Negotiable</span>;
    }
    return <span className="text-lg font-semibold text-gray-900">₹{product.price}</span>;
  };

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
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group">
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
                className="object-cover rounded-l-xl group-hover:scale-105 transition-transform duration-200"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center mb-3">
                    {renderStars(product.averageRating || 0)}
                    <span className="ml-2 text-sm text-gray-500">
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
                      className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Add to Cart"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (cartQuantity > 1) updateCartItemQuantity(product._id, cartQuantity - 1);
                          else removeFromCart(product._id);
                        }}
                        className="p-2 bg-white text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        {cartQuantity === 1 ? <Trash2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                      </button>
                      <span className="px-3 text-sm font-semibold text-gray-700">{cartQuantity}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (cartQuantity < product.stock) updateCartItemQuantity(product._id, cartQuantity + 1);
                        }}
                        className="p-2 bg-white text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
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

  // Grid view - Simple and sleek design
  return (
    <Link href={`/products/${product._id}`} className="block">
      <motion.div 
        className="bg-white rounded-xl overflow-hidden group shadow-sm hover:shadow-lg transition-all duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={
              typeof product.images?.[0] === 'string'
                ? product.images[0]
                : product.images?.[0]?.url || '/placeholder-product.svg'
            }
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Quick Add Button - Only show on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
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
              className="p-3 bg-white text-gray-900 rounded-full shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Quick Add to Cart"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <ShoppingCart className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Stock Badge - Only show if out of stock */}
          {product.stock === 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
              Out of Stock
            </div>
          )}
          
          {/* New Badge - Only for recent products */}
          {new Date(product.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000 && (
            <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium">
              New
            </div>
          )}
        </div>

        {/* Product Info - Simplified */}
        <div className="p-4">
          {/* Rating - Minimal */}
          <div className="flex items-center mb-2">
            {renderStars(product.averageRating || 0)}
            <span className="ml-1 text-xs text-gray-500">
              ({product.averageRating ? product.averageRating.toFixed(1) : '0.0'})
            </span>
          </div>
          
          {/* Product Name */}
          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          
          {/* Price and Add Button */}
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-gray-900">
              {renderPrice()}
            </div>
            
            {cartQuantity === 0 ? (
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                title="Add to Cart"
              >
                Add
              </button>
            ) : (
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (cartQuantity > 1) updateCartItemQuantity(product._id, cartQuantity - 1);
                    else removeFromCart(product._id);
                  }}
                  className="p-1 bg-white text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {cartQuantity === 1 ? <Trash2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                </button>
                <span className="px-2 text-sm font-semibold text-gray-700">{cartQuantity}</span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (cartQuantity < product.stock) updateCartItemQuantity(product._id, cartQuantity + 1);
                  }}
                  className="p-1 bg-white text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={cartQuantity >= product.stock}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}