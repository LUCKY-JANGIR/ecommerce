'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  Play,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  HeroSkeleton
} from '@/components/ui/Skeleton';
import { getResponsiveImageSizes, getBlurPlaceholder } from '@/lib/imageUtils';
import { getImagePreset } from '@/lib/cloudinary';


const Footer = dynamic(() => import('@/components/Shared/Footer'), {
  loading: () => (
    <div className="py-12 bg-dark-bg-primary">
      <div className="container mx-auto px-4">
        <div className="relative h-20 bg-gradient-to-r from-dark-bg-tertiary via-dark-bg-hover to-dark-bg-tertiary rounded overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </div>
      </div>
    </div>
  ),
  ssr: true
});

// Hero slides using images from herosection folder
const heroSlides = [
  {
    id: 1,
    image: '/images/herosection/IMG_9520.JPG',
    title: 'Hastkari',
    subtitle: 'fine handmade carpets since 1989',
    description: 'Where tradition meets timeless beauty. Every thread woven with love, every pattern carrying generations of wisdom.',
    cta: 'Explore Our Collection',
    link: '/products',
    badge: 'Handpicked for You'
  },
  {
    id: 2,
    image: '/images/herosection/IMG_9521.JPG',
    title: 'Master Craftspeople',
    subtitle: 'From skilled artisans to your home',
    description: 'Meet the talented weavers and artisans who bring these beautiful pieces to life. Each product supports local communities.',
    cta: 'Meet Our Artisans',
    link: '/products?featured=true',
    badge: 'Artisan Made'
  },
  {
    id: 3,
    image: '/images/herosection/IMG_9523.JPG',
    title: 'Sustainable & Ethical',
    subtitle: 'Caring for our planet, supporting our people',
    description: 'Eco-friendly materials, fair trade practices, and sustainable production methods. Shop with confidence.',
    cta: 'Learn Our Story',
    link: '/about',
    badge: 'Eco-Conscious'
  }
];

// Modern section images
const modernImages = [
  '/images/Modern/IMG_9510.JPG',
  '/images/Modern/IMG_9511.JPG',
  '/images/Modern/IMG_9512.JPG',
  '/images/Modern/IMG_9513.JPG'
];

// Traditional section images
const traditionalImages = [
  '/images/Treditional/IMG_9504.JPG',
  '/images/Treditional/IMG_9506.JPG',
  '/images/Treditional/IMG_9507.JPG',
  '/images/Treditional/IMG_9508.JPG'
];





