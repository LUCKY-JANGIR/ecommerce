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
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
              const productsData = await productsAPI.getByCategory(category._id);
              return {
                ...category,
                products: productsData.products || []
              };
            } catch (error) {
              return {
                ...category,
                products: []
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

        {/* Categories Grid */}
        {/* Modernize category cards with new color palette, border, and scroll-based reveal animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
          {categories.map((category, index) => (
            <Link
              key={category._id}
              href={`/category/${encodeURIComponent(category.name)}`}
              className="group"
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="relative rounded-2xl overflow-hidden border border-accent hover:border-primary transition-all duration-300 min-h-[220px] flex items-end bg-card cursor-pointer shadow-lg group-hover:shadow-2xl"
                style={category.image ? { backgroundImage: `url(${category.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >
                {category.image && (
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all" />
                )}
                <div className="relative w-full p-6 z-10">
                  <div className="text-center mb-4">
                    {!category.image && (
                      <div className="w-16 h-16 bg-primary/20 rounded-lg mx-auto mb-3 flex items-center justify-center">
                        <span className="text-primary text-2xl font-bold">
                          {category.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <h3 className="text-2xl font-serif font-bold text-primary mb-2 drop-shadow-lg">{category.name}</h3>
                    {category.description && (
                      <p className="text-muted text-sm mb-4 drop-shadow-lg">{category.description}</p>
                    )}
                    <p className="text-accent font-semibold drop-shadow-lg">
                      {category.products.length} {category.products.length === 1 ? 'product' : 'products'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Products Preview */}
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-16"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                {categories.find(cat => cat._id === selectedCategory)?.name} Products
              </h2>
              <p className="text-gray-400">
                Preview of products in this category
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories
                .find(cat => cat._id === selectedCategory)
                ?.products.slice(0, 8)
                .map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
            </div>
            
            {categories.find(cat => cat._id === selectedCategory)?.products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No products found in this category yet.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
} 