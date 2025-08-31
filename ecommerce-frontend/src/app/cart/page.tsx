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

  const renderPrice = (price: number) => {
    if (price === 0) {
      return <span className="text-orange-600 font-semibold">Negotiable</span>;
    }
    return <span>₹{price}</span>;
  };

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



  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            {/* Empty Cart Icon */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
            >
              <ShoppingBag className="h-16 w-16 text-blue-600" />
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Your Cart is Empty
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-md mx-auto leading-relaxed">
              Ready to discover something amazing? Browse our handcrafted collection and find your perfect piece.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="bg-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center shadow-lg group"
              >
                <ShoppingBag className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
                Start Shopping
              </Link>
              
              <Link
                href="/categories"
                className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-colors inline-flex items-center justify-center border border-gray-200 shadow-lg group"
              >
                Browse Categories
                <ArrowLeft className="h-5 w-5 ml-3 rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 pt-8"
        >
          <div className="flex items-center">
            <Link
              href="/"
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all mr-4 group"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600 group-hover:text-blue-600 group-hover:-translate-x-0.5 transition-all" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600 mt-1">{cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'} in your cart</p>
            </div>
          </div>
          
          <button
            onClick={handleClearCart}
            className="bg-red-50 text-red-600 px-4 py-2 rounded-full hover:bg-red-100 transition-colors font-medium text-sm border border-red-200"
          >
            Clear All
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Your Items</h2>
              </div>

              <div className="divide-y divide-gray-100">
                {cart.items.map((item, index) => (
                  <motion.div 
                    key={item.product._id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <Image
                            src={
                              typeof item.product.images?.[0] === 'string'
                                ? item.product.images[0]
                                : item.product.images?.[0]?.url || '/placeholder-product.svg'
                            }
                            alt={item.product.name}
                            width={100}
                            height={100}
                            className="rounded-2xl object-cover shadow-md"
                          />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.product._id}`}
                          className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-gray-500 mt-1 text-sm">
                          {typeof item.product.category === 'object' && item.product.category !== null
                            ? item.product.category.name
                            : item.product.category}
                        </p>
                        <div className="mt-3">
                          <span className="text-lg font-bold text-blue-600">
                            {renderPrice(item.product.price)}
                          </span>
                          {item.quantity > 1 && item.product.price > 0 && (
                            <span className="text-sm text-gray-500 ml-2">
                              × {item.quantity} = ₹{(item.product.price * item.quantity).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <Minus className="h-4 w-4 text-gray-600" />
                        </button>
                        <span className="w-12 text-center font-semibold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.product._id)}
                        className="w-10 h-10 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
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
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal ({cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'})</span>
                  <span className="font-bold text-gray-900">
                    {cart.items.some(item => item.product.price === 0) ? (
                      <span className="text-orange-600">Contains Negotiable Items</span>
                    ) : (
                      `₹${cart.totalPrice.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold text-gray-900">Included</span>
                </div>
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-blue-600">
                    {cart.items.some(item => item.product.price === 0) ? (
                      <span className="text-orange-600">Contact for Price</span>
                    ) : (
                      `₹${cart.totalPrice.toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isLoading || cart.items.length === 0}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-full font-semibold hover:bg-blue-700 transition-colors mt-6 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Proceed to Checkout
                  </>
                )}
              </button>
              
              {/* Additional Actions */}
              <div className="mt-4 space-y-2">
                <Link
                  href="/products"
                  className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-full font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Promo Code */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Have a promo code?</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <button className="bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors font-medium text-sm">
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