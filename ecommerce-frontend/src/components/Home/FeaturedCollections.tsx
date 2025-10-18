'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Card, { CardContent, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Button from '@/components/ui/button';

interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
  href: string;
  productCount: number;
}

interface FeaturedCollectionsProps {
  collections?: Collection[];
  title?: string;
  subtitle?: string;
}

const defaultCollections: Collection[] = [
  {
    id: '1',
    name: 'Artisan Jewelry',
    description: 'Handcrafted pieces that tell stories of tradition and beauty',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    href: '/categories/jewelry',
    productCount: 24
  },
  {
    id: '2',
    name: 'Textile Treasures',
    description: 'Luxurious fabrics and handwoven wonders from master weavers',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    href: '/categories/textiles',
    productCount: 18
  },
  {
    id: '3',
    name: 'Home Decor',
    description: 'Elegant pieces that transform your space with cultural richness',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    href: '/categories/decor',
    productCount: 32
  },
  {
    id: '4',
    name: 'Ceramic Artistry',
    description: 'Unique pottery and ceramics crafted with ancient techniques',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    href: '/categories/ceramics',
    productCount: 15
  }
];

export default function FeaturedCollections({
  collections = defaultCollections,
  title = "Featured Collections",
  subtitle = "Discover our carefully curated collections, each representing the finest craftsmanship from India&apos;s artisan communities."
}: FeaturedCollectionsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section className="py-24 bg-background-cream">
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

        {/* Collections Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {collections.map((collection) => (
            <motion.div
              key={collection.id}
              variants={itemVariants}
              className="group"
            >
              <Link href={collection.href}>
                <Card className="h-full cursor-pointer">
                  <div className="relative overflow-hidden rounded-t-2xl">
                    <div className="aspect-square relative">
                      <img
                        src={collection.image}
                        alt={collection.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    
                    {/* Quick View Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button
                        variant="accent"
                        size="sm"
                        className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                      >
                        Quick View
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <CardTitle className="text-xl mb-2 group-hover:text-accent-600 transition-colors">
                      {collection.name}
                    </CardTitle>
                    <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                      {collection.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-muted">
                        {collection.productCount} items
                      </span>
                      <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center group-hover:bg-accent-200 transition-colors">
                        <svg
                          className="w-4 h-4 text-accent-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link href="/categories">
            <Button variant="outline" size="lg" className="border-primary-500 text-primary-700 hover:bg-primary-50">
              View All Collections
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
} 