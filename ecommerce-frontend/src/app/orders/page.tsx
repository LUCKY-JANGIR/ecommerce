'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { ordersAPI } from '@/components/services/api';
import { ArrowLeft, Calendar, DollarSign } from 'lucide-react';
import { FiPackage } from 'react-icons/fi';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const router = useRouter();
  const { auth } = useStore();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    // Wait for hydration to complete before checking authentication
    const checkAuth = () => {
      if (!auth.isAuthenticated) {
        console.log('User not authenticated, redirecting to login');
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
        return 'bg-primary/10 text-primary border-primary/20';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-muted/10 text-muted border-muted/20';
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
    <div className="min-h-screen bg-background-light">
      <div className="container mx-auto px-4 pt-24 pb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Back to home */}
          <Link
            href="/"
            className="inline-flex items-center text-muted hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          {/* Orders Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-accent rounded-2xl shadow-lg p-8 mb-8"
          >
            <h1 className="text-3xl font-serif font-bold text-primary mb-2">My Orders</h1>
            <p className="text-muted text-lg">Track your order history and status</p>
          </motion.div>

          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
              <p className="mt-4 text-muted text-lg">Loading orders...</p>
            </motion.div>
          ) : orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order, index) => (
                <motion.div 
                  key={order._id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card border border-accent rounded-2xl shadow-lg p-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <FiPackage className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-serif font-bold text-primary">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-muted">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-muted mr-3" />
                      <span className="text-muted">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-muted mr-3" />
                      <span className="text-muted">
                        Total: {renderNegotiable()}
                      </span>
                    </div>
                    <div className="text-muted">
                      {order.orderItems.length} item(s)
                    </div>
                  </div>

                  <div className="border-t border-accent pt-6">
                    <h4 className="font-serif font-bold text-primary mb-4">Order Items:</h4>
                    <div className="space-y-3">
                      {order.orderItems.map((item: any, itemIndex: number) => (
                        <div key={itemIndex} className="flex items-center justify-between text-sm bg-background-light p-3 rounded-xl">
                          <span className="text-muted font-medium">{item.name}</span>
                          <span className="text-primary font-semibold">
                            Qty: {item.quantity} × {renderNegotiable()}
                          </span>
                        </div>
                      ))}
                    </div>
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
                <FiPackage className="h-12 w-12 text-muted" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-primary mb-4">No orders yet</h3>
              <p className="text-muted text-lg mb-8">Start shopping to see your orders here</p>
              <Link
                href="/products"
                className="inline-flex items-center bg-primary text-white px-8 py-3 rounded-xl hover:bg-accent transition-colors font-semibold shadow-lg"
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