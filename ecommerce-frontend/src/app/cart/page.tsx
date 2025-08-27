'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
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
    setIsLoading(true);
    router.push('/checkout');
  };

  const renderNegotiable = () => (
    <span className="text-lg font-serif font-bold text-accent-600">Negotiable</span>
  );

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background-cream">
        <div className="container mx-auto px-4 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-heritage-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBag className="h-12 w-12 text-heritage-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary-700 mb-6">Your Cart is Empty</h1>
            <p className="text-text-secondary text-lg mb-10 max-w-md mx-auto">
              Looks like you haven&apos;t added any items to your cart yet. Start exploring our handcrafted treasures.
            </p>
            <Link
              href="/products"
              className="bg-accent-500 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-accent-600 transition-colors inline-flex items-center shadow-lg"
            >
              <ArrowLeft className="h-5 w-5 mr-3" />
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-cream">
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-12"
        >
          <Link
            href="/"
            className="text-text-muted hover:text-primary-700 mr-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary-700">Shopping Cart</h1>
          <span className="ml-6 text-text-muted font-medium">({cart.totalItems} items)</span>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-white border border-heritage-200 rounded-2xl shadow-lg">
              <div className="p-8 border-b border-heritage-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-serif font-bold text-primary-700">Cart Items</h2>
                  <button
                    onClick={handleClearCart}
                    className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 text-sm transition-colors font-semibold shadow-lg"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              <div className="divide-y divide-heritage-200">
                {cart.items.map((item, index) => (
                  <motion.div 
                    key={item.product._id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-8"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-6 sm:space-y-0 sm:space-x-8">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <Image
                          src={
                            typeof item.product.images?.[0] === 'string'
                              ? item.product.images[0]
                              : item.product.images?.[0]?.url || '/placeholder-product.svg'
                          }
                          alt={item.product.name}
                          width={120}
                          height={120}
                          className="rounded-2xl object-cover border-2 border-heritage-200 shadow-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.product._id}`}
                          className="text-xl font-serif font-bold text-primary-700 hover:text-accent-600 transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-text-secondary mt-2">
                          {typeof item.product.category === 'object' && item.product.category !== null
                            ? item.product.category.name
                            : item.product.category}
                        </p>
                        <p className="text-lg font-serif font-bold text-accent-600 mt-4">
                          {renderNegotiable()}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                          className="w-12 h-12 rounded-xl bg-heritage-100 border-2 border-heritage-200 text-primary-700 flex items-center justify-center hover:bg-accent-500 hover:text-white hover:border-accent-500 transition-colors shadow-lg"
                        >
                          <Minus className="h-5 w-5" />
                        </button>
                        <span className="w-16 text-center font-bold text-lg select-none text-primary-700">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-12 h-12 rounded-xl bg-heritage-100 border-2 border-heritage-200 text-primary-700 flex items-center justify-center hover:bg-accent-500 hover:text-white hover:border-accent-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.product._id)}
                        className="bg-red-500 text-white p-4 rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center shadow-lg"
                        title="Remove"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white border border-heritage-200 rounded-2xl shadow-lg p-8 sticky top-24">
              <h2 className="text-2xl font-serif font-bold text-primary-700 mb-8">Order Summary</h2>
              
              <div className="space-y-6">
                <div className="flex justify-between">
                  <span className="text-text-secondary font-medium">Subtotal ({cart.totalItems} items)</span>
                  <span className="font-serif font-bold text-accent-600">{renderNegotiable()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-text-secondary font-medium">Shipping</span>
                  <span className="font-serif font-bold text-green-600">
                    Free
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-text-secondary font-medium">Tax</span>
                  <span className="font-serif font-bold text-accent-600">
                    {renderNegotiable()}
                  </span>
                </div>
                
                <hr className="border-heritage-200" />
                
                <div className="flex justify-between text-xl font-serif font-bold">
                  <span className="text-primary-700">Total</span>
                  <span className="text-accent-600">
                    {renderNegotiable()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isLoading || cart.items.length === 0}
                className="w-full bg-accent-500 text-white py-4 px-8 rounded-2xl font-semibold hover:bg-accent-600 transition-colors mt-8 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                ) : (
                  'Proceed to Checkout'
                )}
              </button>

              <div className="mt-8 text-center">
                <Link
                  href="/products"
                  className="text-primary-700 hover:text-accent-600 font-medium transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Promo Code */}
              <div className="mt-8 pt-8 border-t border-heritage-200">
                <h3 className="text-lg font-serif font-bold text-primary-700 mb-4">Promo Code</h3>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 px-4 py-3 border border-heritage-200 rounded-l-2xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent bg-background-cream text-primary-700 placeholder-text-muted"
                  />
                  <button className="bg-accent-500 text-white px-6 py-3 rounded-r-2xl hover:bg-accent-600 transition-colors font-semibold shadow-lg">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 