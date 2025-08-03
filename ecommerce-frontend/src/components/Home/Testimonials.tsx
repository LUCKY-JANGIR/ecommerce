'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  title: string;
  rating: number;
  avatar?: string;
  location?: string;
}

interface TestimonialsProps {
  testimonials?: Testimonial[];
  title?: string;
  subtitle?: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    quote: "The quality of craftsmanship is absolutely breathtaking. Each piece tells a story and brings such warmth to our home. I'm in love with my handwoven textiles!",
    name: "Priya Sharma",
    title: "Interior Designer",
    rating: 5,
    location: "Mumbai, India"
  },
  {
    id: '2',
    quote: "I've been collecting Indian handloom for years, and this is by far the most authentic and beautifully curated collection I've found. The attention to detail is remarkable.",
    name: "Sarah Johnson",
    title: "Art Collector",
    rating: 5,
    location: "New York, USA"
  },
  {
    id: '3',
    quote: "The jewelry pieces are stunning - they're not just accessories, they're works of art. I receive compliments every time I wear them. The heritage gold work is exceptional.",
    name: "Aisha Patel",
    title: "Fashion Blogger",
    rating: 5,
    location: "London, UK"
  },
  {
    id: '4',
    quote: "As someone who values sustainable and ethical fashion, I appreciate how this brand supports artisan communities. The quality and authenticity are unmatched.",
    name: "Michael Chen",
    title: "Sustainability Advocate",
    rating: 5,
    location: "San Francisco, USA"
  }
];

export default function Testimonials({
  testimonials = defaultTestimonials,
  title = "What Our Customers Say",
  subtitle = "Discover why discerning customers choose Indian Handloom for their most treasured pieces."
}: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-accent-500' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section className="py-24 bg-heritage-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-1 bg-accent-500 rounded-full" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-700 mb-6">
            {title}
          </h2>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-text-secondary leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <Card variant="testimonial" className="text-center p-8 md:p-12">
                <CardContent className="space-y-6">
                  {/* Quote Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-accent-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                  </div>

                  {/* Quote */}
                  <blockquote className="text-xl md:text-2xl lg:text-3xl font-serif text-primary-700 leading-relaxed mb-8">
                    "{testimonials[currentIndex].quote}"
                  </blockquote>

                  {/* Rating */}
                  <div className="flex justify-center mb-6">
                    <div className="flex gap-1">
                      {renderStars(testimonials[currentIndex].rating)}
                    </div>
                  </div>

                  {/* Author */}
                  <div className="space-y-2">
                    <div className="font-semibold text-lg text-primary-700">
                      {testimonials[currentIndex].name}
                    </div>
                    <div className="text-text-secondary">
                      {testimonials[currentIndex].title}
                    </div>
                    {testimonials[currentIndex].location && (
                      <div className="text-sm text-text-muted">
                        {testimonials[currentIndex].location}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-accent-500 scale-125'
                    : 'bg-heritage-300 hover:bg-heritage-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
            aria-label="Previous testimonial"
          >
            <svg className="w-6 h-6 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % testimonials.length)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
            aria-label="Next testimonial"
          >
            <svg className="w-6 h-6 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {[
            { label: "Authentic Craftsmanship", value: "100%" },
            { label: "Artisan Support", value: "500+" },
            { label: "Customer Satisfaction", value: "98%" },
            { label: "Years of Heritage", value: "200+" }
          ].map((stat, index) => (
            <div key={stat.label} className="space-y-2">
              <div className="text-2xl md:text-3xl font-serif font-bold text-accent-600">
                {stat.value}
              </div>
              <div className="text-sm text-text-muted">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 