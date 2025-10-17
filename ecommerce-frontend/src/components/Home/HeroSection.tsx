'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const heroSlides = [
  {
    id: 1,
    image: '/img1.jpg',
    title: 'Discover Authentic Indian Handlooms',
    subtitle: 'Handcrafted with love and tradition',
    cta: 'Shop Now',
    link: '/products'
  },
  {
    id: 2,
    image: '/img2.jpg',
    title: 'Premium Quality Textiles',
    subtitle: 'From traditional weavers to your home',
    cta: 'Explore Collection',
    link: '/categories'
  },
  {
    id: 3,
    image: '/img3.jpg',
    title: 'Sustainable Fashion',
    subtitle: 'Eco-friendly and ethically sourced',
    cta: 'Learn More',
    link: '/about'
  }
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen min-h-[500px] max-h-[100vh] overflow-hidden">
      {heroSlides.map((slide, index) => (
        <motion.div
          key={slide.id}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${slide.image})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: index === currentSlide ? 1 : 0 }}
          transition={{ duration: 1 }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          
          {/* Content */}
          <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
            <div className="text-center text-white max-w-4xl mx-auto">
              <motion.h1 
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 font-playfair leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: index === currentSlide ? 1 : 0, y: index === currentSlide ? 0 : 30 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {slide.title}
              </motion.h1>
              <motion.p 
                className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-6 sm:mb-8 font-light leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: index === currentSlide ? 1 : 0, y: index === currentSlide ? 0 : 30 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {slide.subtitle}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: index === currentSlide ? 1 : 0, y: index === currentSlide ? 0 : 30 }}
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
        </motion.div>
      ))}

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-1 sm:space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-20">
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