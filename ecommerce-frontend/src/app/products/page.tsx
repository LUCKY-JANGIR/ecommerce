'use client';

import React, { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { productsAPI, categoriesAPI } from '@/components/services/api';
import { Product } from '@/store/useStore';
import { useStore } from '@/store/useStore';
import { getOptimizedImageUrl } from '@/lib/imageUtils';
import Link from 'next/link';
import { 
  Filter, 
  Grid, 
  List, 
  Search
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { motion } from 'framer-motion';

// Dynamic import for ProductCard to reduce initial bundle
const ProductCard = dynamic(() => import('@/components/ProductCard'), {
  loading: () => <div className="bg-white border border-heritage-200 rounded-2xl h-80 animate-pulse shadow-lg" />,
  ssr: true
});

export default function ProductsPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background-cream animate-pulse" />}>
      <ProductsPage />
    </Suspense>
  );
}

function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
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
  const [categories, setCategories] = useState<string[]>([]);
  const observer = useRef<IntersectionObserver | undefined>(undefined);
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 700);
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'name', label: 'Name A-Z' },
  ];

  const { hydrated } = useStore();

  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !pagination.hasNextPage) return;
    
    setLoadingMore(true);
    try {
      const nextPage = pagination.currentPage + 1;
      const params: {
        page: number;
        limit: number;
        sortBy: string;
        category?: string;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
      } = {
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
        setPagination(() => ({
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
      rootMargin: '100px', // Start loading 100px before the element is visible
      threshold: 0.1
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, pagination.hasNextPage, loadMoreProducts]);

  useEffect(() => {
    // Fetch categories from backend
    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.getAll();
        setCategories(data.map((cat: { name: string }) => cat.name));
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();

    // Fetch featured products
    const fetchFeaturedProducts = async () => {
      try {
        const data = await productsAPI.getFeatured();
        if (data && Array.isArray(data)) {
          setFeaturedProducts(data.slice(0, 6)); // Show only 6 featured products
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      }
    };
    fetchFeaturedProducts();
  }, []);

  const fetchProducts = useCallback(async (page = 1, reset = true) => {
    if (reset) {
      setLoading(true);
      setProducts([]);
    }
    
    try {
      const params: {
        page: number;
        limit: number;
        sortBy: string;
        category?: string;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
      } = {
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

  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }));
    // Only update filter when debounced value changes
  }, [debouncedSearch]);

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
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(1, true);
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-cream">
        <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-cream">
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-1 bg-accent-500 rounded-full" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-700 mb-4">
              Discover Our Collection
            </h1>
            <p className="text-lg md:text-xl text-text-secondary max-w-3xl mx-auto">
                                Explore handcrafted treasures from India&apos;s finest artisans. Each piece tells a story of tradition, passion, and unparalleled craftsmanship.
            </p>
          </div>
        </motion.div>

        {/* Featured Products Grid */}
        {featuredProducts.length > 0 && (
          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-600">Handpicked collection of our finest items</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ProductCard product={product} viewMode="grid" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full mb-12 flex flex-col gap-6 md:flex-row md:items-center md:gap-8"
        >
          {/* Search Bar & Sort */}
          <div className="flex-1 flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <div className="flex items-center bg-white backdrop-blur border border-heritage-200 rounded-2xl px-6 py-4 relative shadow-lg">
                <Search className="mr-3 h-5 w-5 text-primary-600" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-text-primary placeholder-text-muted font-medium text-base px-2"
                />
              </div>
            </form>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="bg-white backdrop-blur border border-heritage-200 rounded-2xl px-6 py-4 text-text-primary font-semibold outline-none focus:ring-2 focus:ring-accent-500 shadow-lg"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value} className="text-text-primary bg-white">
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              type="button"
              className="md:hidden bg-accent-500 text-white px-6 py-4 rounded-2xl font-bold shadow-lg hover:bg-accent-600 transition-colors"
            >
              <Filter className="h-5 w-5 mr-2" /> Filters
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-white rounded-2xl p-2 shadow-lg border border-heritage-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-accent-500 text-white' 
                  : 'text-text-secondary hover:text-primary-700'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-colors ${
                viewMode === 'list' 
                  ? 'bg-accent-500 text-white' 
                  : 'text-text-secondary hover:text-primary-700'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        {/* Filters and Product Grid */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`w-full md:w-80 flex-shrink-0 ${showFilters ? '' : 'hidden md:block'}`}
          >
            <div className="bg-white border border-heritage-200 rounded-2xl p-8 mb-6 flex flex-col gap-8 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-serif font-bold text-primary-700">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm font-bold text-accent-600 border border-accent-600 bg-transparent px-4 py-2 rounded-xl transition-colors hover:bg-accent-600 hover:text-white"
                >
                  Clear All
                </button>
              </div>
              
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full bg-background-cream border border-heritage-200 rounded-xl px-4 py-3 text-text-primary outline-none focus:ring-2 focus:ring-accent-500 transition-colors"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="text-text-primary bg-background-cream">
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Price Range */}
              <div className="flex flex-col gap-3">
                <label className="block text-sm font-medium text-text-primary mb-3">Price Range</label>
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="bg-background-cream border border-heritage-200 rounded-xl px-4 py-3 text-text-primary outline-none focus:ring-2 focus:ring-accent-500 placeholder-text-muted transition-colors"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="bg-background-cream border border-heritage-200 rounded-xl px-4 py-3 text-text-primary outline-none focus:ring-2 focus:ring-accent-500 placeholder-text-muted transition-colors"
                />
              </div>
            </div>
          </motion.div>

          {/* Product Grid */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex-1"
          >
            <div className={`grid gap-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {loading ? (
                [...Array(8)].map((_, index) => (
                  <div key={index} className="bg-white border border-heritage-200 rounded-2xl h-80 animate-pulse shadow-lg" />
                ))
              ) : products.length > 0 ? (
                products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    ref={index === products.length - 1 ? lastProductElementRef : null}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                  >
                    <ProductCard product={product} viewMode={viewMode} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <div className="bg-white border border-heritage-200 rounded-2xl p-12 shadow-lg">
                    <div className="w-24 h-24 bg-heritage-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="h-12 w-12 text-heritage-400" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-primary-700 mb-4">No products found</h3>
                    <p className="text-text-secondary mb-8 max-w-md mx-auto">
                      We couldn&apos;t find any products matching your criteria. Try adjusting your filters or search terms.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="bg-accent-500 text-white px-8 py-3 rounded-xl hover:bg-accent-600 transition-colors font-semibold shadow-lg"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>
              )}
              
              {/* Loading more indicator */}
              {loadingMore && (
                <div className="col-span-full flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>


  );
} 