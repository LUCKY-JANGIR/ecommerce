import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { categoriesAPI } from '@/components/services/api';
import { FiArrowRight } from 'react-icons/fi';

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<{ name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const data = await categoriesAPI.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback categories if API fails
        setCategories([
          { name: 'Jewelry' },
          { name: 'Textiles' },
          { name: 'Home Decor' },
          { name: 'Accessories' },
          { name: 'Pottery' },
          { name: 'Art' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        type: "spring" as const, 
        stiffness: 100, 
        damping: 15 
      } 
    }
  };

  // Generate a gradient based on index
  const getGradient = (index: number) => {
    const gradients = [
      'bg-gradient-to-br from-primary to-primary-dark',
      'bg-gradient-to-br from-accent to-accent-dark',
      'bg-gradient-to-br from-primary-dark to-accent',
      'bg-gradient-to-br from-accent-dark to-primary',
      'bg-gradient-to-br from-primary to-accent-dark',
      'bg-gradient-to-br from-accent to-primary-dark',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <section className="py-24 px-6 bg-background-light">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-accent/10 text-accent text-sm font-medium tracking-wide mb-4">Curated Collections</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Shop by Category</h2>
          <div className="w-16 h-1 bg-accent rounded-full mx-auto mb-6"></div>
          <p className="text-secondary max-w-2xl mx-auto text-lg">Explore our handpicked categories and discover unique treasures crafted with passion and precision.</p>
        </motion.div>

        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl p-6 h-32 animate-pulse bg-gray-200"></div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                  y: -5
                }}
                className={`rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${getGradient(i)} text-white group`}
              >
                <Link href={`/category/${encodeURIComponent(cat.name)}`} className="block p-6 h-full">
                  <div className="flex flex-col h-full justify-between">
                    <span className="text-xl font-bold mb-2">{cat.name}</span>
                    <div className="flex items-center justify-between mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-sm">Explore</span>
                      <FiArrowRight className="transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link 
            href="/categories" 
            className="inline-flex items-center gap-2 text-accent hover:text-accent-dark font-medium transition-colors"
          >
            View All Categories
            <FiArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}