"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/store/useStore';
import { categoriesAPI, productsAPI } from '@/components/services/api';
import { CategoriesGridSkeleton } from '@/components/ui/Skeleton';

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
}

interface CategoryWithProducts extends Category {
  products: Product[];
  productCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const categoriesData: Category[] = await categoriesAPI.getAll();

        // Fetch products for each category
        const categoriesWithProducts = await Promise.all(
          categoriesData.map(async (category) => {
            try {
              // Use the getAll method with category filter to get proper pagination info
              const productsData = await productsAPI.getAll({ 
                category: category._id, 
                limit: 100 // Get a large number to count all products
              });
              
              return {
                ...category,
                products: productsData.products || [],
                productCount: productsData.pagination?.totalProducts || 0
              };
            } catch (error) {
              console.error(`Error fetching products for category ${category.name}:`, error);
              return {
                ...category,
                products: [],
                productCount: 0
              };
            }
          })
        );

        setCategories(categoriesWithProducts);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12 space-y-4">
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mx-auto" />
            <div className="h-6 w-80 bg-gray-200 rounded animate-pulse mx-auto" />
          </div>
          <CategoriesGridSkeleton count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Simple Header */}
        <div className="text-center mb-12 pt-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our handcrafted collections organized by traditional categories
          </p>
        </div>

        {/* All Categories Grid */}
        {categories.length > 0 && (
          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <Link href={`/category/${encodeURIComponent(category.name)}`}>
                    <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                      {/* Category Image */}
                      <div className="relative h-64 overflow-hidden">
                        {category.image ? (
                          <div 
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat group-hover:scale-110 transition-transform duration-700"
                            style={{ backgroundImage: `url(${category.image})` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-6xl font-bold opacity-80">
                              {category.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        
                        {/* Product Count Badge */}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                          <span className="text-sm font-semibold text-gray-800">
                            {category.productCount} Items
                          </span>
                        </div>
                      </div>
                      
                      {/* Category Info */}
                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                          {category.description}
                        </p>
                        
                        {/* Product Preview */}
                        {category.products && category.products.length > 0 && (
                          <div className="mb-4">
                            <div className="flex -space-x-2 mb-2">
                              {category.products.slice(0, 3).map((product, idx) => (
                                <div
                                  key={product._id}
                                  className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-200"
                                  style={{
                                    backgroundImage: product.images?.[0]?.url ? `url(${product.images[0].url})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                  }}
                                />
                              ))}
                              {category.productCount > 3 && (
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                                  <span className="text-xs font-semibold text-gray-600">
                                    +{category.productCount - 3}
                                  </span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">Featured products</p>
                          </div>
                        )}
                        
                        {/* Explore Button */}
                        <div className="flex items-center justify-between">
                          <span className="text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                            Explore Collection
                          </span>
                          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}


      </div>
    </div>
  );
} 