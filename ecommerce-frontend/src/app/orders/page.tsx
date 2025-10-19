'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { ordersAPI } from '@/components/services/api';
import { ArrowLeft, Calendar, DollarSign, CreditCard, MessageCircle, AlertCircle } from 'lucide-react';
import { FiPackage } from 'react-icons/fi';
import Link from 'next/link';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { getImagePreset } from '@/lib/cloudinary';

export default function OrdersPage() {
  const router = useRouter();
  const { auth } = useStore();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Array<{
    _id: string;
    orderStatus: string;
    createdAt: string;
    isPaid: boolean;
    totalPrice?: number;
    itemsPrice?: number;
    shippingPrice?: number;
    taxPrice?: number;
    negotiationNotes?: string;
    shippingAddress?: {
      fullName: string;
      address: string;
      city: string;
      state?: string;
      postalCode: string;
      country: string;
      phone: string;
    };
    orderItems: Array<{
      name: string;
      quantity: number;
      price: number;
      product?: string;
      image?: string;
      selectedParameters?: Array<{
        parameterId: string;
        parameterName: string;
        parameterType: string;
        value: any;
      }>;
    }>;
  }>>([]);

  useEffect(() => {
    // Wait for hydration to complete before checking authentication
    const checkAuth = () => {
      if (!auth.isAuthenticated) {
    
        router.push('/login');
        return;
      }

      const fetchOrders = async () => {
        try {
          const response = await ordersAPI.getMyOrders();
          setOrders(response.orders || []);
        } catch (error) {
          console.error('Error fetching orders:', error);
          toast.error('Failed to load orders');
        } finally {
          setLoading(false);
        }
      };

      fetchOrders();
    };

    // Small delay to ensure store is hydrated
    const timer = setTimeout(checkAuth, 200);
    return () => clearTimeout(timer);
  }, [auth.isAuthenticated, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Processing':
        return 'bg-accent-500/10 text-dark-text-primary border-primary/20';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-muted/10 text-dark-text-secondary border-muted/20';
    }
  };

  // Remove price display and replace with 'Negotiable' label
  const renderNegotiable = () => (
    <span className="font-serif font-bold text-accent">Negotiable</span>
  );

  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-bg-accent-500">
      <div className="container mx-auto px-4 pt-24 pb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Back to home */}
          <Link
            href="/"
            className="inline-flex items-center text-dark-text-secondary hover:text-dark-text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          {/* Orders Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-dark-bg-secondary border border-dark-border-primary rounded-2xl shadow-lg p-8 mb-8"
          >
            <h1 className="text-3xl font-serif font-bold text-dark-text-primary mb-2">My Orders</h1>
            <p className="text-dark-text-secondary text-lg">Track your order history and status</p>
          </motion.div>

          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
              <p className="mt-4 text-dark-text-secondary text-lg">Loading orders...</p>
            </motion.div>
          ) : orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order, index) => (
                <motion.div 
                  key={order._id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-dark-bg-secondary border border-dark-border-primary rounded-2xl shadow-lg p-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-accent-500/10 rounded-xl flex items-center justify-center">
                        <FiPackage className="h-6 w-6 text-dark-text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-serif font-bold text-dark-text-primary">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-dark-text-secondary">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-dark-bg-tertiary p-4 rounded-xl border border-dark-border-primary">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs text-dark-text-muted font-medium">Order Date</p>
                          <p className="text-sm font-semibold text-dark-text-primary">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-dark-bg-tertiary p-4 rounded-xl border border-dark-border-primary">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-xs text-dark-text-muted font-medium">Total Amount</p>
                          <p className="text-sm font-semibold text-dark-text-primary">
                            {renderNegotiable()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-dark-bg-tertiary p-4 rounded-xl border border-dark-border-primary">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${order.isPaid ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
                          <CreditCard className={`h-5 w-5 ${order.isPaid ? 'text-green-500' : 'text-orange-500'}`} />
                        </div>
                        <div>
                          <p className="text-xs text-dark-text-muted font-medium">Payment Status</p>
                          <p className={`text-sm font-semibold ${order.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                            {order.isPaid ? '✓ Paid' : '⏳ Pending'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-dark-bg-tertiary p-4 rounded-xl border border-dark-border-primary">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                          <FiPackage className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-xs text-dark-text-muted font-medium">Total Items</p>
                          <p className="text-sm font-semibold text-dark-text-primary">
                            {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-dark-border-primary pt-6">
                    <h4 className="font-serif font-bold text-dark-text-primary mb-4">Order Items:</h4>
                    <div className="space-y-4 mb-6">
                      {order.orderItems.map((item: { name: string; quantity: number; price: number; product?: string; image?: string; selectedParameters?: Array<{ parameterId: string; parameterName: string; parameterType: string; value: any }> }, itemIndex: number) => (
                        <div key={itemIndex} className="bg-dark-bg-tertiary p-5 rounded-xl border border-dark-border-primary hover:border-accent-500/30 transition-colors">
                          <div className="flex items-start gap-4">
                            {/* Product Image */}
                            <div className="w-20 h-20 bg-gradient-to-br from-accent-500/20 to-primary-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-dark-border-primary overflow-hidden">
                              {item.image ? (
                                <Image
                                  src={getImagePreset(item.image, 'thumbnail')}
                                  alt={item.name}
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-cover rounded-lg"
                                  quality={85}
                                />
                              ) : (
                                <FiPackage className="h-8 w-8 text-accent-500" />
                              )}
                            </div>
                            
                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <h5 className="text-lg font-semibold text-dark-text-primary mb-1 truncate">
                                    {item.name}
                                  </h5>
                                  <div className="flex items-center gap-4 text-sm text-dark-text-secondary flex-wrap">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-accent-500"></span>
                                      Qty: <span className="font-semibold text-dark-text-primary">{item.quantity}</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                      Price: {item.price !== undefined && item.price > 0 
                                        ? <span className="font-semibold text-dark-text-primary">₹{item.price.toLocaleString()}</span>
                                        : renderNegotiable()}
                                    </span>
                                    {item.price !== undefined && item.price > 0 && item.quantity > 1 && (
                                      <span className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                        Total: <span className="font-semibold text-green-600">₹{(item.price * item.quantity).toLocaleString()}</span>
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Display Selected Parameters */}
                                  {item.selectedParameters && item.selectedParameters.length > 0 && (
                                    <div className="mt-3 space-y-1">
                                      <p className="text-xs font-medium text-dark-text-muted">Specifications:</p>
                                      {item.selectedParameters.map((param, idx) => (
                                        <div key={idx} className="text-xs text-dark-text-secondary flex items-center gap-1">
                                          <span className="font-medium text-accent-400">{param.parameterName}:</span>
                                          <span className="text-dark-text-primary">
                                            {typeof param.value === 'object' && param.value !== null
                                              ? `${param.value.length || 0} × ${param.value.width || 0} × ${param.value.height || 0}`
                                              : param.value}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Price Summary */}
                                <div className="text-right flex-shrink-0">
                                  <p className="text-sm text-dark-text-muted mb-1">Item Total</p>
                                  <p className="text-lg font-bold text-accent-500">
                                    {renderNegotiable()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address & Order Summary */}
                    <div className="grid md:grid-cols-2 gap-4 mt-6 border-t border-dark-border-primary pt-6">
                      {/* Shipping Address */}
                      {order.shippingAddress && (
                        <div className="bg-dark-bg-tertiary rounded-xl p-5 border border-dark-border-primary">
                          <h5 className="font-semibold text-dark-text-primary mb-3 flex items-center gap-2">
                            <FiPackage className="w-4 h-4 text-accent-500" />
                            Shipping Address
                          </h5>
                          <div className="text-sm text-dark-text-secondary space-y-1">
                            <p className="font-semibold text-dark-text-primary">{order.shippingAddress.fullName}</p>
                            <p>{order.shippingAddress.address}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state || ''} {order.shippingAddress.postalCode}</p>
                            <p>{order.shippingAddress.country}</p>
                            <p className="pt-2 border-t border-dark-border-primary mt-2">📞 {order.shippingAddress.phone}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Order Summary */}
                      <div className="bg-dark-bg-tertiary rounded-xl p-5 border border-dark-border-primary">
                        <h5 className="font-semibold text-dark-text-primary mb-3 flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-accent-500" />
                          Order Summary
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-dark-text-secondary">
                            <span>Items Total:</span>
                            <span className="font-semibold text-dark-text-primary">
                              {order.itemsPrice ? `₹${order.itemsPrice.toLocaleString()}` : 'Negotiable'}
                            </span>
                          </div>
                          <div className="flex justify-between text-dark-text-secondary">
                            <span>Shipping:</span>
                            <span className="font-semibold text-dark-text-primary">
                              {order.shippingPrice !== undefined ? (order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`) : 'TBD'}
                            </span>
                          </div>
                          <div className="flex justify-between text-dark-text-secondary">
                            <span>Tax:</span>
                            <span className="font-semibold text-dark-text-primary">
                              {order.taxPrice ? `₹${order.taxPrice.toLocaleString()}` : 'TBD'}
                            </span>
                          </div>
                          <div className="flex justify-between text-lg font-bold text-dark-text-primary pt-2 border-t border-dark-border-primary">
                            <span>Total:</span>
                            <span className="text-accent-500">
                              {order.totalPrice ? `₹${order.totalPrice.toLocaleString()}` : renderNegotiable()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cancellation Information */}
                    {order.orderStatus === 'Cancelled' && order.negotiationNotes && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h5 className="text-sm font-semibold text-red-800 mb-1">Order Cancelled</h5>
                            <p className="text-sm text-red-700">
                              {order.negotiationNotes.includes('cancelled by admin') ? (
                                <>
                                  <span className="font-medium">Cancelled by Admin</span>
                                  {order.negotiationNotes.includes('Reason:') && (
                                    <span className="block mt-1">
                                      Reason: {order.negotiationNotes.split('Reason:')[1]?.trim()}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>
                                  <span className="font-medium">Cancelled by Customer</span>
                                  <span className="block mt-1">{order.negotiationNotes}</span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Admin Notes */}
                    {order.negotiationNotes && order.orderStatus !== 'Cancelled' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h5 className="text-sm font-semibold text-blue-800 mb-1">Admin Notes</h5>
                            <p className="text-sm text-blue-700">{order.negotiationNotes}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiPackage className="h-12 w-12 text-dark-text-secondary" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-dark-text-primary mb-4">No orders yet</h3>
              <p className="text-dark-text-secondary text-lg mb-8">Start shopping to see your orders here</p>
              <Link
                href="/products"
                className="inline-flex items-center bg-accent-500 text-white px-8 py-3 rounded-xl hover:bg-primary-500 transition-colors font-semibold shadow-lg"
              >
                Browse Products
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 