'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const brandImages = [
  {
    id: 1,
    src: '/img1.jpg',
    alt: 'Traditional Weaving',
    title: 'Traditional Weaving',
    description: 'Preserving age-old techniques'
  },
  {
    id: 2,
    src: '/img2.jpg',
    alt: 'Handloom Products',
    title: 'Handloom Products',
    description: 'Authentic craftsmanship'
  },
  {
    id: 3,
    src: '/img3.jpg',
    alt: 'Artisan Craftsmanship',
    title: 'Artisan Craftsmanship',
    description: 'Skilled hands at work'
  }
];

export default function BrandStory() {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="space-y-3 sm:space-y-4">
              <motion.h2 
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 font-playfair leading-tight"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Our Story
              </motion.h2>
              <motion.div 
                className="w-16 sm:w-20 h-1 bg-orange-500 rounded-full"
                initial={{ opacity: 0, scaleX: 0 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              />
            </div>

            <motion.div 
              className="space-y-4 sm:space-y-6 text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <p>
                Founded with a deep passion for preserving India&apos;s rich textile heritage, 
                our journey began in the heart of traditional weaving communities. We believe 
                that every thread tells a story, every pattern carries a legacy, and every 
                piece of fabric connects us to our cultural roots.
              </p>
              
              <p>
                Our mission is to bridge the gap between traditional craftsmanship and 
                modern lifestyle, bringing you authentic handloom products that are not 
                just beautiful but also sustainable and ethically produced. We work directly 
                with skilled artisans, ensuring fair wages and preserving age-old techniques.
              </p>
              
              <p>
                From the vibrant colors of Rajasthan to the intricate weaves of Varanasi, 
                from the soft cottons of Bengal to the luxurious silks of Karnataka, 
                we curate the finest handloom products that celebrate India&apos;s diverse 
                textile traditions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <Link 
                href="/about"
                className="inline-block bg-orange-600 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full font-semibold text-sm sm:text-base md:text-lg hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 text-center"
              >
                Learn More About Us
              </Link>
              <Link 
                href="/products"
                className="inline-block border-2 border-orange-600 text-orange-600 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full font-semibold text-sm sm:text-base md:text-lg hover:bg-orange-600 hover:text-white transition-all duration-300 text-center"
              >
                Explore Our Collection
              </Link>
            </motion.div>
          </motion.div>

          {/* Image Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-first lg:order-last"
          >
            <Swiper
              modules={[Navigation, Pagination, Autoplay, EffectFade]}
              effect="fade"
              spaceBetween={0}
              slidesPerView={1}
              navigation={{
                nextEl: '.brand-story-swiper-next',
                prevEl: '.brand-story-swiper-prev',
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
              }}
              loop={true}
              className="brand-story-swiper rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl"
            >
              {brandImages.map((image) => (
                <SwiperSlide key={image.id}>
                  <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px]">
                    <img 
                      src={image.src} 
                      alt={image.alt} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 text-white">
                      <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{image.title}</h3>
                      <p className="text-xs sm:text-sm opacity-90">{image.description}</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Custom Navigation Buttons */}
            <div className="brand-story-swiper-prev absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white bg-opacity-80 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <div className="brand-story-swiper-next absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white bg-opacity-80 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-white transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center"
        >
          <div className="space-y-1 sm:space-y-2">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600">500+</div>
            <div className="text-xs sm:text-sm md:text-base text-gray-600">Artisans Supported</div>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600">50+</div>
            <div className="text-xs sm:text-sm md:text-base text-gray-600">Villages Connected</div>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600">1000+</div>
            <div className="text-xs sm:text-sm md:text-base text-gray-600">Products Created</div>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600">10+</div>
            <div className="text-xs sm:text-sm md:text-base text-gray-600">Years of Heritage</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 