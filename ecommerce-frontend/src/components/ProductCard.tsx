'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { Product } from '@/store/useStore';
import { ShoppingCart, Heart as HeartIcon, Star, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, wishlist, addToWishlist, removeFromWishlist, cart, updateCartItemQuantity, removeFromCart } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.classList.add('animate-fadein');
    }
  }, []);

  const isWishlisted = wishlist.some((p) => p._id === product._id);

  // Find current quantity in cart
  const cartItem = cart.items.find((item) => item.product._id === product._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = async () => {
    console.log('Add to Cart clicked for', product.name, product._id);
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
    console.log('Wishlist clicked for', product.name, product._id);
    // This function is no longer needed as isWishlisted is calculated directly
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
    <div
      ref={cardRef}
      className="bg-black/60 border border-[#d4af37] rounded-xl p-4 flex flex-col group relative transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg shadow-[#d4af37]/20 min-h-[420px] animate-fadein overflow-hidden"
      style={{ animationDelay: `${Math.random() * 0.2 + 0.05}s` }}
    >
      {/* Gold gradient overlay for extra luxury */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-[#d4af37]/10 to-transparent opacity-80" />
      <img
        src={product.images[0]?.url || '/placeholder-product.jpg'}
        alt={product.images[0]?.alt || product.name}
        width={200}
        height={208}
        className="rounded-lg border border-[#d4af37] mb-3 object-cover h-52 w-full bg-neutral-900"
      />
      <h3 className="font-serif text-xl text-[#d4af37] mb-1" style={{ fontFamily: 'Playfair Display, Cinzel, serif' }}>{product.name}</h3>
      <p className="text-sm text-gray-300 mb-1">{product.category}</p>
      <p className="text-lg font-bold text-[#d4af37] mb-2">₹{product.price}</p>
      {/* Rating */}
      <div className="flex items-center mb-2">
        <div className="flex items-center mr-2">
          {renderStars(product.rating)}
        </div>
        <span className="text-sm text-gray-400">
          ({product.numReviews})
        </span>
      </div>
      {/* Stock badge */}
      {product.stock === 0 && (
        <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
          Out of Stock
        </div>
      )}
      {/* Featured badge */}
      {product.isFeatured && (
        <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
          Featured
        </div>
      )}
      {/* Add to Cart and Wishlist Buttons (always visible, stacked vertically) */}
      <div className="flex flex-col gap-3 mt-4 w-full">
        {quantity === 0 ? (
          <button
            onClick={handleAddToCart}
            disabled={isLoading || product.stock === 0}
            className="bg-[#d4af37] text-black hover:bg-[#e6c385] font-bold rounded-lg px-4 py-2 transition-colors shadow pointer-events-auto flex items-center gap-2 w-full"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            <span className="truncate">
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </span>
          </button>
        ) : (
          <div className="flex items-center justify-between w-full bg-primary/10 rounded-lg px-2 py-2">
            <button
              onClick={() => {
                if (quantity > 1) {
                  updateCartItemQuantity(product._id, quantity - 1);
                } else {
                  removeFromCart(product._id);
                }
              }}
              className="bg-primary text-background rounded-lg px-3 py-1 font-bold text-lg shadow hover:bg-secondary hover:text-primary transition-colors"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="font-bold text-primary text-lg px-4">{quantity}</span>
            <button
              onClick={() => {
                if (quantity < product.stock) {
                  updateCartItemQuantity(product._id, quantity + 1);
                } else {
                  toast.error('No more stock available');
                }
              }}
              className="bg-primary text-background rounded-lg px-3 py-1 font-bold text-lg shadow hover:bg-secondary hover:text-primary transition-colors"
              aria-label="Increase quantity"
              disabled={quantity >= product.stock}
            >
              +
            </button>
          </div>
        )}
        {/* Wishlist button remains below */}
        <button
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={(e) => {
            e.stopPropagation();
            if (isWishlisted) {
              removeFromWishlist(product._id);
              toast.success('Removed from wishlist');
            } else {
              addToWishlist(product);
              toast.success('Added to wishlist');
            }
          }}
          className={`bg-black/70 border-2 border-[#d4af37] rounded-lg p-2 shadow-lg transition-colors hover:bg-[#d4af37] hover:text-black text-[#d4af37] focus:outline-none focus:ring-2 focus:ring-[#d4af37] flex items-center gap-2 w-full ${isWishlisted ? 'bg-[#d4af37] text-red-600 border-[#d4af37]' : ''}`}
        >
          {isWishlisted ? (
            <HeartIcon className="h-5 w-5 fill-red-600 text-red-600" />
          ) : (
            <HeartIcon className="h-5 w-5" />
          )}
          <span className="truncate">{isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 