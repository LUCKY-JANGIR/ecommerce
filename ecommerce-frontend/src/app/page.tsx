'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  Play,
  Shield,
  Truck,
  RefreshCw
} from 'lucide-react';
import { 
  HeroSkeleton,
  FeaturedProductsSkeleton,
  CategoriesSkeleton,
  ReviewsSkeleton,
  FeaturesSkeleton
} from '@/components/ui/Skeleton';
import { productsAPI, categoriesAPI } from '@/components/services/api';
import { getOptimizedImageUrl } from '@/lib/imageUtils';
import { Product } from '@/store/useStore';

// Dynamic imports for performance
const ProductCard = dynamic(() => import('@/components/ProductCard'), {
  loading: () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className="aspect-square bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
      </div>
    </div>
  ),
  ssr: true
});

const Testimonials = dynamic(() => import('@/components/Home/Testimonials'), {
  loading: () => <div className="py-12 bg-gray-100 animate-pulse" />,
  ssr: true
});

const Footer = dynamic(() => import('@/components/Shared/Footer'), {
  loading: () => <div className="py-12 bg-gray-100 animate-pulse" />,
  ssr: true
});

// Hero slides data
const heroSlides = [
  {
    id: 1,
    image: '/IMG-20250805-WA0008.jpg',
    title: 'Authentic Indian Handlooms',
    subtitle: 'Discover the artistry of traditional craftsmanship',
    description: 'Each piece tells a story of heritage, skill, and passion passed down through generations.',
    cta: 'Explore Collection',
    link: '/products',
    badge: 'New Arrivals'
  },
  {
    id: 2,
    image: '/IMG-20250805-WA0007.jpg',
    title: 'Premium Quality Textiles',
    subtitle: 'From master weavers to your home',
    description: 'Experience the finest materials and exceptional craftsmanship in every thread.',
    cta: 'Shop Premium',
    link: '/products?sortBy=price_desc',
    badge: 'Premium'
  },
  {
    id: 3,
    image: '/IMG-20250805-WA0006.jpg',
    title: 'Sustainable Fashion',
    subtitle: 'Eco-friendly and ethically sourced',
    description: 'Supporting local artisans while caring for our planet with sustainable practices.',
    cta: 'Learn More',
    link: '/products',
    badge: 'Eco-Friendly'
  }
];



// Features data
const features = [
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description: 'Every product is carefully inspected for quality and authenticity'
  },
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Free delivery on orders above $50 with secure packaging'
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30-day hassle-free returns and exchanges for your peace of mind'
  }
];

interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string;
  products?: Product[];
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload hero images
  useEffect(() => {
    const imagePromises = heroSlides.map((slide) => {
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = slide.image;
      });
    });

    Promise.all(imagePromises)
      .then(() => {
        setImagesLoaded(true);
      })
      .catch((error) => {
        console.error('Error preloading images:', error);
        setImagesLoaded(true); // Continue anyway
      });
  }, []);

  // Auto-advance hero slides
  useEffect(() => {
    if (!imagesLoaded) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [imagesLoaded]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured products
        const productsData = await productsAPI.getFeatured();
        if (productsData && Array.isArray(productsData)) {
          // Randomly select 8 products
          const shuffled = [...productsData].sort(() => Math.random() - 0.5);
          setFeaturedProducts(shuffled.slice(0, 8));
        }

        // Fetch categories with products
        const categoriesData = await categoriesAPI.getAll();
        if (categoriesData && Array.isArray(categoriesData)) {
          // First, get all categories with their product counts
          const categoriesWithProducts = await Promise.all(
            categoriesData.map(async (category) => {
              try {
                const productsResponse = await productsAPI.getAll({
                  category: category._id,
                  limit: 10 // Get more products to have options for randomization
                });
                
                // Randomly select 2 products from the available products
                const availableProducts = productsResponse.products || [];
                const shuffledProducts = [...availableProducts].sort(() => Math.random() - 0.5);
                
                return {
                  ...category,
                  products: shuffledProducts.slice(0, 2), // Take only 2 random products
                  totalProducts: availableProducts.length // Keep track of total products
                };
                             } catch {
                 return { ...category, products: [], totalProducts: 0 };
               }
            })
          );
          
          // Filter categories that have at least 2 products, then randomly select 4
          const validCategories = categoriesWithProducts.filter(cat => cat.totalProducts >= 2);
          const shuffledValidCategories = [...validCategories].sort(() => Math.random() - 0.5);
          
          // Take up to 4 categories, or all available if less than 4
          const selectedCategories = shuffledValidCategories.slice(0, Math.min(4, shuffledValidCategories.length));
          
          console.log(`Categories with products: ${categoriesWithProducts.length}, Valid categories (≥2 products): ${validCategories.length}, Selected: ${selectedCategories.length}`);
          setCategories(selectedCategories);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  return (
    <main className="min-h-screen w-full overflow-x-hidden">
      {/* Hero Section */}
      {loading || !imagesLoaded ? (
        <HeroSkeleton />
      ) : (
        <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden bg-gray-900" style={{ transform: 'translateZ(0)' }}>
          {/* Background Images - All loaded but only current one visible */}
          {heroSlides.map((slide, index) => (
            <motion.div
              key={index}
              className="absolute inset-0"
              style={{ willChange: 'opacity, transform' }}
              initial={false}
              animate={{
                opacity: index === currentSlide ? 1 : 0,
                scale: index === currentSlide ? 1 : 1.05,
              }}
              transition={{
                opacity: { duration: 1, ease: [0.4, 0, 0.2, 1] },
                scale: { duration: 8, ease: "linear" }
              }}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
              />
            </motion.div>
          ))}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10" />

        {/* Hero Content */}
        <div className="relative z-20 h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <motion.div
                key={`content-${currentSlide}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.6, 
                  ease: "easeOut",
                  delay: 0.3 
                }}
                className="text-white"
              >
                <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                  <span className="text-sm font-medium">{heroSlides[currentSlide].badge}</span>
                </div>
                
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  {heroSlides[currentSlide].title}
                </h1>
                
                <p className="text-xl md:text-2xl mb-4 text-gray-200">
                  {heroSlides[currentSlide].subtitle}
                </p>
                
                <p className="text-lg mb-8 text-gray-300 max-w-2xl">
                  {heroSlides[currentSlide].description}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href={heroSlides[currentSlide].link}
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-colors group"
                  >
                    {heroSlides[currentSlide].cta}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-gray-900 transition-colors">
                    <Play className="mr-2 h-5 w-5" />
                    Watch Story
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex gap-2 sm:gap-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`hero-dot ${
                  index === currentSlide 
                    ? 'bg-white hero-dot-active' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>


        </section>
      )}



      {/* Featured Products */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked collection of premium handloom products
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="relative aspect-square bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="relative h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>
                    </div>
                    <div className="relative h-4 w-2/3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="relative h-5 w-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>
                      </div>
                      <div className="relative h-8 w-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ProductCard product={product} viewMode="grid" />
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <Link
              href="/products"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors group"
            >
              View All Products
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our diverse collection organized by traditional crafts
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-3xl overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="space-y-2">
                        <div className="relative h-8 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded overflow-hidden">
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>
                        </div>
                        <div className="relative h-4 w-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded overflow-hidden">
                          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>
                        </div>
                      </div>
                      <div className="relative h-12 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-full overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[...Array(2)].map((_, j) => (
                        <div key={j} className="bg-white rounded-2xl overflow-hidden">
                          <div className="relative aspect-square w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 overflow-hidden">
                            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>
                          </div>
                          <div className="p-3 space-y-2">
                            <div className="relative h-3 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded overflow-hidden">
                              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>
                            </div>
                            <div className="relative h-3 w-2/3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded overflow-hidden">
                              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {categories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 rounded-3xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {category.name}
                      </h3>
                      <p className="text-gray-600">{category.description}</p>
                    </div>
                    <Link
                      href={`/products?category=${category._id}`}
                      className="inline-flex items-center px-6 py-3 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-colors group"
                    >
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                                         {category.products?.slice(0, 2).map((product) => (
                      <Link
                        key={product._id}
                        href={`/products/${product._id}`}
                        className="group"
                      >
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <div className="aspect-square relative overflow-hidden">
                            <Image
                              src={product.images?.[0]?.url ? getOptimizedImageUrl(product.images[0].url) : '/placeholder-product.svg'}
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="p-3">
                            <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate group-hover:text-blue-600 transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-blue-600 font-bold text-sm">
                              ₹{product.price}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Platform Reviews Section */}
      <Suspense fallback={<div className="py-12 bg-gray-100 animate-pulse" />}>
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full overflow-hidden"
        >
          <Testimonials />
        </motion.section>
      </Suspense>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                             We&apos;re committed to providing the best shopping experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                  <feature.icon className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Footer */}
      <Suspense fallback={<div className="py-12 bg-gray-100 animate-pulse" />}>
          <Footer />
      </Suspense>
    </main>
  );
}
