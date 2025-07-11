import { motion } from 'framer-motion';

export default function SiteFooter() {
  return (
    <footer className="bg-primary text-white py-12 mt-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
        className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6"
      >
        <div className="text-2xl font-bold">BrandName</div>
        <div className="flex gap-6 text-lg">
          <a href="#" className="hover:text-accent transition-colors">Home</a>
          <a href="#" className="hover:text-accent transition-colors">Products</a>
          <a href="#" className="hover:text-accent transition-colors">About</a>
          <a href="#" className="hover:text-accent transition-colors">Contact</a>
        </div>
        <div className="text-sm text-gray-300">&copy; {new Date().getFullYear()} BrandName. All rights reserved.</div>
      </motion.div>
    </footer>
  );
} 