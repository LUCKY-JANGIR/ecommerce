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
    router.push('/checkout');
  };

  // Remove price display and replace with 'Negotiable' label
  const renderNegotiable = () => (
    <span className="text-lg font-serif font-bold text-accent">Negotiable</span>
  );

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background-light">
        <div className="container mx-auto px-4 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <ShoppingBag className="h-24 w-24 text-muted mx-auto mb-6" />
            <h1 className="text-4xl font-serif font-bold text-primary mb-4">Your Cart is Empty</h1>
            <p className="text-muted text-lg mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link
              href="/products"
              className="bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-accent transition-colors inline-flex items-center shadow-lg"
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
    <div className="min-h-screen bg-background-light">
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8"
        >
          <Link
            href="/"
            className="text-muted hover:text-primary mr-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-4xl font-serif font-bold text-primary">Shopping Cart</h1>
          <span className="ml-4 text-muted font-medium">({cart.totalItems} items)</span>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-card border border-accent rounded-2xl shadow-lg">
              <div className="p-8 border-b border-accent">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-serif font-bold text-primary">Cart Items</h2>
                  <button
                    onClick={handleClearCart}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 text-sm transition-colors font-semibold"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              <div className="divide-y divide-accent">
                {cart.items.map((item, index) => (
                  <motion.div 
                    key={item.product._id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="p-8"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <Image
                          src={
                            typeof item.product.images?.[0] === 'string'
                              ? item.product.images[0]
                              : item.product.images?.[0]?.url || '/placeholder-product.svg'
                          }
                          alt={item.product.name}
                          width={100}
                          height={100}
                          className="rounded-xl object-cover border-2 border-accent"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.product._id}`}
                          className="text-xl font-serif font-bold text-primary hover:text-accent transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-muted mt-2">
                          {typeof item.product.category === 'object' && item.product.category !== null
                            ? item.product.category.name
                            : item.product.category}
                        </p>
                        <p className="text-lg font-serif font-bold text-accent mt-3">
                          {renderNegotiable()}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                          className="w-10 h-10 rounded-xl bg-card border-2 border-accent text-primary flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-bold text-lg select-none">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-10 h-10 rounded-xl bg-card border-2 border-accent text-primary flex items-center justify-center hover:bg-accent hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.product._id)}
                        className="bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center"
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
            <div className="bg-card border border-accent rounded-2xl shadow-lg p-8 sticky top-24">
              <h2 className="text-2xl font-serif font-bold text-primary mb-8">Order Summary</h2>
              
              <div className="space-y-6">
                <div className="flex justify-between">
                  <span className="text-muted font-medium">Subtotal ({cart.totalItems} items)</span>
                  <span className="font-serif font-bold text-accent">{renderNegotiable()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted font-medium">Shipping</span>
                  <span className="font-serif font-bold text-green-600">
                    Free
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted font-medium">Tax</span>
                  <span className="font-serif font-bold text-accent">
                    {renderNegotiable()}
                  </span>
                </div>
                
                <hr className="border-accent" />
                
                <div className="flex justify-between text-xl font-serif font-bold">
                  <span className="text-primary">Total</span>
                  <span className="text-accent">
                    {renderNegotiable()}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isLoading || cart.items.length === 0}
                className="w-full bg-primary text-white py-4 px-8 rounded-xl font-semibold hover:bg-accent transition-colors mt-8 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                ) : (
                  'Proceed to Checkout'
                )}
              </button>

              <div className="mt-6 text-center">
                <Link
                  href="/products"
                  className="text-primary hover:text-accent font-medium transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Promo Code */}
              <div className="mt-8 pt-8 border-t border-accent">
                <h3 className="text-lg font-serif font-bold text-primary mb-4">Promo Code</h3>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 px-4 py-3 border border-accent rounded-l-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-card text-primary placeholder-muted"
                  />
                  <button className="bg-accent text-white px-6 py-3 rounded-r-xl hover:bg-primary transition-colors font-semibold">
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