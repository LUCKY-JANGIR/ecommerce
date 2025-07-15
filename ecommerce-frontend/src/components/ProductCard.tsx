'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useStore, Product } from '@/store/useStore';
import { ShoppingCart, Heart as HeartIcon, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { getOptimizedImageUrl, getPlaceholderImage } from '@/lib/imageUtils';

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
  const cartItem = cart.items.find((item) => item.product._id === product._id);
  const quantity = cartItem ? cartItem.quantity : 0;

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
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-accent-gold fill-current' : 'text-secondary-dark'}`}
      />
    ));
  };

  // Use Cloudinary optimized image if available
  const imageUrl = product.images?.[0]?.url
    ? getOptimizedImageUrl(product.images[0].url, { width: 500, quality: 'auto', format: 'auto' })
    : getPlaceholderImage(500, 320);

  return (
    <div
      ref={cardRef}
      className="bg-secondary border border-primary rounded-xl p-4 flex flex-col group relative transition-transform duration-300 hover:-translate-y-2 hover:shadow-lg shadow-primary/20 min-h-[420px] animate-fadein overflow-hidden"
      style={{ animationDelay: `${Math.random() * 0.2 + 0.05}s` }}
    >
      {/* Chocolate brown gradient overlay for extra luxury */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-primary/10 to-transparent opacity-80" />
      <img
        src={imageUrl}
        alt={product.images?.[0]?.alt || product.name}
        width={500}
        height={320}
        className="rounded-lg border border-primary mb-3 object-cover h-52 w-full bg-background transition-all duration-300"
        loading="lazy"
      />
      <h3 className="font-display text-xl text-gray-800 mb-1">{product.name}</h3>
      {product.category && typeof product.category === 'object' && product.category._id && product.category.name ? (
        <Link href={`/category/${encodeURIComponent(product.category._id)}`} className="text-sm text-blue-600 underline hover:text-blue-800 mb-1 block">
          {product.category.name}
        </Link>
      ) : (
        <p className="text-sm text-gray-600 mb-1">No Category</p>
      )}
      <p className="text-lg font-bold text-gray-800 mb-2">{formatPrice(product.price)}</p>
      {/* Rating */}
      <div className="flex items-center mb-2">
        <div className="flex items-center mr-2">{renderStars(product.rating)}</div>
        <span className="text-sm text-gray-600">({product.numReviews})</span>
      </div>
      {/* Stock badge */}
      {product.stock === 0 && (
        <div className="absolute top-2 left-2 bg-error text-secondary px-2 py-1 rounded text-xs font-bold shadow-lg">Out of Stock</div>
      )}
      {/* Featured badge */}
      {product.isFeatured && (
        <div className="absolute top-2 right-2 bg-success text-secondary px-2 py-1 rounded text-xs font-bold shadow-lg">Featured</div>
      )}
      {/* Add to Cart and Wishlist Buttons */}
      <div className="flex flex-col gap-3 mt-4 w-full">
        {quantity === 0 ? (
          <button
            onClick={handleAddToCart}
            disabled={isLoading || product.stock === 0}
            className="bg-primary text-background hover:bg-primary-light font-bold rounded-lg px-4 py-2 transition-colors shadow pointer-events-auto flex items-center gap-2 w-full"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            <span className="truncate">{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
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
              className="bg-primary text-background rounded-lg px-3 py-1 font-bold text-lg shadow hover:bg-primary-light transition-colors"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="font-bold text-text-main text-lg px-4">{quantity}</span>
            <button
              onClick={() => {
                if (quantity < product.stock) {
                  updateCartItemQuantity(product._id, quantity + 1);
                } else {
                  toast.error('No more stock available');
                }
              }}
              className="bg-primary text-background rounded-lg px-3 py-1 font-bold text-lg shadow hover:bg-primary-light transition-colors"
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
          className={`bg-background border-2 border-primary rounded-lg p-2 shadow-lg transition-colors hover:bg-primary hover:text-background text-primary focus:outline-none focus:ring-2 focus:ring-primary flex items-center gap-2 w-full ${isWishlisted ? 'bg-primary text-background border-primary' : ''}`}
        >
          {isWishlisted ? (
            <HeartIcon className="h-5 w-5 fill-background text-background" />
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