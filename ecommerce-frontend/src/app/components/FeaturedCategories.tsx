import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { categoriesAPI } from '@/components/services/api';

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<{ name: string }[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800">Shop by Category</h2>
        <p className="text-gray-700 max-w-2xl mx-auto">Explore our top categories and discover something new every day.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.08, boxShadow: '0 8px 32px rgba(99,102,241,0.15)' }}
            className={`rounded-xl p-6 text-center cursor-pointer shadow-lg hover:shadow-2xl transition-all bg-primary text-background`}
          >
            <Link href={`/category/${encodeURIComponent(cat.name)}`} className="block">
              <span className="text-xl font-semibold">{cat.name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
} 