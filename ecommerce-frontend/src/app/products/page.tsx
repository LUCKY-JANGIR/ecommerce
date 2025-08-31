'use client';

import React, { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { productsAPI, categoriesAPI } from '@/components/services/api';
import { Product } from '@/store/useStore';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import { 
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  X,
  ChevronDown,
  Star,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamic import for ProductCard
const ProductCard = dynamic(() => import('@/components/ProductCard'), {
  loading: () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className="aspect-square bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
      </div>
    </div>
  ),
  ssr: true
});

interface Category {
  _id: string;
  name: string;
  description: string;
}

export default function ProductsPageWrapper() {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsPage />
    </Suspense>
  );
}

function ProductsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 pt-20 pb-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4">
                <div className="aspect-square bg-gray-200 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
    search: searchParams.get('q') || '',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const observer = useRef<IntersectionObserver | undefined>(undefined);
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 500);

  const sortOptions = [
    { value: 'newest', label: 'Latest', icon: '🆕' },
    { value: 'price_asc', label: 'Price: Low to High', icon: '💰' },
    { value: 'price_desc', label: 'Price: High to Low', icon: '💎' },
    { value: 'rating', label: 'Best Rated', icon: '⭐' },
    { value: 'name', label: 'A to Z', icon: '🔤' },
  ];

  const { hydrated } = useStore();

  // Infinite scroll logic
  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !pagination.hasNextPage) return;
    
    setLoadingMore(true);
    try {
      const nextPage = pagination.currentPage + 1;
      const params: any = {
        page: nextPage,
        limit: 12,
        sortBy: filters.sortBy,
      };

      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.minPrice) params.minPrice = Number(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);

      const response = await productsAPI.getAll(params);
      if (response.products && response.products.length > 0) {
        setProducts(prevProducts => [...prevProducts, ...response.products]);
        setPagination(prev => ({
          ...response.pagination,
          currentPage: nextPage,
        }));
      }
    } catch (error) {
      console.error('Error loading more products:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, pagination.hasNextPage, pagination.currentPage, filters]);

  // Intersection Observer for infinite scroll
  const lastProductElementRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination.hasNextPage && !loadingMore) {
        loadMoreProducts();
      }
    }, {
      rootMargin: '200px',
      threshold: 0.1
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, pagination.hasNextPage, loadMoreProducts]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.getAll();
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async (page = 1, reset = true) => {
    if (reset) {
      setLoading(true);
      setProducts([]);
    }
    
    try {
      const params: any = {
        page,
        limit: 12,
        sortBy: filters.sortBy,
      };

      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.minPrice) params.minPrice = Number(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = Number(filters.maxPrice);

      const response = await productsAPI.getAll(params);
      if (reset) {
        setProducts(response.products || []);
      } else {
        setProducts(prevProducts => [...prevProducts, ...(response.products || [])]);
      }
      setPagination(response.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Update search filter when debounced value changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch]);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts(1, true);
  }, [filters, fetchProducts]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
      search: '',
    });
    setSearchInput('');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.search) count++;
    return count;
  };

  if (!hydrated) {
    return <ProductsPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Our Products
                </h1>
                <p className="text-gray-600 mt-1">
                  {pagination.totalProducts > 0 
                    ? `${pagination.totalProducts} products found`
                    : 'Discover our collection'
                  }
                </p>
              </div>
              
              {/* Desktop Search */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Mobile Search Toggle */}
                <button
                  onClick={() => setShowMobileSearch(!showMobileSearch)}
                  className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Search className="h-5 w-5" />
                </button>

                {/* Filters Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                  <span className="hidden sm:inline">Filters</span>
                  {getActiveFiltersCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </button>

                {/* Category Quick Filter */}
                <div className="hidden lg:flex items-center space-x-2">
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Sort Dropdown */}
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-200"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border-b border-gray-200"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear all
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Products Grid */}
        {loading ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1 max-w-4xl mx-auto'
          }`}>
            {[...Array(12)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1 max-w-4xl mx-auto'
          }`}>
            {products.map((product, index) => (
              <motion.div
                key={product._id}
                ref={index === products.length - 1 ? lastProductElementRef : null}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
              >
                <ProductCard product={product} viewMode={viewMode} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="flex justify-center py-8">
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Loading more products...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}