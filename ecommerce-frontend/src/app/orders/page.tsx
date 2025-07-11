'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { ordersAPI } from '@/services/api';
import { ArrowLeft, Package, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const router = useRouter();
  const { auth } = useStore();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
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
  }, [auth.isAuthenticated, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-white mb-6">Your Orders</h1>
        <div className="max-w-4xl mx-auto">
          {/* Back to home */}
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          {/* Orders Header */}
          <div className="bg-neutral-800 rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">My Orders</h1>
            <p className="text-gray-600">Track your order history and status</p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-neutral-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <Package className="h-6 w-6 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-white">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        Total: ${order.totalPrice}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.orderItems.length} item(s)
                    </div>
                  </div>

                  <div className="border-t border-neutral-700 pt-4">
                    <h4 className="font-medium text-white mb-2">Order Items:</h4>
                    <div className="space-y-2">
                      {order.orderItems.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{item.name}</span>
                          <span className="text-gray-800">
                            Qty: {item.quantity} × ${item.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
              <Link
                href="/products"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 