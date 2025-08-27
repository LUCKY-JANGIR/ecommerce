"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiShoppingCart, FiLogIn, FiChevronDown, FiSearch, FiMenu, FiX } from "react-icons/fi";
import { useStore } from '@/store/useStore';

export default function Header() {
  const { auth, cart, logout, hydrated } = useStore();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setMobileMenuOpen(false);
    }
  };

  const handleProfileToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  // Don't render until hydrated and mounted to prevent hydration mismatches
  if (!hydrated || !mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 w-full">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-md" />
        <div className="relative w-full max-w-7xl mx-auto">
          <nav className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-8">
            <div className="flex-shrink-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-gray-900">
                Indian Handlooms
              </h1>
            </div>
          </nav>
        </div>
        <div className="h-[3.5rem] sm:h-[4rem] md:h-[4.5rem] lg:h-[5rem]" />
      </header>
    );
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full">
        <div className={`absolute inset-0 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-lg' : 'bg-white/80 backdrop-blur-md'
        }`} />
        
        <div className="relative w-full max-w-7xl mx-auto">
          <nav className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-8">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-serif font-bold text-gray-900">
                Indian Handlooms
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <Link href="/" className="nav-link text-sm xl:text-base">Home</Link>
              <Link href="/categories" className="nav-link text-sm xl:text-base">Categories</Link>
              <Link href="/products" className="nav-link text-sm xl:text-base">Shop</Link>
            </div>

            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-md mx-4 xl:mx-8">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-3 sm:pl-4 pr-10 py-2 text-sm rounded-lg border border-heritage-200 focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white/50"
                    suppressHydrationWarning
                  />
                  <button type="submit" className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2">
                    <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted hover:text-accent-600" />
                  </button>
                </div>
              </form>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-2 xl:space-x-4">

              <Link href="/cart" className="p-2 relative">
                <FiShoppingCart className="w-5 h-5 xl:w-6 xl:h-6 text-text-primary hover:text-accent-600" />
                {mounted && cart.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs w-4 h-4 xl:w-5 xl:h-5 flex items-center justify-center rounded-full">
                    {cart.totalItems}
                  </span>
                )}
              </Link>

              {auth.isAuthenticated ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={handleProfileToggle}
                    className="flex items-center space-x-1 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <FiUser className="w-5 h-5 xl:w-6 xl:h-6 text-text-primary" />
                    <FiChevronDown className={`w-3 h-3 xl:w-4 xl:h-4 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[9999]"
                      >
                        <Link 
                          href="/profile" 
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link 
                          href="/orders" 
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          Orders
                        </Link>
                        {auth.user?.role === 'admin' && (
                          <Link 
                            href="/admin" 
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            Admin Panel
                          </Link>
                        )}
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                            router.push('/');
                          }}
                          className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href="/login" className="flex items-center space-x-1 xl:space-x-2 px-3 xl:px-4 py-2 text-sm xl:text-base">
                  <FiLogIn className="w-4 h-4 xl:w-5 xl:h-5" />
                  <span>Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button & Cart */}
            <div className="flex lg:hidden items-center space-x-1 sm:space-x-2">
              <Link href="/cart" className="p-1 sm:p-2 relative">
                <FiShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-text-primary" />
                {mounted && cart.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full">
                    {cart.totalItems}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-1 sm:p-2"
              >
                <FiMenu className="w-5 h-5 sm:w-6 sm:h-6 text-text-primary" />
              </button>
            </div>
          </nav>

          {/* Mobile Search */}
          <div className="lg:hidden px-3 sm:px-4 pb-3">
            <form onSubmit={handleSearch} className="relative">
                             <input
                 type="text"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 placeholder="Search products..."
                 className="w-full pl-3 sm:pl-4 pr-10 py-2 text-sm rounded-lg border border-heritage-200 focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white/50"
                 suppressHydrationWarning
               />
              <button type="submit" className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2">
                <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted" />
              </button>
            </form>
          </div>
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
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-[280px] sm:w-[320px] bg-white z-50"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-heritage-200">
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-gray-900">Menu</h2>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 sm:p-2">
                    <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                {auth.isAuthenticated && (
                  <div className="p-3 sm:p-4 bg-heritage-50">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">{auth.user?.name}</p>
                    <p className="text-xs sm:text-sm text-text-muted">{auth.user?.email}</p>
                  </div>
                )}

                <nav className="flex-1 p-3 sm:p-4 space-y-1">
                  <Link
                    href="/"
                    className="block px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-heritage-50 text-sm sm:text-base text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/categories"
                    className="block px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-heritage-50 text-sm sm:text-base text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Categories
                  </Link>
                  <Link
                    href="/products"
                    className="block px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-heritage-50 text-sm sm:text-base text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Shop
                  </Link>

                </nav>

                <div className="p-3 sm:p-4 border-t border-heritage-200">
                  {auth.isAuthenticated ? (
                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        className="block px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-heritage-50 text-sm sm:text-base text-gray-900"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-heritage-50 text-sm sm:text-base text-gray-900"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Orders
                      </Link>
                      {auth.user?.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="block px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-heritage-50 text-sm sm:text-base text-gray-900"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                          router.push('/');
                        }}
                        className="block w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-heritage-50 text-sm sm:text-base text-gray-900"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center justify-center w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-accent-600 text-white text-sm sm:text-base"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FiLogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header Spacer */}
      <div className="h-[3.5rem] sm:h-[4rem] md:h-[4.5rem] lg:h-[5rem]" />
    </>
  );
}