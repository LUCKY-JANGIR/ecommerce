'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/store/useStore';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateCartItemQuantity, clearCart } = useStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      toast.success('Item removed from cart');
    } else {
      updateCartItemQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
    toast.success('Item removed from cart');
  };

  const handleClearCart = () => {
    clearCart();
    toast.success('Cart cleared');
  };

  const handleCheckout = () => {
    if (!cart.items.length) {
      toast.error('Your cart is empty');
      return;
    }
    router.push('/checkout');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              href="/products"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-white mb-6">Your Cart</h1>
        <div className="flex items-center mb-8">
          <Link
            href="/"
            className="text-gray-600 hover:text-blue-600 mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
          <span className="ml-4 text-gray-500">({cart.totalItems} items)</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-900 rounded-lg shadow-md">
              <div className="p-6 border-b border-neutral-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Cart Items</h2>
                  <button
                    onClick={handleClearCart}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              <div className="divide-y divide-neutral-800">
                {cart.items.map((item) => (
                  <div key={item.product._id} className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <Image
                          src={typeof item.product.images?.[0] === 'string' && item.product.images[0] ? item.product.images[0] : '/placeholder-product.jpg'}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.product._id}`}
                          className="text-lg font-semibold text-white hover:text-blue-600 transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">{item.product.category}</p>
                        <p className="text-lg font-bold text-white mt-2">
                          {formatPrice(item.product.price)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center hover:bg-neutral-800 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.product._id)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-900 rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cart.totalItems} items)</span>
                  <span className="font-semibold">{formatPrice(cart.totalPrice)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">
                    {cart.totalPrice >= 50 ? 'Free' : formatPrice(5.99)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">
                    {formatPrice(cart.totalPrice * 0.08)}
                  </span>
                </div>
                
                <hr className="border-neutral-800" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>
                    {formatPrice(
                      cart.totalPrice + 
                      (cart.totalPrice >= 50 ? 0 : 5.99) + 
                      (cart.totalPrice * 0.08)
                    )}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isLoading || cart.items.length === 0}
                className="w-full bg-accent text-gold hover:bg-gold hover:text-accent font-semibold rounded-lg px-4 py-2 transition-colors mt-4"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Proceed to Checkout'
                )}
              </button>

              <div className="mt-4 text-center">
                <Link
                  href="/products"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Promo Code */}
              <div className="mt-6 pt-6 border-t border-neutral-800">
                <h3 className="text-sm font-semibold text-white mb-2">Promo Code</h3>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-neutral-800 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="bg-neutral-800 text-white px-4 py-2 rounded-r-lg hover:bg-neutral-700 transition-colors">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 