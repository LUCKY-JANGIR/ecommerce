'use client';

import React, { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { productsAPI, categoriesAPI } from '@/components/services/api';
import { Product } from '@/store/useStore';
import { useStore } from '@/store/useStore';
import { 
  Search,
  Grid3X3,
  List,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { motion } from 'framer-motion';
import { ProductsGridSkeleton } from '@/components/ui/Skeleton';

// Dynamic import for ProductCard
const ProductCard = dynamic(() => import('@/components/ProductCard'), {
  loading: () => (
    <div className="bg-dark-bg-secondary rounded-2xl overflow-hidden shadow-sm border border-dark-border-primary">
      <div className="relative aspect-square bg-gradient-to-r from-dark-bg-tertiary via-dark-bg-hover to-dark-bg-tertiary overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>
      <div className="p-4 space-y-3">
        <div className="relative h-4 bg-gradient-to-r from-dark-bg-tertiary via-dark-bg-hover to-dark-bg-tertiary rounded overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </div>
        <div className="relative h-4 w-2/3 bg-gradient-to-r from-dark-bg-tertiary via-dark-bg-hover to-dark-bg-tertiary rounded overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </div>
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

function ProductsPageSkeleton() {
  return (
    <div className="min-h-screen bg-dark-bg-primary">
      {/* Sidebar Skeleton */}
      <div className="hidden lg:block fixed top-0 left-0 w-72 xl:w-80 bg-dark-bg-secondary border-r border-dark-border-primary flex flex-col h-screen z-40">
        {/* Sidebar Header Skeleton */}
        <div className="flex-shrink-0 p-6 border-b border-dark-border-primary">
          <div className="space-y-4 mb-6">
            <div className="h-6 w-32 bg-gradient-to-r from-dark-bg-tertiary via-dark-bg-hover to-dark-bg-tertiary rounded animate-pulse" />
            <div className="h-4 w-40 bg-gradient-to-r from-dark-bg-tertiary via-dark-bg-hover to-dark-bg-tertiary rounded animate-pulse" />
          </div>
          <div className="h-10 w-full bg-gradient-to-r from-dark-bg-tertiary via-dark-bg-hover to-dark-bg-tertiary rounded-lg animate-pulse" />
        </div>

        {/* Sidebar Content Skeleton */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 w-16 bg-gradient-to-r from-dark-bg-tertiary via-dark-bg-hover to-dark-bg-tertiary rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-10 w-full bg-gradient-to-r from-dark-bg-tertiary via-dark-bg-hover to-dark-bg-tertiary rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="lg:ml-72 xl:ml-80 min-h-screen">
        {/* Mobile Header Skeleton */}
        <div className="lg:hidden bg-dark-bg-secondary border-b border-dark-border-primary px-4 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="h-8 w-20 bg-gradient-to-r from-dark-bg-tertiary via-dark-bg-hover to-dark-bg-tertiary rounded animate-pulse" />
            <div className="text-right space-y-1">
              <div className="h-5 w-24 bg-gradient-to-r from-dark-bg-tertiary via-dark-bg-hover to-dark-bg-tertiary rounded animate-pulse" />
              <div className="h-4 w-16 bg-gradient-to-r from-dark-bg-tertiary via-dark-bg-hover to-dark-bg-tertiary rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="p-4 lg:p-8">
          <ProductsGridSkeleton count={12} />
        </div>
      </div>
    </div>
  );
}

export default function ProductsPageWrapper() {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsPage />
    </Suspense>
  );
}



function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      const params: Record<string, unknown> = {
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
        setProducts(prev => [...prev, ...response.products]);
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
      const params: Record<string, unknown> = {
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
    <div className="min-h-screen bg-dark-bg-primary">
      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed top-0 left-0 z-50 lg:z-40 w-80 lg:w-72 xl:w-80 bg-dark-bg-secondary border-r border-dark-border-primary transition-transform duration-300 ease-in-out lg:transition-none flex flex-col h-screen`}>
        
        {/* Sidebar Header */}
        <div className="flex-shrink-0 p-6 border-b border-dark-border-primary">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 text-dark-text-muted hover:text-dark-text-primary hover:bg-dark-bg-hover rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-dark-text-primary font-display">
                  Our Collection
                </h1>
                <p className="text-dark-text-secondary text-sm">
                  {pagination.totalProducts > 0 
                    ? `${pagination.totalProducts} treasures found`
                    : 'Discover authentic crafts'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted h-4 w-4" />
            <input
              type="text"
              placeholder="Search handcrafted treasures..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-dark-border-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-dark-bg-primary text-dark-text-primary placeholder-dark-text-muted"
            />
          </div>
        </div>

        {/* Sidebar Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Sort Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-dark-text-primary uppercase tracking-wide">
              Sort By
            </h3>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-dark-border-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-dark-bg-primary text-dark-text-primary"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-dark-text-primary uppercase tracking-wide">
              Categories
            </h3>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-dark-border-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-dark-bg-primary text-dark-text-primary"
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
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-dark-text-primary uppercase tracking-wide">
              Price Range
            </h3>
            <div className="space-y-2">
              <input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-dark-border-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-dark-bg-primary text-dark-text-primary placeholder-dark-text-muted"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-dark-border-primary rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-dark-bg-primary text-dark-text-primary placeholder-dark-text-muted"
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-dark-text-primary uppercase tracking-wide">
              View Mode
            </h3>
            <div className="flex items-center bg-dark-bg-hover rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 flex items-center justify-center py-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-dark-bg-secondary text-dark-text-primary shadow-sm' 
                    : 'text-dark-text-muted hover:text-dark-text-primary'
                }`}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                <span className="text-sm">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 flex items-center justify-center py-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-dark-bg-secondary text-dark-text-primary shadow-sm' 
                    : 'text-dark-text-muted hover:text-dark-text-primary'
                }`}
              >
                <List className="h-4 w-4 mr-2" />
                <span className="text-sm">List</span>
              </button>
            </div>
          </div>

          {/* Clear Filters */}
          {getActiveFiltersCount() > 0 && (
            <div className="pt-4 border-t border-dark-border-primary">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm text-accent-500 hover:text-accent-400 hover:bg-accent-500/10 rounded-lg transition-colors border border-accent-500/20"
              >
                Clear All Filters ({getActiveFiltersCount()})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-72 xl:ml-80 min-h-screen">
        
        {/* Mobile Header */}
        <div className="lg:hidden bg-dark-bg-secondary border-b border-dark-border-primary px-4 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center space-x-2 px-3 py-2 text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-hover rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5" />
              <span>Filters</span>
              {getActiveFiltersCount() > 0 && (
                <span className="bg-accent-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
            
            <div className="text-right">
              <h1 className="text-lg font-bold text-dark-text-primary">
                Our Collection
              </h1>
              <p className="text-dark-text-secondary text-sm">
                {pagination.totalProducts} treasures
              </p>
            </div>
          </div>
        </div>

        {/* Products Content */}
        <div className="p-4 lg:p-8">
          {loading ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1 max-w-4xl mx-auto'
            }`}>
              {[...Array(12)].map((_, index) => (
                <div key={index} className="bg-dark-bg-secondary rounded-2xl overflow-hidden shadow-sm border border-dark-border-primary">
                  <div className="relative aspect-square bg-gradient-to-r from-dark-bg-tertiary via-dark-bg-hover to-dark-bg-tertiary overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="relative h-4 bg-gradient-to-r from-dark-bg-tertiary via-dark-bg-hover to-dark-bg-tertiary rounded overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    </div>
                    <div className="relative h-4 w-2/3 bg-gradient-to-r from-dark-bg-tertiary via-dark-bg-hover to-dark-bg-tertiary rounded overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="relative h-5 w-20 bg-gradient-to-r from-dark-bg-tertiary via-dark-bg-hover to-dark-bg-tertiary rounded overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                      </div>
                      <div className="relative h-8 w-8 bg-gradient-to-r from-dark-bg-tertiary via-dark-bg-hover to-dark-bg-tertiary rounded-full overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                      </div>
                    </div>
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
              <div className="bg-dark-bg-secondary rounded-2xl p-12 shadow-sm border border-dark-border-primary max-w-md mx-auto">
                <div className="w-16 h-16 bg-dark-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-8 w-8 text-dark-text-muted" />
                </div>
                <h3 className="text-xl font-semibold text-dark-text-primary mb-2">No products found</h3>
                <p className="text-dark-text-secondary mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-accent-500 text-white px-6 py-2 rounded-lg hover:bg-accent-600 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            </motion.div>
          )}

          {/* Loading More Indicator */}
          {loadingMore && (
            <div className="flex justify-center py-8">
              <div className="flex items-center space-x-2 text-dark-text-muted">
                <div className="w-5 h-5 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                <span>Loading more products...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}