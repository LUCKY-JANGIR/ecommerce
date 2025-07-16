'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/store/useStore';
import { useStore } from '@/store/useStore';
import { Heart, ShoppingCart, Star, Minus, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
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
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(product.price)}
                    </span>
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

  return (
    <Link href={`/products/${product._id}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={
              typeof product.images?.[0] === 'string'
                ? product.images[0]
                : product.images?.[0]?.url || '/placeholder-product.svg'
            }
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Quick Action Buttons */}
          <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleWishlistToggle}
              className={`p-2 rounded-full shadow-lg transition-colors ${
                isInWishlist
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
              title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Stock Badge */}
          {product.stock === 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Out of Stock
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
          
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
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-blue-600">
              {formatPrice(product.price)}
            </span>
            
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
          </div>
        </div>
      </div>
    </Link>
  );
} 