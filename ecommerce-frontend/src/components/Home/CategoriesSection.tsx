'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { categoriesAPI, productsAPI } from '@/components/services/api';
import { getOptimizedImageUrl } from '@/lib/imageUtils';

interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  images?: Array<{ url: string; alt?: string }>;
}

interface CategoryWithProducts extends Category {
  products: Product[];
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoriesAndProducts = async () => {
      try {
        // Fetch all categories
        const categoriesData = await categoriesAPI.getAll();
        
        if (categoriesData && Array.isArray(categoriesData)) {
          // Fetch products for each category to check if they have at least 4 products
          const categoriesWithProducts = await Promise.all(
            categoriesData.map(async (category) => {
              try {
                const productsData = await productsAPI.getAll({ 
                  category: category._id, 
                  limit: 10 // Fetch more to check if category has at least 4 products
                });
                
                const products = productsData?.products || [];
                
                return {
                  ...category,
                  products: products.slice(0, 4) // Limit to 4 products per category
                };
              } catch (error) {
                console.error(`Error fetching products for category ${category._id}:`, error);
                return {
                  ...category,
                  products: []
                };
              }
            })
          );
          
          // Filter categories that have at least 4 products
          const validCategories = categoriesWithProducts.filter(category => category.products.length >= 4);
          
          // Shuffle and take first 3 categories from valid ones
          const shuffledCategories = validCategories.sort(() => 0.5 - Math.random()).slice(0, 3);
          
          setCategories(shuffledCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Shop by Category</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">Explore our diverse collection</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 animate-pulse">
                <div className="h-40 sm:h-48 bg-gray-300 rounded-lg mb-3 sm:mb-4"></div>
                <div className="h-5 sm:h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 sm:h-4 bg-gray-300 rounded mb-3 sm:mb-4"></div>
                <div className="grid grid-cols-2 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 sm:h-20 bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-4">Shop by Category</h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">Explore our diverse collection of handloom products</p>
        </motion.div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {categories.map((category, categoryIndex) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: categoryIndex * 0.2 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Category Header */}
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{category.name}</h3>
                    <Link 
                      href={`/categories/${category._id}`}
                      className="text-orange-600 hover:text-orange-700 font-semibold text-xs sm:text-sm"
                    >
                      View All →
                    </Link>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm">{category.description}</p>
                </div>

                {/* Products Grid */}
                <div className="p-4 sm:p-6">
                  {category.products.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {category.products.map((product, productIndex) => (
                        <motion.div
                          key={product._id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: productIndex * 0.1 }}
                          className="group"
                        >
                          <Link href={`/products/${product._id}`}>
                            <div className="bg-gray-50 rounded-lg overflow-hidden hover:bg-gray-100 transition-colors">
                              <div className="relative h-24 sm:h-32 overflow-hidden">
                                <img
                                  src={product.images?.[0]?.url ? getOptimizedImageUrl(product.images[0].url) : '/placeholder-product.svg'}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                              </div>
                              <div className="p-2 sm:p-3">
                                <h4 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 truncate group-hover:text-orange-600 transition-colors">
                                  {product.name}
                                </h4>
                                <p className="text-orange-600 font-bold text-xs sm:text-sm">
                                  ${product.price}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <p className="text-gray-500 text-xs sm:text-sm">No products in this category yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="text-center py-8 sm:py-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-gray-500 text-sm sm:text-base md:text-lg mb-3 sm:mb-4">No categories available at the moment.</p>
            <Link 
              href="/categories"
              className="inline-block bg-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-orange-700 transition-colors"
            >
              View All Categories
            </Link>
          </motion.div>
        )}

        <motion.div 
          className="text-center mt-8 sm:mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Link 
            href="/categories"
            className="inline-block border-2 border-orange-600 text-orange-600 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full font-semibold text-sm sm:text-base md:text-lg hover:bg-orange-600 hover:text-white transition-all duration-300"
          >
            View All Categories
          </Link>
        </motion.div>
      </div>
    </section>
  );
} 