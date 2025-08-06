'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamic imports for better performance
const HeroSection = dynamic(() => import('@/components/Home/HeroSection'), {
  loading: () => <div className="h-screen bg-gray-100 animate-pulse" />,
  ssr: true
});

const BrandStory = dynamic(() => import('@/components/Home/BrandStory'), {
  loading: () => <div className="py-20 bg-gray-100 animate-pulse" />,
  ssr: true
});

const FeaturedProducts = dynamic(() => import('@/components/Home/FeaturedProducts'), {
  loading: () => <div className="py-20 bg-gray-100 animate-pulse" />,
  ssr: true
});

const CategoriesSection = dynamic(() => import('@/components/Home/CategoriesSection'), {
  loading: () => <div className="py-20 bg-gray-100 animate-pulse" />,
  ssr: true
});

const Testimonials = dynamic(() => import('@/components/Home/Testimonials'), {
  loading: () => <div className="py-20 bg-gray-100 animate-pulse" />,
  ssr: true
});

const NewsletterCTA = dynamic(() => import('@/components/Home/NewsletterCTA'), {
  loading: () => <div className="py-20 bg-gray-100 animate-pulse" />,
  ssr: true
});

const Footer = dynamic(() => import('@/components/Shared/Footer'), {
  loading: () => <div className="py-12 bg-gray-100 animate-pulse" />,
  ssr: true
});

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section with Swiper Carousel */}
      <Suspense fallback={<div className="h-screen bg-gray-100 animate-pulse" />}>
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <HeroSection />
        </motion.section>
      </Suspense>

      {/* Brand Story Section */}
      <Suspense fallback={<div className="py-20 bg-gray-100 animate-pulse" />}>
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <BrandStory />
        </motion.section>
      </Suspense>

      {/* Featured Products Section */}
      <Suspense fallback={<div className="py-20 bg-gray-100 animate-pulse" />}>
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <FeaturedProducts />
        </motion.section>
      </Suspense>

      {/* Categories Section */}
      <Suspense fallback={<div className="py-20 bg-gray-100 animate-pulse" />}>
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <CategoriesSection />
        </motion.section>
      </Suspense>

      {/* Testimonials Section */}
      <Suspense fallback={<div className="py-20 bg-gray-100 animate-pulse" />}>
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Testimonials />
        </motion.section>
      </Suspense>

      {/* Newsletter CTA Section */}
      <Suspense fallback={<div className="py-20 bg-gray-100 animate-pulse" />}>
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <NewsletterCTA />
        </motion.section>
      </Suspense>

      {/* Footer */}
      <Suspense fallback={<div className="py-12 bg-gray-100 animate-pulse" />}>
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Footer />
        </motion.section>
      </Suspense>
    </main>
  );
}
