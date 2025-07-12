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
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold text-[#d4af37] mb-2">All Products</h1>
          <p className="text-gray-200 text-lg">{pagination.totalProducts} products found</p>
        </div>

        {/* Search and Filters */}
        <div className="w-full mb-8 flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
          {/* Search Bar & Sort */}
          <div className="flex-1 flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <div className="flex items-center bg-black/40 backdrop-blur border border-[#d4af37] rounded-xl px-4 py-2">
                <Search className="mr-2 h-5 w-5 text-[#d4af37]" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="flex-1 bg-transparent outline-none text-gray-100 placeholder-[#d4af37] font-medium text-base px-2"
                  style={{ outlineColor: '#d4af37' }}
                />
              </div>
            </form>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="bg-black/40 backdrop-blur border border-[#d4af37] rounded-xl px-4 py-2 text-[#d4af37] font-semibold outline-none focus:ring-2 focus:ring-[#d4af37]"
              style={{ outlineColor: '#d4af37' }}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value} className="text-[#d4af37] bg-black">
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              type="button"
              className="md:hidden bg-[#d4af37] text-black px-4 py-2 rounded-xl font-bold shadow hover:bg-[#e6c385] transition-colors"
            >
              <Filter className="h-5 w-5 mr-1" /> Filters
            </button>
          </div>
        </div>

        {/* Filters and Product Grid */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter Sidebar */}
          <div className={`w-full md:w-64 flex-shrink-0 ${showFilters ? '' : 'hidden md:block'}`}>
            <div className="bg-black/40 backdrop-blur border border-[#d4af37] rounded-xl p-6 mb-4 flex flex-col gap-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-playfair font-semibold text-[#d4af37]">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm font-bold text-[#d4af37] bg-transparent px-3 py-1 rounded hover:bg-[#d4af37]/10 transition-colors"
                >
                  Clear All
                </button>
              </div>
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-[#d4af37] mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full bg-black/30 border border-[#d4af37] rounded-lg px-3 py-2 text-[#d4af37] outline-none focus:ring-2 focus:ring-[#d4af37]"
                  style={{ outlineColor: '#d4af37' }}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="text-[#d4af37] bg-black">
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              {/* Price Range */}
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-[#d4af37] mb-1">Price Range</label>
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="bg-black/30 border border-[#d4af37] rounded-lg px-3 py-2 text-[#d4af37] outline-none focus:ring-2 focus:ring-[#d4af37] placeholder-[#d4af37]"
                  style={{ outlineColor: '#d4af37' }}
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="bg-black/30 border border-[#d4af37] rounded-lg px-3 py-2 text-[#d4af37] outline-none focus:ring-2 focus:ring-[#d4af37] placeholder-[#d4af37]"
                  style={{ outlineColor: '#d4af37' }}
                />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fadein">
              {loading ? (
                [...Array(8)].map((_, index) => (
                  <div key={index} className="bg-black/40 border border-[#d4af37] rounded-xl h-52 animate-pulse" />
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-[#d4af37] text-lg">No products found matching your criteria.</p>
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-[#d4af37] hover:text-black hover:bg-[#d4af37] font-bold px-4 py-2 rounded-lg transition-colors bg-black/40 border border-[#d4af37]"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 