'use client';

import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamic imports for better performance
const HeroSection = dynamic(() => import('@/components/Home/HeroSection'), {
  loading: () => <div className="h-screen bg-background-cream animate-pulse" />,
  ssr: true
});

const FeaturedCollections = dynamic(() => import('@/components/Home/FeaturedCollections'), {
  loading: () => <div className="py-24 bg-background-cream animate-pulse" />,
  ssr: true
});

const AboutSection = dynamic(() => import('@/components/Home/AboutSection'), {
  loading: () => <div className="py-24 bg-background-cream animate-pulse" />,
  ssr: true
});

const Testimonials = dynamic(() => import('@/components/Home/Testimonials'), {
  loading: () => <div className="py-24 bg-background-cream animate-pulse" />,
  ssr: true
});

const NewsletterCTA = dynamic(() => import('@/components/Home/NewsletterCTA'), {
  loading: () => <div className="py-24 bg-background-cream animate-pulse" />,
  ssr: true
});

const Footer = dynamic(() => import('@/components/Shared/Footer'), {
  loading: () => <div className="py-12 bg-background-cream animate-pulse" />,
  ssr: true
});

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Suspense fallback={<div className="h-screen bg-background-cream animate-pulse" />}>
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <HeroSection />
        </motion.section>
      </Suspense>

      {/* Featured Collections */}
      <Suspense fallback={<div className="py-24 bg-background-cream animate-pulse" />}>
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <FeaturedCollections />
        </motion.section>
      </Suspense>

      {/* About/Brand Story Section */}
      <Suspense fallback={<div className="py-24 bg-background-cream animate-pulse" />}>
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <AboutSection />
        </motion.section>
      </Suspense>

      {/* Testimonials Section */}
      <Suspense fallback={<div className="py-24 bg-background-cream animate-pulse" />}>
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Testimonials />
        </motion.section>
      </Suspense>

      {/* Newsletter CTA Section */}
      <Suspense fallback={<div className="py-24 bg-background-cream animate-pulse" />}>
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <NewsletterCTA />
        </motion.section>
      </Suspense>

      {/* Footer */}
      <Suspense fallback={<div className="py-12 bg-background-cream animate-pulse" />}>
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Footer />
        </motion.section>
      </Suspense>
    </main>
  );
}
