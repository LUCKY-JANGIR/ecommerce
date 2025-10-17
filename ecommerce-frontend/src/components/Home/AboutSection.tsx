'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/button';
import Link from 'next/link';

interface AboutSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  stats?: Array<{ label: string; value: string }>;
  ctaText?: string;
  ctaLink?: string;
}

export default function AboutSection({
  title = "Our Heritage, Your Legacy",
  subtitle = "A Journey Through Time",
  description = "For generations, Indian artisans have preserved the ancient traditions of handloom weaving, creating masterpieces that transcend time. Our brand was born from a deep reverence for these craftsmen and a vision to bring their extraordinary work to the modern world. Every piece in our collection tells a story of dedication, skill, and cultural heritage that spans centuries.",
  image = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  stats = [
    { label: "Artisan Families", value: "500+" },
    { label: "Years of Tradition", value: "200+" },
    { label: "Unique Pieces", value: "10,000+" },
    { label: "States Covered", value: "15" }
  ],
  ctaText = "Learn More",
  ctaLink = "/about"
}: AboutSectionProps) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-3xl">
              <img
                src={image}
                alt="Indian Handloom Heritage"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
            
            {/* Floating Decorative Element */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="absolute -top-6 -right-6 w-24 h-24 bg-accent-500/20 rounded-full animate-float"
            />
          </motion.div>

          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Decorative Element */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-1 bg-accent-500 rounded-full" />
              <span className="text-accent-600 font-medium text-sm uppercase tracking-wider">
                {subtitle}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-700 leading-tight">
              {title}
            </h2>

            {/* Description */}
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
              {description}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6 py-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-serif font-bold text-accent-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-text-muted uppercase tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link href={ctaLink}>
                <Button size="lg" variant="outline" className="border-primary-500 text-primary-700 hover:bg-primary-50">
                  {ctaText}
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
} 