'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { productsAPI } from '@/services/api';
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

  const categories = [
    'Electronics', 'Clothing', 'Books', 'Home & Garden', 
    'Sports', 'Beauty', 'Toys', 'Automotive', 'Health', 'Food'
  ];

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

  const fetchProducts = async (page = 1) => {
    setLoading(true);
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
      setProducts(response.products || []);
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
    fetchProducts();
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
    fetchProducts(1);
  };

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="container mx-auto px-4 py-24">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gold mb-2">All Products</h1>
          <p className="text-white">
            {pagination.totalProducts} products found
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-neutral-900 rounded-xl shadow-xl p-6 mb-8 border border-neutral-800">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <form onSubmit={(e) => { console.log('Search submitted'); handleSearch(e); }} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gold" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => { console.log('Search changed', e.target.value); handleFilterChange('search', e.target.value); }}
                  className="w-full pl-10 pr-4 py-2 border border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold bg-neutral-950 text-white placeholder-gold"
                />
              </form>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <select
                value={filters.sortBy}
                onChange={(e) => { console.log('Sort changed', e.target.value); handleFilterChange('sortBy', e.target.value); }}
                className="w-full px-3 py-2 border border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold bg-neutral-950 text-gold"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value} className="text-gold bg-neutral-950">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => { console.log('Filter toggle clicked'); setShowFilters(!showFilters); }}
              className="lg:hidden bg-gold text-neutral-950 px-4 py-2 rounded-lg flex items-center space-x-2 font-bold shadow hover:bg-yellow-400 transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>

            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => { console.log('Grid view clicked'); setViewMode('grid'); }}
                className={`p-2 rounded-lg font-bold shadow ${viewMode === 'grid' ? 'bg-gold text-neutral-950' : 'bg-neutral-800 text-gold'} transition-colors`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => { console.log('List view clicked'); setViewMode('list'); }}
                className={`p-2 rounded-lg font-bold shadow ${viewMode === 'list' ? 'bg-gold text-neutral-950' : 'bg-neutral-800 text-gold'} transition-colors`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-neutral-800 lg:hidden">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gold mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => { console.log('Category changed', e.target.value); handleFilterChange('category', e.target.value); }}
                    className="w-full px-3 py-2 border border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold bg-neutral-950 text-gold"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category} className="text-gold bg-neutral-950">
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gold mb-1">Min Price</label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => { console.log('Min price changed', e.target.value); handleFilterChange('minPrice', e.target.value); }}
                    className="w-full px-3 py-2 border border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold bg-neutral-950 text-gold placeholder-gold"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-neutral-900 rounded-xl shadow-xl p-6 sticky top-24 border border-neutral-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gold">Filters</h3>
                <button
                  onClick={() => { console.log('Clear filters clicked'); clearFilters(); }}
                  className="text-sm font-bold text-gold bg-neutral-800 px-4 py-2 rounded-lg hover:bg-gold hover:text-neutral-950 transition-colors shadow"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gold mb-3">Category</h4>
                <select
                  value={filters.category}
                  onChange={(e) => { console.log('Category changed', e.target.value); handleFilterChange('category', e.target.value); }}
                  className="w-full px-3 py-2 border border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold bg-neutral-950 text-gold"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="text-gold bg-neutral-950">
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gold mb-3">Price Range</h4>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => { console.log('Min price changed', e.target.value); handleFilterChange('minPrice', e.target.value); }}
                    className="w-full px-3 py-2 border border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold bg-neutral-950 text-gold placeholder-gold"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => { console.log('Max price changed', e.target.value); handleFilterChange('maxPrice', e.target.value); }}
                    className="w-full px-3 py-2 border border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold bg-neutral-950 text-gold placeholder-gold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="bg-neutral-800 rounded-xl h-80 animate-pulse"></div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => { console.log('Prev page clicked'); fetchProducts(pagination.currentPage - 1); }}
                        disabled={!pagination.hasPrevPage}
                        className="px-3 py-2 border border-gold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold hover:text-neutral-950 bg-neutral-900 text-gold font-bold transition-colors"
                      >
                        Previous
                      </button>
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => { console.log('Page clicked', page); fetchProducts(page); }}
                          className={`px-3 py-2 border rounded-lg font-bold transition-colors ${
                            page === pagination.currentPage
                              ? 'bg-gold text-neutral-950 border-gold'
                              : 'border-gold hover:bg-gold hover:text-neutral-950 bg-neutral-900 text-gold'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => { console.log('Next page clicked'); fetchProducts(pagination.currentPage + 1); }}
                        disabled={!pagination.hasNextPage}
                        className="px-3 py-2 border border-gold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold hover:text-neutral-950 bg-neutral-900 text-gold font-bold transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gold">No products found matching your criteria.</p>
                <button
                  onClick={() => { console.log('Clear filters clicked (no products)'); clearFilters(); }}
                  className="mt-4 text-gold hover:text-neutral-950 hover:bg-gold font-bold px-4 py-2 rounded-lg transition-colors bg-neutral-900"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 