'use client';

import { Suspense, useCallback, useRef } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { productsAPI, categoriesAPI } from '@/components/services/api';
import { Product } from '@/store/useStore';
import { useStore } from '@/store/useStore';
import { 
  Filter, 
  Grid, 
  List, 
  ChevronDown,
  Search,
  X
} from 'lucide-react';
import { FiUser } from "react-icons/fi";
import { useDebounce } from '@/hooks/useDebounce';
import { motion } from 'framer-motion';

export default function ProductsPageWrapper() {
  return (
    <Suspense>
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
  const { auth } = useStore();

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
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;

      const response = await productsAPI.getAll(params);
      if (response.products && response.products.length > 0) {
        setProducts(prev => [...prev, ...response.products]);
        setPagination(response.pagination);
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
      if (entries[0].isIntersecting && pagination.hasNextPage) {
        // Call loadMoreProducts directly without dependency
        if (!loadingMore && pagination.hasNextPage) {
          loadMoreProducts();
        }
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, pagination.hasNextPage]);

  useEffect(() => {
    // Fetch categories from backend
    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.getAll();
        setCategories(data.map((cat: any) => cat.name));
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setFilters(prev => ({ ...prev, search: debouncedSearch }));
    // Only update filter when debounced value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const fetchProducts = async (page = 1, reset = true) => {
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
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;

      const response = await productsAPI.getAll(params);
      if (reset) {
        setProducts(response.products || []);
      } else {
        setProducts(prev => [...prev, ...(response.products || [])]);
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
  };

  useEffect(() => {
    fetchProducts(1, true);
  }, [filters]);

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">All Products</h1>
          <p className="text-secondary text-lg">{pagination.totalProducts} products found</p>
        </div>

        {/* Search and Filters */}
        <div className="w-full mb-8 flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
          {/* Search Bar & Sort */}
          <div className="flex-1 flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <div className="flex items-center bg-secondary backdrop-blur border border-primary rounded-xl px-4 py-2 relative">
                <Search className="mr-2 h-5 w-5 text-primary" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-text-main placeholder-text-muted font-medium text-base px-2"
                  // Removed onFocus and onBlur for suggestions
                />
                {/* Suggestions dropdown removed */}
              </div>
            </form>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="bg-secondary backdrop-blur border border-primary rounded-xl px-4 py-2 text-text-main font-semibold outline-none focus:ring-2 focus:ring-primary"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value} className="text-text-main bg-secondary">
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              type="button"
              className="md:hidden bg-primary text-background px-4 py-2 rounded-xl font-bold shadow hover:bg-primary-light transition-colors"
            >
              <Filter className="h-5 w-5 mr-1" /> Filters
            </button>
          </div>
        </div>

        {/* Filters and Product Grid */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter Sidebar */}
          <div className={`w-full md:w-64 flex-shrink-0 ${showFilters ? '' : 'hidden md:block'}`}>
            <div className="bg-secondary backdrop-blur border border-primary rounded-xl p-6 mb-4 flex flex-col gap-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-display font-semibold text-text-main">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm font-bold text-blue-600 border border-blue-600 bg-transparent px-3 py-1 rounded transition-colors hover:bg-blue-600 hover:text-white"
                >
                  Clear All
                </button>
              </div>
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-text-main mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full bg-background border border-primary rounded-lg px-3 py-2 text-text-main outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="text-text-main bg-background">
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              {/* Price Range */}
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-text-main mb-1">Price Range</label>
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="bg-background border border-primary rounded-lg px-3 py-2 text-text-main outline-none focus:ring-2 focus:ring-primary placeholder-text-muted"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="bg-background border border-primary rounded-lg px-3 py-2 text-text-main outline-none focus:ring-2 focus:ring-primary placeholder-text-muted"
                />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {loading ? (
                [...Array(8)].map((_, index) => (
                  <div key={index} className="bg-card border border-accent rounded-2xl h-52 animate-pulse" />
                ))
              ) : products.length > 0 ? (
                products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    ref={index === products.length - 1 ? lastProductElementRef : null}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-primary text-lg">No products found matching your criteria.</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 border-2 border-accent text-accent bg-white font-bold px-4 py-2 rounded-lg transition-colors hover:bg-accent hover:text-white"
                  >
                    Clear filters
                  </button>
                </div>
              )}
              
              {/* Loading more indicator */}
              {loadingMore && (
                <div className="col-span-full flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 