'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { ArrowLeft, Truck, Handshake, User, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  postalCode: z.string().min(5, 'Postal code must be at least 5 characters'),
  country: z.string().min(2, 'Country must be at least 2 characters'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, auth, clearCart } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [profileDataLoaded, setProfileDataLoaded] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  // Watch form values to determine which fields are auto-filled
  const formValues = watch();

  // Check if a field is auto-filled from profile
  const isAutoFilled = (fieldName: keyof CheckoutFormData) => {
    const profileValue = auth.user?.[fieldName as keyof typeof auth.user] || 
                        auth.user?.address?.[fieldName as keyof typeof auth.user.address];
    return profileValue && formValues[fieldName] === profileValue;
  };

  // Auto-populate form with user profile data
  useEffect(() => {
    if (auth.isAuthenticated && auth.user && !profileDataLoaded) {
      const user = auth.user;
      
      // Set values from profile if they exist
      if (user.name) setValue('fullName', user.name);
      if (user.email) setValue('email', user.email);
      if (user.phone) setValue('phone', user.phone);
      if (user.address?.street) setValue('address', user.address.street);
      if (user.address?.city) setValue('city', user.address.city);
      if (user.address?.state) setValue('state', user.address.state);
      if (user.address?.zipCode) setValue('postalCode', user.address.zipCode);
      if (user.address?.country) setValue('country', user.address.country);
      
      setProfileDataLoaded(true);
    }
  }, [auth.user, auth.isAuthenticated, setValue, profileDataLoaded]);

  // Remove price display and replace with 'Negotiable' label
  const renderNegotiable = () => (
    <span className="font-serif font-bold text-accent">Negotiable</span>
  );

  const onSubmit = async (data: CheckoutFormData) => {
    if (!auth.isAuthenticated) {
      toast.error('Please login to complete your order');
      router.push('/login');
      return;
    }
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    setIsLoading(true);
    try {
      // Prepare order data
      const orderData = {
        orderItems: cart.items.map(item => ({
          product: item.product._id,
          name: item.product.name,
          image: item.product.images?.[0]?.url || '',
          quantity: item.quantity
        })),
        shippingAddress: {
          fullName: data.fullName,
          address: data.address,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          phone: data.phone
        },
        paymentMethod: 'Negotiable'
      };

      // Import the ordersAPI
      const { ordersAPI } = await import('@/components/services/api');
      
      // Create the order
      const response = await ordersAPI.create(orderData);
      
      if (response && response.order) {
        // Clear the cart after successful order
        clearCart();
        
        toast.success('Order placed successfully! Price is negotiable. Our team will contact you soon to finalize the price and payment. You can track your order status in your account.');
        router.push('/orders');
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error: unknown) {
      console.error('Order creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-3xl font-serif font-bold text-primary mb-4">Your Cart is Empty</h1>
          <p className="text-muted text-lg mb-6">Please add items to your cart before checkout.</p>
          <Link
            href="/products"
            className="bg-primary text-white px-8 py-3 rounded-xl hover:bg-accent transition-colors font-semibold"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8"
        >
          <Link
            href="/cart"
            className="text-muted hover:text-primary mr-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-4xl font-serif font-bold text-primary">Checkout</h1>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Checkout Form */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="bg-card border border-accent rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-serif font-bold text-primary mb-8">Shipping Information</h2>
              
              {/* Profile Data Notice */}
              {auth.isAuthenticated && auth.user && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold text-primary">Profile Data</span>
                  </div>
                  <p className="text-sm text-muted">
                    Your profile information has been automatically filled in. You can edit any field as needed.
                  </p>
                </motion.div>
              )}
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-muted mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                      <input
                        {...register('fullName')}
                        type="text"
                        id="fullName"
                        className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-card text-primary placeholder-muted ${
                          isAutoFilled('fullName') ? 'border-primary/30 bg-primary/5' : 'border-accent'
                        }`}
                        placeholder="Enter your full name"
                      />
                      {isAutoFilled('fullName') && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">Auto-filled</span>
                        </div>
                      )}
                    </div>
                    {errors.fullName && (
                      <p className="mt-2 text-sm text-red-600">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-muted mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                      <input
                        {...register('email')}
                        type="email"
                        id="email"
                        className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-card text-primary placeholder-muted ${
                          isAutoFilled('email') ? 'border-primary/30 bg-primary/5' : 'border-accent'
                        }`}
                        placeholder="Enter your email"
                      />
                      {isAutoFilled('email') && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">Auto-filled</span>
                        </div>
                      )}
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-muted mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                    <input
                      {...register('phone')}
                      type="tel"
                      id="phone"
                      className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-card text-primary placeholder-muted ${
                        isAutoFilled('phone') ? 'border-primary/30 bg-primary/5' : 'border-accent'
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {isAutoFilled('phone') && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">Auto-filled</span>
                      </div>
                    )}
                  </div>
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-muted mb-2">
                    Street Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                    <input
                      {...register('address')}
                      type="text"
                      id="address"
                      className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-card text-primary placeholder-muted ${
                        isAutoFilled('address') ? 'border-primary/30 bg-primary/5' : 'border-accent'
                      }`}
                      placeholder="Enter your street address"
                    />
                    {isAutoFilled('address') && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">Auto-filled</span>
                      </div>
                    )}
                  </div>
                  {errors.address && (
                    <p className="mt-2 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-muted mb-2">
                      City *
                    </label>
                    <input
                      {...register('city')}
                      type="text"
                      id="city"
                      className={`w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-card text-primary placeholder-muted ${
                        isAutoFilled('city') ? 'border-primary/30 bg-primary/5' : 'border-accent'
                      }`}
                      placeholder="City"
                    />
                    {isAutoFilled('city') && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">Auto-filled</span>
                      </div>
                    )}
                    {errors.city && (
                      <p className="mt-2 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-muted mb-2">
                      State *
                    </label>
                    <input
                      {...register('state')}
                      type="text"
                      id="state"
                      className={`w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-card text-primary placeholder-muted ${
                        isAutoFilled('state') ? 'border-primary/30 bg-primary/5' : 'border-accent'
                      }`}
                      placeholder="State"
                    />
                    {isAutoFilled('state') && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">Auto-filled</span>
                      </div>
                    )}
                    {errors.state && (
                      <p className="mt-2 text-sm text-red-600">{errors.state.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-muted mb-2">
                      Postal Code *
                    </label>
                    <input
                      {...register('postalCode')}
                      type="text"
                      id="postalCode"
                      className={`w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-card text-primary placeholder-muted ${
                        isAutoFilled('postalCode') ? 'border-primary/30 bg-primary/5' : 'border-accent'
                      }`}
                      placeholder="Postal Code"
                    />
                    {isAutoFilled('postalCode') && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">Auto-filled</span>
                      </div>
                    )}
                    {errors.postalCode && (
                      <p className="mt-2 text-sm text-red-600">{errors.postalCode.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-muted mb-2">
                    Country *
                  </label>
                  <input
                    {...register('country')}
                    type="text"
                    id="country"
                    className={`w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-card text-primary placeholder-muted ${
                      isAutoFilled('country') ? 'border-primary/30 bg-primary/5' : 'border-accent'
                    }`}
                    placeholder="Country"
                  />
                  {isAutoFilled('country') && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">Auto-filled</span>
                    </div>
                  )}
                  {errors.country && (
                    <p className="mt-2 text-sm text-red-600">{errors.country.message}</p>
                  )}
                </div>

                {/* Negotiation Notice */}
                <div className="p-6 bg-accent/10 border border-accent rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <Handshake className="h-6 w-6 text-accent" />
                    <h3 className="text-lg font-serif font-bold text-primary">Price Negotiation</h3>
                  </div>
                  <p className="text-muted text-sm leading-relaxed">
                    All prices are negotiable. After placing your order, our team will contact you within 24 hours to discuss pricing and finalize payment arrangements.
                  </p>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-4 px-8 rounded-xl font-semibold hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Processing...
                    </div>
                  ) : (
                    'Place Order - Price Negotiable'
                  )}
                </button>
              </form>
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
              
              {/* Order Items */}
              <div className="space-y-6 mb-8">
                {cart.items.map((item, index) => (
                  <motion.div 
                    key={item.product._id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{item.quantity}</span>
                      </div>
                      <div>
                        <p className="font-serif font-bold text-primary">{item.product.name}</p>
                        <p className="text-sm text-muted">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-serif font-bold text-accent">
                      {renderNegotiable()}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-4 border-t border-accent pt-6">
                <div className="flex justify-between">
                  <span className="text-muted font-medium">Subtotal ({cart.totalItems} items)</span>
                  <span className="font-serif font-bold text-accent">{renderNegotiable()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted font-medium">Shipping</span>
                  <span className="font-serif font-bold text-green-600">Free</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted font-medium">Tax</span>
                  <span className="font-serif font-bold text-accent">{renderNegotiable()}</span>
                </div>
                
                <hr className="border-accent" />
                
                <div className="flex justify-between text-xl font-serif font-bold">
                  <span className="text-primary">Total</span>
                  <span className="text-accent">{renderNegotiable()}</span>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Truck className="h-6 w-6 text-primary" />
                  <span className="text-lg font-serif font-bold text-primary">Free Shipping</span>
                </div>
                <p className="text-muted mt-2 leading-relaxed">
                  All orders include free shipping. Delivery typically takes 3-5 business days.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 