export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [modernSlide, setModernSlide] = useState(0);
  const [traditionalSlide, setTraditionalSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload all images
  useEffect(() => {
    const allImages = [
      ...heroSlides.map(slide => slide.image),
      ...modernImages,
      ...traditionalImages
    ];

    const imagePromises = allImages.map((imageSrc) => {
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageSrc;
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




  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      {/* Hero Section */}
      {loading || !imagesLoaded ? (
        <HeroSkeleton />
      ) : (
        <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden bg-dark-bg-primary" style={{ transform: 'translateZ(0)' }}>
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
                src={getImagePreset(slide.image, 'hero')}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
                sizes={getResponsiveImageSizes('hero')}
                quality={95}
                placeholder="blur"
                blurDataURL={getBlurPlaceholder(80, 60)}
              />
            </motion.div>
          ))}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10" />

        {/* Hero Content */}
        <div className="relative z-20 h-full flex items-center">
          <div className="container mx-auto px-4 sm:px-6">
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
                <motion.div 
                  className="inline-block bg-gradient-to-r from-accent-500/20 to-primary-500/20 backdrop-blur-sm rounded-full px-4 py-2 sm:px-6 sm:py-3 mb-6 sm:mb-8 border border-white/20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-xs sm:text-sm font-medium text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent-500 rounded-full animate-pulse"></span>
                    {heroSlides[currentSlide].badge}
                  </span>
                </motion.div>
                
                <motion.h1 
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight font-display"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {heroSlides[currentSlide].title}
                </motion.h1>
                
                <motion.p 
                  className="text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 text-gray-200 font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {heroSlides[currentSlide].subtitle}
                </motion.p>
                
                <motion.p 
                  className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 text-gray-300 max-w-2xl leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {heroSlides[currentSlide].description}
                </motion.p>
                
                <motion.div 
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Link
                    href={heroSlides[currentSlide].link}
                    className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-full font-semibold hover:from-accent-600 hover:to-accent-700 transition-all duration-300 group shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                  >
                    {heroSlides[currentSlide].cta}
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <button className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 border-2 border-white/80 text-white rounded-full font-semibold hover:bg-white/10 hover:border-white transition-all duration-300 backdrop-blur-sm text-sm sm:text-base">
                    <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Our Story
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex gap-2 sm:gap-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentSlide 
                    ? 'bg-white w-3 sm:w-4' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>


        </section>
      )}



      {/* Modern Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-dark-bg-primary">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6 sm:space-y-8"
            >
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-dark-text-primary mb-4 sm:mb-6 underline decoration-accent-500 decoration-2 sm:decoration-4 underline-offset-4 sm:underline-offset-8">
                  MODERN
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-dark-text-secondary leading-relaxed mb-4 sm:mb-6">
                  Our modern carpets bring a fresh and stylish touch to every space.
                  Bold patterns and clean lines create a statement of contemporary elegance.
                  A blend of minimalism and vibrant design for today's lifestyle.
                  Crafted with creativity, geometry, and artistic expression.
                  Perfect to transform your home into a modern masterpiece.
                </p>
                <Link
                  href="/products?category=modern"
                  className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-dark-bg-primary transition-all duration-300 group text-sm sm:text-base"
                >
                  EXPLORE THE COLLECTION
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Right Image Slider */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-dark-bg-secondary">
                {modernImages.map((image, index) => (
                  <motion.div
                    key={index}
                    className="absolute inset-0"
                    initial={false}
                    animate={{
                      opacity: index === modernSlide ? 1 : 0,
                      scale: index === modernSlide ? 1 : 1.05,
                    }}
                    transition={{
                      opacity: { duration: 0.8 },
                      scale: { duration: 8, ease: "linear" }
                    }}
                  >
                    <Image
                      src={getImagePreset(image, 'gallery')}
                      alt={`Modern carpet ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      quality={95}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={() => setModernSlide((prev) => (prev - 1 + modernImages.length) % modernImages.length)}
                className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={() => setModernSlide((prev) => (prev + 1) % modernImages.length)}
                className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-colors"
              >
                <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Traditional Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-dark-bg-secondary">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left Image Slider */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-2xl sm:rounded-3xl overflow-hidden bg-dark-bg-primary">
                {traditionalImages.map((image, index) => (
                  <motion.div
                    key={index}
                    className="absolute inset-0"
                    initial={false}
                    animate={{
                      opacity: index === traditionalSlide ? 1 : 0,
                      scale: index === traditionalSlide ? 1 : 1.05,
                    }}
                    transition={{
                      opacity: { duration: 0.8 },
                      scale: { duration: 8, ease: "linear" }
                    }}
                  >
                    <Image
                      src={getImagePreset(image, 'gallery')}
                      alt={`Traditional carpet ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      quality={95}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={() => setTraditionalSlide((prev) => (prev - 1 + traditionalImages.length) % traditionalImages.length)}
                className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={() => setTraditionalSlide((prev) => (prev + 1) % traditionalImages.length)}
                className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-colors"
              >
                <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
              </button>
            </motion.div>

            {/* Right Content */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6 sm:space-y-8"
            >
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-dark-text-primary mb-4 sm:mb-6 underline decoration-accent-500 decoration-2 sm:decoration-4 underline-offset-4 sm:underline-offset-8">
                  TRADITIONAL
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-dark-text-secondary leading-relaxed mb-4 sm:mb-6">
                  Inspired by timeless heritage, our carpets weave stories of tradition and art.
                  Each piece is handcrafted with intricate motifs and classic patterns.
                  Rich colors and textures reflect the soul of Indian craftsmanship.
                  Every thread carries a legacy of beauty, culture, and skill.
                  A masterpiece to bring warmth, elegance, and grace to your space.
                </p>
                <Link
                  href="/products?category=traditional"
                  className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-dark-bg-secondary transition-all duration-300 group text-sm sm:text-base"
                >
                  EXPLORE THE COLLECTION
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>




      {/* Footer */}
      <Suspense fallback={<div className="py-12 bg-dark-bg-secondary animate-pulse" />}>
          <Footer />
      </Suspense>
    </div>
  );
}
