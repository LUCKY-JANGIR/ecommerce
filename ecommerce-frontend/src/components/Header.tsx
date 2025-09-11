"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiShoppingCart, FiLogIn, FiChevronDown, FiSearch, FiMenu, FiX } from "react-icons/fi";
import { useStore } from '@/store/useStore';
import { productsAPI } from '@/components/services/api';
import { useDebounce } from '@/hooks/useDebounce';

export default function Header() {
  const { auth, cart, logout, hydrated } = useStore();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [mobileSearchMode, setMobileSearchMode] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Debounce search input for API calls - increased delay for better UX
  const debouncedSearch = useDebounce(search, 500);

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

  // Fetch search suggestions with loading state
  useEffect(() => {
    if (!mounted || !debouncedSearch.trim()) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      setIsSearchLoading(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsSearchLoading(true);
      setShowSuggestions(true); // Show dropdown immediately with loading skeleton
      
      try {
        const response = await productsAPI.getAll({
          search: debouncedSearch,
          limit: 5
        });
        setSearchSuggestions(response.products || []);
        setSelectedSuggestion(-1);
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
        setSearchSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSearchLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearch, mounted]);

  useEffect(() => {
    if (!mounted) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
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
    if (selectedSuggestion >= 0 && searchSuggestions[selectedSuggestion]) {
      router.push(`/products/${searchSuggestions[selectedSuggestion]._id}`);
    } else if (search.trim()) {
      router.push(`/products?search=${encodeURIComponent(search.trim())}`);
    }
    setSearch("");
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
    setMobileMenuOpen(false);
  };

  const handleSuggestionClick = (suggestion: any) => {
    setSearch(suggestion.name);
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
    router.push(`/products/${suggestion._id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || searchSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev < searchSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => 
          prev > 0 ? prev - 1 : searchSuggestions.length - 1
        );
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestion(-1);
        break;
    }
  };

  const handleProfileToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  // Function to highlight matching characters in search suggestions
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="text-accent-500 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Don't render until hydrated and mounted to prevent hydration mismatches
  if (!hydrated || !mounted) {
    return (
      <>
        <header className="fixed top-0 left-0 right-0 z-50 w-full">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md" />
          <div className="relative w-full">
            <nav className="flex items-center justify-between h-16 sm:h-18 md:h-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="flex-shrink-0 min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif font-bold text-gray-900 truncate max-w-[200px] sm:max-w-[250px] md:max-w-none">
                  Hastkari
                </h1>
              </div>
              <div className="flex lg:hidden items-center space-x-2 flex-shrink-0">
                <div className="p-3 opacity-50">
                  <FiShoppingCart className="w-6 h-6 text-gray-700" />
                </div>
                <div className="p-3 opacity-50">
                  <FiMenu className="w-6 h-6 text-gray-700" />
                </div>
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
          scrolled ? 'bg-white shadow-lg' : 'bg-white/80 backdrop-blur-md'
        }`} />
        
        <div className="relative w-full">
          <nav className="flex items-center justify-between h-16 sm:h-18 md:h-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif font-bold text-gray-900 truncate max-w-[200px] sm:max-w-[250px] md:max-w-none">
                Hastkari
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <Link href="/" className="nav-link text-sm xl:text-base">Home</Link>
              <Link href="/categories" className="nav-link text-sm xl:text-base">Categories</Link>
              <Link href="/products" className="nav-link text-sm xl:text-base">Shop</Link>
            </div>

            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-md mx-4 xl:mx-8 search-container" ref={searchRef}>
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      if (e.target.value.trim()) {
                        setIsSearchLoading(true);
                      } else {
                        setIsSearchLoading(false);
                        setShowSuggestions(false);
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (searchSuggestions.length > 0 || isSearchLoading) {
                        setShowSuggestions(true);
                      }
                    }}
                    placeholder="Search products..."
                    className="w-full pl-3 sm:pl-4 pr-10 py-2 text-sm rounded-lg border border-heritage-200 focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white/50"
                    suppressHydrationWarning
                  />
                  <button type="submit" className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2">
                    <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted hover:text-accent-600" />
                  </button>
                  
                  {/* Search Suggestions Dropdown */}
                  <AnimatePresence>
                    {showSuggestions && (isSearchLoading || searchSuggestions.length > 0 || (search.trim() && !isSearchLoading)) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-[99999] max-h-80 overflow-y-auto search-suggestions-dropdown"
                      >
                        {isSearchLoading ? (
                          // Enhanced loading skeleton
                          <>
                            {[...Array(3)].map((_, index) => (
                              <div key={`skeleton-${index}`} className="px-4 py-3 border-b border-gray-100 last:border-b-0">
                                <div className="flex items-center space-x-3">
                                  <div className="relative w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded overflow-hidden">
                                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>
                                  </div>
                                  <div className="flex-1 min-w-0 space-y-2">
                                    <div className="relative h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded overflow-hidden">
                                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>
                                    </div>
                                    <div className="relative h-3 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded overflow-hidden">
                                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : (
                          // Actual results
                          searchSuggestions.map((suggestion, index) => (
                          <button
                            key={suggestion._id}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                              index === selectedSuggestion ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {suggestion.images?.[0]?.url && (
                                <img
                                  src={suggestion.images[0].url}
                                  alt={suggestion.name}
                                  className="w-8 h-8 object-cover rounded"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {highlightText(suggestion.name, search)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {suggestion.price === 0 ? (
                                    <span className="text-orange-600 font-semibold">Negotiable</span>
                                  ) : (
                                    `₹${suggestion.price}`
                                  )}
                                </p>
                              </div>
                            </div>
                          </button>
                          ))
                        )}
                        
                        {/* No results message */}
                        {!isSearchLoading && searchSuggestions.length === 0 && search.trim() && (
                          <div className="px-4 py-8 text-center text-gray-500">
                            <FiSearch className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                            <p className="text-sm">No products found for "{search}"</p>
                            <p className="text-xs text-gray-400 mt-1">Try searching with different keywords</p>
                          </div>
                        )}
                        
                        {/* Always show "Search for" option when there's text and not loading */}
                        {search.trim() && !isSearchLoading && (
                          <button
                            type="button"
                            onClick={() => {
                              router.push(`/products?search=${encodeURIComponent(search.trim())}`);
                              setShowSuggestions(false);
                              setSearch("");
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-t border-gray-200 text-blue-600 font-medium"
                          >
                            <div className="flex items-center space-x-2">
                              <FiSearch className="w-4 h-4" />
                              <span>Search for "<span className="text-accent-500 font-semibold">{search}</span>"</span>
                            </div>
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
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
            <div className="flex lg:hidden items-center space-x-2 flex-shrink-0">
              <Link href="/cart" className="p-3 relative hover:bg-gray-100 rounded-lg transition-colors">
                <FiShoppingCart className="w-6 h-6 text-gray-700" />
                {mounted && cart.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
                    {cart.totalItems}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiMenu className="w-6 h-6 text-gray-700" />
              </button>
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
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => {
                setMobileMenuOpen(false);
                setMobileSearchMode(false);
              }}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full bg-white z-50"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-heritage-200">
                  <h2 className="text-lg font-serif font-bold text-gray-900">
                    {mobileSearchMode ? 'Search' : 'Menu'}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setMobileSearchMode(!mobileSearchMode)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiSearch className="w-5 h-5 text-gray-600" />
                    </button>
                    <button 
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setMobileSearchMode(false);
                        setSearch('');
                        setShowSuggestions(false);
                      }} 
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiX className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {!mobileSearchMode && auth.isAuthenticated && (
                  <div className="p-4 bg-heritage-50">
                    <p className="font-medium text-gray-900">{auth.user?.name}</p>
                    <p className="text-sm text-text-muted">{auth.user?.email}</p>
                  </div>
                )}

                {mobileSearchMode ? (
                  <div className="flex-1 flex flex-col">
                    {/* Mobile Search Input */}
                    <div className="p-4 border-b border-gray-200">
                      <form onSubmit={handleSearch} className="relative">
                        <input
                          type="text"
                          value={search}
                          onChange={(e) => {
                            setSearch(e.target.value);
                            if (e.target.value.trim()) {
                              setIsSearchLoading(true);
                            } else {
                              setIsSearchLoading(false);
                            }
                          }}
                          onKeyDown={handleKeyDown}
                          placeholder="Search products..."
                          className="w-full pl-4 pr-12 py-3 text-sm rounded-lg border border-heritage-200 focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                          suppressHydrationWarning
                          autoFocus
                        />
                        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2">
                          <FiSearch className="w-4 h-4 text-text-muted hover:text-accent-600 transition-colors" />
                        </button>
                      </form>
                    </div>

                    {/* Search Results */}
                    <div className="flex-1 overflow-y-auto">
                      {isSearchLoading ? (
                        // Enhanced loading skeleton for mobile
                        <div className="p-2">
                          {[...Array(4)].map((_, index) => (
                            <div key={`mobile-skeleton-${index}`} className="p-4 border-b border-gray-100 last:border-b-0">
                              <div className="flex items-center space-x-3">
                                <div className="relative w-12 h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded overflow-hidden">
                                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>
                                </div>
                                <div className="flex-1 min-w-0 space-y-2">
                                  <div className="relative h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded overflow-hidden">
                                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>
                                  </div>
                                  <div className="relative h-3 w-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded overflow-hidden">
                                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : searchSuggestions.length > 0 ? (
                        <div className="p-2">
                          {searchSuggestions.map((suggestion, index) => (
                            <button
                              key={suggestion._id}
                              type="button"
                              onClick={() => {
                                handleSuggestionClick(suggestion);
                                setMobileMenuOpen(false);
                                setMobileSearchMode(false);
                              }}
                              className={`w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                                index === selectedSuggestion ? 'bg-blue-50 border-blue-200' : ''
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                {suggestion.images?.[0]?.url && (
                                  <img
                                    src={suggestion.images[0].url}
                                    alt={suggestion.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">
                                    {highlightText(suggestion.name, search)}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {suggestion.price === 0 ? (
                                      <span className="text-orange-600 font-semibold">Negotiable</span>
                                    ) : (
                                      `₹${suggestion.price}`
                                    )}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                          
                          {search.trim() && !isSearchLoading && (
                            <button
                              type="button"
                              onClick={() => {
                                router.push(`/products?search=${encodeURIComponent(search.trim())}`);
                                setMobileMenuOpen(false);
                                setMobileSearchMode(false);
                                setSearch("");
                              }}
                              className="w-full text-left p-4 hover:bg-gray-50 border-t border-gray-200 text-blue-600 font-medium"
                            >
                              <div className="flex items-center space-x-2">
                                <FiSearch className="w-4 h-4" />
                                <span>Search for "<span className="text-accent-500 font-semibold">{search}</span>"</span>
                              </div>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col h-full">
                          {/* No results message */}
                          {search.trim() && searchSuggestions.length === 0 && (
                            <div className="p-8 text-center text-gray-500 flex-1 flex flex-col justify-center">
                              <FiSearch className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                              <p className="mb-1">No products found for "{search}"</p>
                              <p className="text-sm text-gray-400">Try searching with different keywords</p>
                            </div>
                          )}
                          
                          {/* Empty state */}
                          {!search.trim() && (
                            <div className="p-8 text-center text-gray-400 flex-1 flex flex-col justify-center">
                              <FiSearch className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                              <p>Start typing to search products...</p>
                            </div>
                          )}
                          
                          {/* Always show "Search for" option at bottom when there's text */}
                          {search.trim() && (
                            <div className="border-t border-gray-200 p-2">
                              <button
                                onClick={() => {
                                  router.push(`/products?search=${encodeURIComponent(search.trim())}`);
                                  setMobileMenuOpen(false);
                                  setMobileSearchMode(false);
                                  setSearch("");
                                }}
                                className="w-full text-left p-4 hover:bg-gray-50 text-blue-600 font-medium rounded-lg"
                              >
                                <div className="flex items-center space-x-2">
                                  <FiSearch className="w-4 h-4" />
                                  <span>Search for "<span className="text-accent-500 font-semibold">{search}</span>"</span>
                                </div>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <nav className="flex-1 p-4 space-y-1">
                  <Link
                    href="/"
                    className="block px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-heritage-50 text-sm sm:text-base text-gray-900"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileSearchMode(false);
                    }}
                  >
                    Home
                  </Link>
                  <Link
                    href="/categories"
                    className="block px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-heritage-50 text-sm sm:text-base text-gray-900"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileSearchMode(false);
                    }}
                  >
                    Categories
                  </Link>
                  <Link
                    href="/products"
                    className="block px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-heritage-50 text-sm sm:text-base text-gray-900"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileSearchMode(false);
                    }}
                  >
                    Shop
                  </Link>

                  </nav>
                )}

                {!mobileSearchMode && (
                  <div className="p-4 border-t border-heritage-200">
                  {auth.isAuthenticated ? (
                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        className="block px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-heritage-50 text-sm sm:text-base text-gray-900"
                        onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileSearchMode(false);
                    }}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-heritage-50 text-sm sm:text-base text-gray-900"
                        onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileSearchMode(false);
                    }}
                      >
                        Orders
                      </Link>
                      {auth.user?.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="block px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-heritage-50 text-sm sm:text-base text-gray-900"
                          onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileSearchMode(false);
                    }}
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
                      onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileSearchMode(false);
                    }}
                    >
                      <FiLogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Login
                    </Link>
                  )}
                  </div>
                )}
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