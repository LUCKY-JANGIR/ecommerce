"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/store/useStore';
import { categoriesAPI, productsAPI } from '@/components/services/api';

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-800 text-lg">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            Shop by Category
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Explore our curated collection of handcrafted products organized by category
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <div className="relative h-48 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat group-hover:scale-110 transition-transform duration-500"
                        style={category.image ? { backgroundImage: `url(${category.image})` } : {}}
                      >
                        {category.image && (
                          <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300" />
                        )}
                        {!category.image && (
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                            <span className="text-white text-4xl font-bold">
                              {category.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 flex items-end">
                        <div className="p-4 text-white w-full">
                          <h3 className="text-xl font-bold mb-1 group-hover:text-orange-300 transition-colors">
                            {category.name}
                          </h3>
                          <p className="text-sm opacity-90 mb-2 line-clamp-1">
                            {category.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-orange-300 font-semibold text-sm">
                              {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                            </span>
                            <span className="text-white group-hover:text-orange-300 transition-colors text-sm">
                              Explore →
                            </span>
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