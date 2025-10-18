"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Filter, Grid3X3, List } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { productsAPI } from "@/components/services/api";
import { categoriesAPI } from "@/components/services/api";
import { Product } from "@/store/useStore";
import { getImagePreset } from "@/lib/cloudinary";
import { getBlurPlaceholder } from "@/lib/imageUtils";

interface Category {
  _id: string;
  name: string;
  image: string;
  description?: string;
}

export default function CategoryPage() {
  const { category } = useParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Decode the category name from URL
  const categoryStr = Array.isArray(category) ? category[0] : category;
  const decodedCategory = decodeURIComponent(categoryStr || '');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories and find current category
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        setCategories(response || []);
        
        // Find current category details
        const foundCategory = response?.find((cat: any) =>
          cat.name.toLowerCase() === decodedCategory.toLowerCase()
        );
        setCurrentCategory(foundCategory || null);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
      }
    };

    if (decodedCategory) {
      fetchCategories();
    }
  }, [decodedCategory]);

  // Fetch products for current category
  useEffect(() => {
    const fetchProducts = async () => {
      if (!decodedCategory) return;
      
      setLoading(true);
      try {
        const response = await productsAPI.getAll({ 
          category: decodedCategory,
          limit: 50 
        });
        setProducts(response.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [decodedCategory]);

  const handleCategoryChange = (categoryName: string) => {
    router.push(`/category/${encodeURIComponent(categoryName)}`);
  };

  const categoryImage = currentCategory?.image || '/images/placeholder-category.jpg';

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg-primary">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-dark-text-secondary">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg-primary flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/categories" className="text-accent-500 hover:text-accent-400">
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg-primary">
      {/* Hero Banner Section - Full Width */}
      <div className="relative h-screen overflow-hidden">
        <Image
          src={getImagePreset(categoryImage, 'hero')}
          alt={decodedCategory}
          fill
          className="object-cover"
          priority
          quality={95}
          placeholder="blur"
          blurDataURL={getBlurPlaceholder(50, 50)}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-4"
            >
              {decodedCategory?.replace(/-/g, " ").toUpperCase()}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl font-light max-w-2xl mx-auto"
            >
              HERITAGE WOVEN BY HANDS
            </motion.p>
          </div>
        </div>

        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Link 
            href="/categories"
            className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Categories</span>
          </Link>
        </div>
      </div>

      {/* Content Section - Below Hero Image */}
      <div className="flex h-screen">
        {/* Sidebar - Independently Scrollable */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 
          fixed lg:static left-0 z-50 lg:z-auto 
          w-80 lg:w-72 xl:w-80 
          bg-dark-bg-secondary 
          border-r border-dark-border-primary 
          transition-transform duration-300 ease-in-out 
          lg:transition-none 
          flex flex-col 
          h-screen
        `}>
          {/* Sidebar Header */}
          <div className="flex-shrink-0 p-6 border-b border-dark-border-primary">
            {/* Mobile Close Button */}
            <div className="flex justify-between items-center mb-6 lg:hidden">
              <h2 className="text-xl font-bold text-dark-text-primary">CATEGORIES</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-dark-text-secondary hover:text-dark-text-primary text-xl"
              >
                ✕
              </button>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block">
              <h2 className="text-xl font-bold text-dark-text-primary mb-2">CATEGORIES</h2>
              <p className="text-sm text-dark-text-secondary">Browse by category</p>
            </div>
          </div>

          {/* Sidebar Content - Independently Scrollable */}
          <div className="flex-1 overflow-y-auto p-6" data-lenis-prevent>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryChange(cat.name)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                    cat.name === decodedCategory
                      ? 'bg-accent-500 text-white shadow-lg'
                      : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-hover'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area - Independently Scrollable */}
        <div className="flex-1 h-screen overflow-y-auto" data-lenis-prevent>
          <div className="p-6 lg:p-8">
            {/* Category Description */}
            <div className="max-w-4xl mx-auto mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-dark-text-primary mb-4">
                  Our {decodedCategory} Collection
                </h2>
                <div className="inline-flex items-center bg-accent-500 text-white px-6 py-2 rounded-full text-sm font-medium mb-6">
                  TIME UNRAVELER
                </div>
                <p className="text-lg text-dark-text-secondary mb-4">
                  Hand Made {decodedCategory}
                </p>
                <p className="text-dark-text-secondary max-w-3xl mx-auto leading-relaxed">
                  Each piece in our collection is a testament to the timeless artistry and cultural heritage that defines authentic handcrafted works. From intricate patterns to traditional techniques, every item carries the soul of its creator and the stories of generations past.
                </p>
              </motion.div>
            </div>

            {/* Products Section */}
            <div className="max-w-7xl mx-auto">
              {/* Products Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-dark-bg-secondary border border-dark-border-primary rounded-lg text-dark-text-primary hover:bg-dark-bg-hover transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    <span>Categories</span>
                  </button>
                  <h3 className="text-2xl font-bold text-dark-text-primary">
                    {products.length} Items
                  </h3>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-dark-bg-secondary rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-accent-500 text-white' 
                        : 'text-dark-text-secondary hover:text-dark-text-primary'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                    <span>Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-accent-500 text-white' 
                        : 'text-dark-text-secondary hover:text-dark-text-primary'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    <span>List</span>
                  </button>
                </div>
              </div>

              {/* Products Grid */}
              {products.length > 0 ? (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1 max-w-4xl mx-auto'
                }`}>
                  {products.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ProductCard product={product} viewMode={viewMode} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="bg-dark-bg-secondary rounded-2xl p-12 shadow-sm border border-dark-border-primary max-w-md mx-auto">
                    <div className="w-16 h-16 bg-dark-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
                      <Filter className="h-8 w-8 text-dark-text-muted" />
                    </div>
                    <h3 className="text-xl font-semibold text-dark-text-primary mb-2">No products found</h3>
                    <p className="text-dark-text-secondary mb-6">
                      No products available in this category
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}