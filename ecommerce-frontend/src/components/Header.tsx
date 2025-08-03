"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiShoppingCart, FiLogIn, FiChevronDown, FiHeart, FiSearch, FiPackage, FiMenu, FiX } from "react-icons/fi";
import { useStore } from '@/store/useStore';

export default function Header() {
  const { auth, cart, logout } = useStore();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle scroll effect for transparent to solid header
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-white/90 backdrop-blur-md'}`}>
      <nav className="max-w-7xl mx-auto flex items-center justify-between py-4 px-4 md:px-8 lg:px-16">
        {/* Logo/Title with animation */}
        <Link href="/" className="text-xl md:text-2xl font-serif font-bold tracking-tight text-primary-700 select-none relative group">
          <span className="relative z-10 group-hover:text-accent-600 transition-colors duration-300">Indian Handlooms</span>
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-500 group-hover:w-full transition-all duration-300 ease-in-out"></span>
        </Link>
        
        {/* Navigation Links (Desktop) */}
        <div className="hidden lg:flex items-center space-x-8">
          <Link href="/" className="text-text-primary hover:text-accent-600 font-medium transition-colors duration-200 relative group">
            <span>Home</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-500 group-hover:w-full transition-all duration-300 ease-in-out"></span>
          </Link>
          <Link href="/categories" className="text-text-primary hover:text-accent-600 font-medium transition-colors duration-200 relative group">
            <span>Categories</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-500 group-hover:w-full transition-all duration-300 ease-in-out"></span>
          </Link>
          <Link href="/products" className="text-text-primary hover:text-accent-600 font-medium transition-colors duration-200 relative group">
            <span>Shop</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-500 group-hover:w-full transition-all duration-300 ease-in-out"></span>
          </Link>
        </div>
        
        {/* Search Bar (Desktop) */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center mx-8 flex-shrink-0 w-80 bg-heritage-50 rounded-2xl px-4 py-3 shadow-lg border border-heritage-200 focus-within:ring-2 focus-within:ring-accent-500 transition-all duration-300 hover:shadow-xl">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 bg-transparent outline-none px-2 py-1 text-text-primary placeholder-text-muted"
          />
          <button type="submit" className="text-text-muted hover:text-accent-600 p-1 transition-colors duration-200">
            <FiSearch className="text-lg" />
          </button>
        </form>
        
        {/* Action Icons (Desktop) */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/wishlist" className="relative p-3 text-text-primary hover:text-accent-600 transition-colors duration-200 rounded-xl hover:bg-heritage-100">
            <FiHeart className="text-xl" />
          </Link>
          
          <Link href="/cart" className="relative p-3 text-text-primary hover:text-accent-600 transition-colors duration-200 rounded-xl hover:bg-heritage-100">
            <FiShoppingCart className="text-xl" />
            {cart.totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                {cart.totalItems}
              </span>
            )}
          </Link>
          
          {auth.isAuthenticated ? (
            <div className="relative" ref={profileDropdownRef}>
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-3 text-text-primary hover:text-accent-600 transition-colors duration-200 rounded-xl hover:bg-heritage-100"
              >
                <FiUser className="text-xl" />
                <FiChevronDown className={`transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl py-2 z-50 border border-heritage-200"
                  >
                    <Link 
                      href="/profile" 
                      className="block px-6 py-3 text-text-primary hover:bg-heritage-50 hover:text-accent-600 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link 
                      href="/orders" 
                      className="block px-6 py-3 text-text-primary hover:bg-heritage-50 hover:text-accent-600 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      My Orders
                    </Link>
                    {auth.user?.role === 'admin' && (
                      <Link 
                        href="/admin" 
                        className="block px-6 py-3 text-text-primary hover:bg-heritage-50 hover:text-accent-600 transition-colors"
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
                      className="block w-full text-left px-6 py-3 text-text-primary hover:bg-heritage-50 hover:text-accent-600 transition-colors"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="flex items-center space-x-2 px-6 py-3 text-text-primary hover:text-accent-600 transition-colors duration-200 rounded-xl hover:bg-heritage-100"
            >
              <FiLogIn className="text-xl" />
              <span className="font-medium">Login</span>
            </Link>
          )}
        </div>
        
        {/* Mobile Action Icons */}
        <div className="flex md:hidden items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-3 text-text-primary hover:text-accent-600 transition-colors duration-200 rounded-xl hover:bg-heritage-100"
          >
            {mobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
          
          <Link href="/cart" className="relative p-3 text-text-primary hover:text-accent-600 transition-colors duration-200 rounded-xl hover:bg-heritage-100">
            <FiShoppingCart className="text-xl" />
            {cart.totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                {cart.totalItems}
              </span>
            )}
          </Link>
          
          {auth.isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <Link href="/orders" className="p-3 text-text-primary hover:text-accent-600 transition-colors duration-200 rounded-xl hover:bg-heritage-100">
                <FiPackage className="text-xl" />
              </Link>
              <Link href="/profile" className="p-3 text-text-primary hover:text-accent-600 transition-colors duration-200 rounded-xl hover:bg-heritage-100">
                <FiUser className="text-xl" />
              </Link>
            </div>
          ) : (
            <Link href="/login" className="p-3 text-text-primary hover:text-accent-600 transition-colors duration-200 rounded-xl hover:bg-heritage-100">
              <FiLogIn className="text-xl" />
            </Link>
          )}
        </div>
      </nav>
      
      {/* Mobile Search Bar */}
      <div className="md:hidden w-full px-4 py-3 border-t border-heritage-200 bg-white">
        <form onSubmit={handleSearch} className="flex items-center w-full bg-heritage-50 rounded-2xl px-4 py-3 border border-heritage-200 focus-within:ring-2 focus-within:ring-accent-500 shadow-lg">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 bg-transparent outline-none px-2 py-1 text-text-primary placeholder-text-muted"
          />
          <button type="submit" className="text-text-muted hover:text-accent-600 p-1">
            <FiSearch className="text-lg" />
          </button>
        </form>
      </div>
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 md:hidden"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl">
              <div className="p-8">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-serif font-bold text-primary-700">Menu</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 text-text-muted hover:text-accent-600 transition-colors rounded-xl hover:bg-heritage-100"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>
                
                {/* Navigation Links */}
                <nav className="space-y-2 mb-10">
                  <Link 
                    href="/" 
                    className="block py-4 text-lg font-medium text-text-primary hover:text-accent-600 transition-colors border-b border-heritage-200 rounded-xl hover:bg-heritage-50 px-4"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    href="/categories" 
                    className="block py-4 text-lg font-medium text-text-primary hover:text-accent-600 transition-colors border-b border-heritage-200 rounded-xl hover:bg-heritage-50 px-4"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Categories
                  </Link>
                  <Link 
                    href="/products" 
                    className="block py-4 text-lg font-medium text-text-primary hover:text-accent-600 transition-colors border-b border-heritage-200 rounded-xl hover:bg-heritage-50 px-4"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Shop
                  </Link>
                  <Link 
                    href="/wishlist" 
                    className="block py-4 text-lg font-medium text-text-primary hover:text-accent-600 transition-colors border-b border-heritage-200 rounded-xl hover:bg-heritage-50 px-4"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Wishlist
                  </Link>
                </nav>
                
                {/* User Section */}
                {auth.isAuthenticated ? (
                  <div className="space-y-4">
                    <div className="p-6 bg-heritage-50 rounded-2xl border border-heritage-200">
                      <p className="font-serif font-bold text-primary-700">{auth.user?.name}</p>
                      <p className="text-sm text-text-muted">{auth.user?.email}</p>
                    </div>
                    <Link 
                      href="/profile" 
                      className="block py-4 text-lg font-medium text-text-primary hover:text-accent-600 transition-colors border-b border-heritage-200 rounded-xl hover:bg-heritage-50 px-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link 
                      href="/orders" 
                      className="block py-4 text-lg font-medium text-text-primary hover:text-accent-600 transition-colors border-b border-heritage-200 rounded-xl hover:bg-heritage-50 px-4"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    {auth.user?.role === 'admin' && (
                      <Link 
                        href="/admin" 
                        className="block py-4 text-lg font-medium text-text-primary hover:text-accent-600 transition-colors border-b border-heritage-200 rounded-xl hover:bg-heritage-50 px-4"
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
                      className="block w-full text-left py-4 text-lg font-medium text-text-primary hover:text-accent-600 transition-colors rounded-xl hover:bg-heritage-50 px-4"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    className="block py-4 text-lg font-medium text-text-primary hover:text-accent-600 transition-colors border-b border-heritage-200 rounded-xl hover:bg-heritage-50 px-4"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}