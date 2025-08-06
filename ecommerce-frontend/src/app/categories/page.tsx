"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/store/useStore';
import { categoriesAPI, productsAPI } from '@/components/services/api';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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

        {/* Category Showcase Carousel */}
        {categories.length > 0 && (
          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              navigation={{
                nextEl: '.category-showcase-next',
                prevEl: '.category-showcase-prev',
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 24,
                },
              }}
              className="category-showcase-swiper"
            >
              {categories.slice(0, 6).map((category, index) => (
                <SwiperSlide key={category._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="group cursor-pointer"
                  >
                    <Link href={`/category/${encodeURIComponent(category.name)}`}>
                      <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <div 
                          className="absolute inset-0 bg-cover bg-center bg-no-repeat group-hover:scale-110 transition-transform duration-500"
                          style={category.image ? { backgroundImage: `url(${category.image})` } : {}}
                        >
                          {category.image && (
                            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300" />
                          )}
                          {!category.image && (
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                              <span className="text-white text-6xl font-bold">
                                {category.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-0 flex items-end">
                          <div className="p-6 text-white w-full">
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-orange-300 transition-colors">
                              {category.name}
                            </h3>
                            <p className="text-sm opacity-90 mb-3 line-clamp-2">
                              {category.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-orange-300 font-semibold">
                                {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                              </span>
                              <span className="text-white group-hover:text-orange-300 transition-colors">
                                Explore →
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Custom Navigation Buttons */}
            <div className="category-showcase-prev absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <div className="category-showcase-next absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.div>
        )}

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
                className="relative rounded-2xl overflow-hidden border border-accent hover:border-primary transition-all duration-300 cursor-pointer shadow-lg group-hover:shadow-2xl bg-card"
              >
                {/* Image Section */}
                <div 
                  className="relative h-48 md:h-56 overflow-hidden"
                  style={category.image ? { backgroundImage: `url(${category.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  {category.image && (
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                  )}
                  {!category.image && (
                    <div className="w-full h-full bg-gradient-to-br from-accent-100 to-accent-200 flex items-center justify-center">
                      <span className="text-accent-600 text-4xl font-bold">
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Content Section - Below the image */}
                <div className="p-6">
                  <div className="text-center">
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-primary mb-2 group-hover:text-accent-600 transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-muted text-sm mb-3 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    <p className="text-accent font-semibold text-sm">
                      {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
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