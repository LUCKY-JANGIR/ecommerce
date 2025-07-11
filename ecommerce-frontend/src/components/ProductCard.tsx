'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { Product } from '@/store/useStore';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      addToCart(product, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
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
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="card bg-sand border-primary shadow-lg rounded-xl p-4 flex flex-col">
      <img
        src={product.images[0]?.url || '/placeholder-product.jpg'}
        alt={product.images[0]?.alt || product.name}
        width={200}
        height={200}
        className="rounded-lg border-2 border-gold mb-2"
      />
      <h3 className="font-display text-xl text-primary mb-1">{product.name}</h3>
      <p className="text-sm text-primary-dark mb-1">{product.category}</p>
      <p className="text-lg font-bold text-gold mb-2">₹{product.price}</p>
      {/* Rating */}
      <div className="flex items-center mb-2">
        <div className="flex items-center mr-2">
          {renderStars(product.rating)}
        </div>
        <span className="text-sm text-gray-600">
          ({product.numReviews})
        </span>
      </div>
      {/* Stock badge */}
      {product.stock === 0 && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
          Out of Stock
        </div>
      )}
      {/* Discount badge (if applicable) */}
      {product.isFeatured && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
          Featured
        </div>
      )}
      {/* Quick actions overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleAddToCart}
            disabled={isLoading || product.stock === 0}
            className="bg-white text-gray-800 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
          <button
            onClick={handleWishlist}
            className="bg-white text-gray-800 p-2 rounded-full hover:bg-red-600 hover:text-white transition-colors"
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
          <Link
            href={`/product/${product._id}`}
            className="bg-white text-gray-800 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
          >
            <Eye className="h-5 w-5" />
          </Link>
        </div>
      </div>
      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isLoading || product.stock === 0}
        className="mt-auto bg-accent text-gold hover:bg-gold hover:text-accent font-semibold rounded-lg px-4 py-2 transition-colors"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )}
        <span>
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </span>
      </button>
    </div>
  );
};

export default ProductCard; 