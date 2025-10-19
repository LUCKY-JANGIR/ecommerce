"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiShoppingCart, FiLogIn, FiMenu, FiX } from "react-icons/fi";
import { useStore } from '@/store/useStore';
import { getImagePreset } from '@/lib/cloudinary';
import { productsAPI } from '@/components/services/api';

export default function Header() {
  const { auth, cart, logout, hydrated } = useStore();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch featured products for hamburger menu
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await productsAPI.getFeatured();
        if (response && Array.isArray(response)) {
          setFeaturedProducts(response.slice(0, 12)); // Get first 12 featured products
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      }
    };
    
    fetchFeaturedProducts();
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mounted) return;
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mounted]);


  useEffect(() => {
    if (!mounted) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mounted]);

  // Close dropdown when mobile menu opens
  useEffect(() => {
    if (mobileMenuOpen) {
      setProfileDropdownOpen(false);
    }
  }, [mobileMenuOpen]);


  const handleProfileToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProfileDropdownOpen(!profileDropdownOpen);
  };


  // Don't render until hydrated and mounted to prevent hydration mismatches
  if (!hydrated || !mounted) {
    return (
      <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full">
          <div className="absolute inset-0 bg-dark-bg-primary/80 backdrop-blur-md" />
          <div className="relative w-full">
            <nav className="flex items-center justify-between h-16 sm:h-18 md:h-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              {/* Mobile Logo */}
              <Link href="/" className="flex-shrink-0 lg:hidden">
                <h1 className="text-lg sm:text-xl md:text-2xl font-sans font-bold text-dark-text-primary bg-gradient-to-r from-accent-500 to-primary-500 bg-clip-text text-transparent">
                  hastkari
                  <span className="block text-xs sm:text-sm font-handcrafted text-dark-text-secondary -mt-1">
                    since 1989
                  </span>
              </h1>
              </Link>
              
              {/* Mobile Menu Button & Cart */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Link href="/cart" className="p-3 relative hover:bg-dark-bg-hover rounded-lg transition-colors">
                  <FiShoppingCart className="w-6 h-6 text-dark-text-secondary" />
                  {mounted && cart.totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
                      {cart.totalItems}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-3 hover:bg-dark-bg-hover rounded-lg transition-colors"
                >
                  <FiMenu className="w-6 h-6 text-dark-text-secondary" />
                </button>
            </div>
          </nav>
        </div>
      </header>
        <div className="h-16 sm:h-18 md:h-20" />
      </>
    );
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full">
        <div className={`absolute inset-0 transition-all duration-300 ${
          scrolled ? 'bg-dark-bg-primary shadow-lg shadow-black/20' : 'bg-dark-bg-primary/80 backdrop-blur-md'
        }`} />
        
        <div className="relative w-full">
          <nav className="flex items-center h-16 sm:h-18 md:h-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Hamburger Menu Button - Left */}
            <div className="flex items-center flex-shrink-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-3 hover:bg-dark-bg-hover rounded-lg transition-colors"
              >
                <FiMenu className="w-6 h-6 text-dark-text-secondary" />
              </button>
            </div>

            {/* Centered Logo */}
            <div className="flex-1 flex justify-center">
            <Link href="/" className="flex-shrink-0">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-samarkan font-bold text-dark-text-primary bg-gradient-to-r from-accent-500 to-primary-500 bg-clip-text text-transparent">
                  hastkari
                  <span className="block text-xs sm:text-sm font-handcrafted text-dark-text-secondary -mt-1">
                    since 1989
                  </span>
              </h1>
            </Link>
            </div>

            {/* Right Side Actions - Cart, Profile */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Link href="/cart" className="p-3 relative hover:bg-dark-bg-hover rounded-lg transition-colors">
                <FiShoppingCart className="w-6 h-6 text-dark-text-secondary" />
                {mounted && cart.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
                    {cart.totalItems}
                  </span>
                )}
              </Link>
              
              {auth.isAuthenticated ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={handleProfileToggle}
                    className="p-3 hover:bg-dark-bg-hover rounded-lg transition-colors"
                  >
                    <FiUser className="w-6 h-6 text-dark-text-secondary" />
                  </button>
                  
                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-dark-bg-secondary border border-dark-border-primary rounded-lg shadow-lg z-50">
                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-dark-text-primary hover:bg-dark-bg-hover"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          href="/orders"
                          className="block px-4 py-2 text-sm text-dark-text-primary hover:bg-dark-bg-hover"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          Orders
                        </Link>
                        {auth.user?.role === 'admin' && (
                          <Link
                            href="/admin"
                            className="block px-4 py-2 text-sm text-dark-text-primary hover:bg-dark-bg-hover"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                            router.push('/');
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-dark-text-primary hover:bg-dark-bg-hover"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="p-3 hover:bg-dark-bg-hover rounded-lg transition-colors"
                >
                  <FiLogIn className="w-6 h-6 text-dark-text-secondary" />
                </Link>
              )}
            </div>

          </nav>


        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => {
                setMobileMenuOpen(false);
              }}
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 h-screen w-full bg-dark-bg-primary z-50"
            >
              <div className="flex flex-col h-full">
                {/* Fixed Header */}
                <div className="flex items-center justify-between p-4 border-b border-dark-border-primary flex-shrink-0">
                  <h2 className="text-lg font-serif font-bold text-dark-text-primary">Menu</h2>
                  <button 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="p-2 hover:bg-dark-bg-hover rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5 text-dark-text-secondary" />
                  </button>
                </div>

                {/* User Info */}
                {auth.isAuthenticated && (
                  <div className="p-4 bg-dark-bg-secondary border-b border-dark-border-primary flex-shrink-0">
                    <p className="font-medium text-dark-text-primary">{auth.user?.name}</p>
                    <p className="text-sm text-dark-text-muted">{auth.user?.email}</p>
                  </div>
                )}

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                  {/* Navigation Links */}
                  <nav className="p-4 space-y-1">
                    <Link
                      href="/categories"
                      className="block px-3 py-2 rounded-lg hover:bg-dark-bg-hover text-sm text-dark-text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Traditional Crafts
                    </Link>
                    <Link
                      href="/products"
                      className="block px-3 py-2 rounded-lg hover:bg-dark-bg-hover text-sm text-dark-text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Our Collection
                    </Link>
                    <Link
                      href="/products"
                      className="block px-3 py-2 rounded-lg hover:bg-dark-bg-hover text-sm text-dark-text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Search Products
                    </Link>
                  </nav>

                  {/* Exclusive Products Section */}
                  {featuredProducts.length > 0 && (
                    <div className="border-t border-dark-border-primary">
                      <h3 className="text-sm font-medium text-dark-text-primary p-4 pb-2">Exclusive Products</h3>
                       <div 
                         className="mx-4 mb-4 h-96 hamburger-scrollable"
                         data-lenis-prevent
                         style={{ 
                           overflowY: 'auto',
                           scrollbarWidth: 'thin',
                           scrollbarColor: '#6B7280 #374151',
                           WebkitOverflowScrolling: 'touch',
                           touchAction: 'pan-y'
                         }}
                         onTouchStart={(e) => e.stopPropagation()}
                         onTouchMove={(e) => e.stopPropagation()}
                         onWheel={(e) => e.stopPropagation()}
                       >
                        <div className="p-4 space-y-2">
                          {featuredProducts.map((product) => (
                            <Link
                              key={product._id}
                              href={`/products/${product._id}`}
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-dark-bg-hover transition-colors"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                {product.images?.[0] ? (
                                  <Image
                                    src={getImagePreset(typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url, 'thumbnail')}
                                    alt={product.name}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                    quality={80}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-r from-accent-500/20 to-primary-500/20 flex items-center justify-center">
                                    <span className="text-accent-500 text-xs font-medium">
                                      {product.name.charAt(0)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-dark-text-primary truncate">{product.name}</p>
                                <p className="text-xs text-dark-text-muted">
                                  {product.price === 0 ? (
                                    <span className="text-orange-600 font-semibold">Negotiable</span>
                                  ) : (
                                    `₹${product.price}`
                                  )}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header Spacer */}
      <div className="h-16 sm:h-18 md:h-20" />
    </>
  );
}