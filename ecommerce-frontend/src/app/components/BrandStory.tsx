import { motion } from 'framer-motion';

const stats = [
  { label: 'Happy Customers', value: '10K+' },
  { label: 'Products', value: '500+' },
  { label: '24/7 Support', value: 'Yes' },
  { label: 'Categories', value: '50+' },
];

export default function BrandStory() {
  return (
    <section className="py-16 bg-neutral">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Why Shop With Us?</h2>
        <p className="text-gray-700 max-w-2xl mx-auto">We're not just another store. We're a community of passionate shoppers and brands, bringing you the best products, service, and experience. Our mission: make shopping inspiring, easy, and fun.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-8 text-center"
          >
            <div className="text-3xl md:text-4xl font-extrabold text-yellow-600 mb-2">{stat.value}</div>
            <div className="text-lg text-gray-800 font-semibold">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
} 