'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

const heroSlides = [
  {
    id: 1,
    image: '/IMG-20250805-WA0008.jpg',
    title: 'Discover Authentic Indian Handlooms',
    subtitle: 'Handcrafted with love and tradition',
    cta: 'Shop Now',
    link: '/products'
  },
  {
    id: 2,
    image: '/IMG-20250805-WA0007.jpg',
    title: 'Premium Quality Textiles',
    subtitle: 'From traditional weavers to your home',
    cta: 'Explore Collection',
    link: '/categories'
  },
  {
    id: 3,
    image: '/IMG-20250805-WA0006.jpg',
    title: 'Sustainable Fashion',
    subtitle: 'Eco-friendly and ethically sourced',
    cta: 'Learn More',
    link: '/about'
  },
  {
    id: 4,
    image: '/IMG-20250805-WA0005.jpg',
    title: 'Exclusive Designs',
    subtitle: 'Unique patterns and contemporary styles',
    cta: 'View Gallery',
    link: '/products'
  }
];

export default function HeroSection() {
  return (
    <section className="relative h-screen min-h-[500px] max-h-[100vh] overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        effect="fade"
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        loop={true}
        className="h-full"
      >
        {heroSlides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              
              {/* Content */}
              <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
                <div className="text-center text-white max-w-4xl mx-auto">
                  <motion.h1 
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 font-playfair leading-tight"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p 
                    className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-6 sm:mb-8 font-light leading-relaxed"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    {slide.subtitle}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    <Link 
                      href={slide.link}
                      className="inline-block bg-white text-black px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full font-semibold text-sm sm:text-base md:text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                    >
                      {slide.cta}
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
        
        {/* Custom Navigation Buttons */}
        <div className="swiper-button-prev absolute left-2 sm:left-4 md:left-8 z-20 text-white hover:text-gray-300 transition-colors"></div>
        <div className="swiper-button-next absolute right-2 sm:right-4 md:right-8 z-20 text-white hover:text-gray-300 transition-colors"></div>
      </Swiper>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex flex-col items-center text-white">
          <span className="text-xs sm:text-sm mb-2">Scroll Down</span>
          <div className="w-4 h-8 sm:w-6 sm:h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-2 sm:h-3 bg-white rounded-full mt-1 sm:mt-2 animate-bounce"></div>
          </div>
        </div>
      </div>
    </section>
  );
} 