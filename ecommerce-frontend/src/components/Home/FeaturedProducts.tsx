'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { productsAPI } from '@/components/services/api';
import { getOptimizedImageUrl } from '@/lib/imageUtils';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Product {
  _id: string;
  name: string;
  price: number;
  images?: Array<{ url: string; alt?: string }>;
  category?: { name: string };
  isFeatured?: boolean;
}

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const data = await productsAPI.getFeatured();
        if (data && Array.isArray(data)) {
          setFeaturedProducts(data);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">Featured Products</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">Discover our handpicked collection</p>
          </div>
          <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-64 sm:w-80 bg-gray-200 rounded-lg animate-pulse">
                <div className="h-48 sm:h-64 bg-gray-300 rounded-t-lg"></div>
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="h-3 sm:h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 sm:h-6 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-4">Featured Products</h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">Discover our handpicked collection of finest handloom products</p>
        </motion.div>

        {featuredProducts.length > 0 ? (
          <div className="relative">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={16}
              slidesPerView={1}
              navigation={{
                nextEl: '.featured-swiper-next',
                prevEl: '.featured-swiper-prev',
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                480: {
                  slidesPerView: 1,
                  spaceBetween: 16,
                },
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 24,
                },
              }}
              className="featured-products-swiper"
            >
              {featuredProducts.map((product, index) => (
                <SwiperSlide key={product._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    <Link href={`/products/${product._id}`}>
                      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
                        <div className="relative h-48 sm:h-64 overflow-hidden">
                          <img
                            src={product.images?.[0]?.url ? getOptimizedImageUrl(product.images[0].url) : '/placeholder-product.svg'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200"></div>
                          <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                            <div className="bg-orange-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                              Featured
                            </div>
                          </div>
                        </div>
                        <div className="p-3 sm:p-4 md:p-6">
                          <h3 className="text-sm sm:text-base md:text-xl font-semibold text-gray-900 mb-1 sm:mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                          {product.category && (
                            <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">{product.category.name}</p>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">
                              {product.price === 0 ? 'Negotiable' : `$${product.price}`}
                            </span>
                            <div className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
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
            <div className="featured-swiper-prev absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <div className="featured-swiper-next absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ) : (
          <motion.div 
            className="text-center py-8 sm:py-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-gray-500 text-sm sm:text-base md:text-lg mb-3 sm:mb-4">No featured products available at the moment.</p>
            <Link 
              href="/products"
              className="inline-block bg-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-orange-700 transition-colors"
            >
              View All Products
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
            href="/products"
            className="inline-block border-2 border-orange-600 text-orange-600 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full font-semibold text-sm sm:text-base md:text-lg hover:bg-orange-600 hover:text-white transition-all duration-300"
          >
            View All Products
          </Link>
        </motion.div>
      </div>
    </section>
  );
} 