'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/button';

interface NewsletterCTAProps {
  title?: string;
  subtitle?: string;
  placeholder?: string;
  buttonText?: string;
  onSubmit?: (email: string) => void;
}

export default function NewsletterCTA({
  title = "Stay Connected",
  subtitle = "Be the first to discover new collections, artisan stories, and exclusive offers. Join our community of heritage enthusiasts.",
  placeholder = "Enter your email address",
  buttonText = "Subscribe",
  onSubmit
}: NewsletterCTAProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      if (onSubmit) {
        await onSubmit(email);
      } else {
        // Default behavior - simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setIsSubmitted(true);
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-10" />
      
      {/* Floating Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-10 sm:top-20 right-10 sm:right-20 hidden lg:block"
      >
        <div className="w-20 h-20 sm:w-32 sm:h-32 bg-accent-500/20 rounded-full animate-float" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.7 }}
        className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 hidden lg:block"
      >
        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-heritage-500/20 rounded-full animate-float" style={{ animationDelay: '1s' }} />
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Decorative Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-6 sm:mb-8"
          >
            <div className="w-16 sm:w-24 h-1 bg-accent-500 rounded-full" />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif font-bold text-white leading-tight"
          >
            {title}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl text-heritage-100 leading-relaxed max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>

          {/* Newsletter Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="max-w-sm sm:max-w-md mx-auto"
          >
            {mounted && !isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={placeholder}
                    required
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base md:text-lg bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl sm:rounded-2xl text-white placeholder-heritage-200 focus:outline-none focus:border-accent-500 focus:bg-white/20 transition-all duration-300"
                    suppressHydrationWarning
                  />
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-accent-500/20 to-accent-600/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
                
                <Button
                  type="submit"
                  size="lg"
                  variant="accent"
                  loading={isSubmitting}
                  disabled={!email || isSubmitting}
                  className="w-full text-sm sm:text-base md:text-lg font-semibold"
                >
                  {isSubmitting ? 'Subscribing...' : buttonText}
                </Button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6"
              >
                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-accent-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white font-semibold text-sm sm:text-base md:text-lg">
                    Thank you for subscribing!
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-heritage-200 text-xs sm:text-sm"
          >
            <p>Join 10,000+ heritage enthusiasts worldwide</p>
            <p className="mt-1 sm:mt-2">We respect your privacy. Unsubscribe at any time.</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 