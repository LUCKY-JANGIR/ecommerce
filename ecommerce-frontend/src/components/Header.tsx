"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiShoppingCart, FiLogIn, FiMenu, FiX } from "react-icons/fi";
import { useStore } from '@/store/useStore';
import { getImagePreset } from '@/lib/cloudinary';
import { productsAPI } from '@/components/services/api';
import type { Product } from '@/types';

export default function Header() {
  const { auth, cart, logout, hydrated } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const closeMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  const mobileMenuId = 'mobile-navigation-panel';
  const mobileMenuHeadingId = 'mobile-navigation-heading';
  const profileMenuId = 'primary-profile-menu';

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
    window.setTimeout(() => {
      mobileMenuButtonRef.current?.focus();
    }, 0);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen && closeMenuButtonRef.current) {
      closeMenuButtonRef.current.focus();
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobileMenu();
        return;
      }

      if (event.key !== 'Tab' || !mobileNavRef.current) {
        return;
      }

      const focusableSelectors = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const focusableElements = Array.from(mobileNavRef.current.querySelectorAll<HTMLElement>(focusableSelectors))
        .filter((element) => !element.hasAttribute('data-focus-guard'));

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, closeMobileMenu]);

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

  useEffect(() => {
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);


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
            <nav className="flex items-center h-16 sm:h-18 md:h-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" aria-label="Primary">
              <button
                type="button"
                ref={mobileMenuButtonRef}
                aria-label="Open navigation menu"
                aria-controls={mobileMenuId}
                aria-expanded={false}
                aria-haspopup="dialog"
                className="p-3 hover:bg-dark-bg-hover rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(true)}
              >
                <FiMenu className="w-6 h-6 text-dark-text-secondary" />
              </button>
              <div className="flex-1 flex justify-center">
                <Link href="/" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-lg">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-samarkan font-bold text-dark-text-primary bg-gradient-to-r from-accent-500 to-primary-500 bg-clip-text text-transparent">
                    hastkari
                    <span className="block text-xs sm:text-sm font-handcrafted text-dark-text-secondary -mt-1">
                      since 1989
                    </span>
                </h1>
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <Link href="/cart" className="p-3 relative hover:bg-dark-bg-hover rounded-lg transition-colors">
                  <FiShoppingCart className="w-6 h-6 text-dark-text-secondary" />
                  {mounted && cart.totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
                      {cart.totalItems}
                    </span>
                  )}
                </Link>
                <button
                  className="p-3 hover:bg-dark-bg-hover rounded-lg transition-colors"
                  aria-label="Account"
                >
                  <FiUser className="w-6 h-6 text-dark-text-secondary" />
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
          <nav className="flex items-center h-16 sm:h-18 md:h-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" aria-label="Primary">
            <button
              type="button"
              ref={mobileMenuButtonRef}
              onClick={() => (mobileMenuOpen ? closeMobileMenu() : setMobileMenuOpen(true))}
              className="p-3 hover:bg-dark-bg-hover rounded-lg transition-colors"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls={mobileMenuId}
              aria-haspopup="dialog"
            >
              <FiMenu className="w-6 h-6 text-dark-text-secondary" />
            </button>

            <div className="flex-1 flex justify-center">
              <Link href="/" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-lg">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-samarkan font-bold text-dark-text-primary bg-gradient-to-r from-accent-500 to-primary-500 bg-clip-text text-transparent">
                  hastkari
                  <span className="block text-xs sm:text-sm font-handcrafted text-dark-text-secondary -mt-1">
                    since 1989
                  </span>
              </h1>
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                href="/cart"
                className="p-3 relative hover:bg-dark-bg-hover rounded-lg transition-colors"
                aria-label="View cart"
              >
                <FiShoppingCart className="w-6 h-6 text-dark-text-secondary" />
                {cart.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
                    {cart.totalItems}
                  </span>
                )}
              </Link>
              
              {auth.isAuthenticated ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    id="profile-menu-button"
                    onClick={handleProfileToggle}
                    className="p-3 hover:bg-dark-bg-hover rounded-lg transition-colors"
                    aria-haspopup="menu"
                    aria-expanded={profileDropdownOpen}
                    aria-controls={profileDropdownOpen ? profileMenuId : undefined}
                  >
                    <FiUser className="w-6 h-6 text-dark-text-secondary" />
                  </button>
                  
                  {profileDropdownOpen && (
                    <div
                      id={profileMenuId}
                      role="menu"
                      aria-labelledby="profile-menu-button"
                      className="absolute right-0 top-full mt-2 w-48 bg-dark-bg-secondary border border-dark-border-primary rounded-lg shadow-lg z-50"
                    >
                      <div className="py-2" role="none">
                        <Link
                          href="/profile"
                          role="menuitem"
                          className="block px-4 py-2 text-sm text-dark-text-primary hover:bg-dark-bg-hover"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          href="/orders"
                          role="menuitem"
                          className="block px-4 py-2 text-sm text-dark-text-primary hover:bg-dark-bg-hover"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          Orders
                        </Link>
                        {auth.user?.role === 'admin' && (
                          <Link
                            href="/admin"
                            role="menuitem"
                            className="block px-4 py-2 text-sm text-dark-text-primary hover:bg-dark-bg-hover"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            Admin Panel
                          </Link>
                        )}
                        <button
                          role="menuitem"
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
                  aria-label="Sign in"
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
              aria-hidden="true"
              onClick={closeMobileMenu}
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 h-screen w-full bg-dark-bg-primary z-50"
              role="dialog"
              aria-modal="true"
              aria-labelledby={mobileMenuHeadingId}
              id={mobileMenuId}
              ref={mobileNavRef}
            >
              <div className="flex flex-col h-full">
                {/* Fixed Header */}
                <div className="flex items-center justify-between p-4 border-b border-dark-border-primary flex-shrink-0">
                  <h2 id={mobileMenuHeadingId} className="text-lg font-serif font-bold text-dark-text-primary">Menu</h2>
                  <button 
                    type="button"
                    ref={closeMenuButtonRef}
                    onClick={closeMobileMenu} 
                    className="p-2 hover:bg-dark-bg-hover rounded-lg transition-colors"
                    aria-label="Close navigation menu"
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
                  <nav className="p-4 space-y-1" role="menu">
                    <Link
                      href="/categories"
                      role="menuitem"
                      className="block px-3 py-2 rounded-lg hover:bg-dark-bg-hover text-sm text-dark-text-primary transition-colors"
                      onClick={closeMobileMenu}
                    >
                      Traditional Crafts
                    </Link>
                    <Link
                      href="/products"
                      role="menuitem"
                      className="block px-3 py-2 rounded-lg hover:bg-dark-bg-hover text-sm text-dark-text-primary transition-colors"
                      onClick={closeMobileMenu}
                    >
                      Our Collection
                    </Link>
                    <Link
                      href="/products"
                      role="menuitem"
                      className="block px-3 py-2 rounded-lg hover:bg-dark-bg-hover text-sm text-dark-text-primary transition-colors"
                      onClick={closeMobileMenu}
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
                              onClick={closeMobileMenu}
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