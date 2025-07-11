import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-primary to-accent text-white overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg">BrandName</h1>
        <p className="text-xl md:text-2xl font-medium mb-8 max-w-xl mx-auto">Welcome to the future of shopping. Discover, experience, and own the extraordinary.</p>
        <button className="btn btn-secondary btn-lg shadow-xl">Shop Now</button>
      </motion.div>
      {/* Placeholder for Rive or SVG animation */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl pointer-events-none"
      >
        {/* TODO: Insert Rive animation or SVG here */}
        <svg viewBox="0 0 600 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-48">
          <ellipse cx="300" cy="170" rx="240" ry="30" fill="#fff" fillOpacity="0.1" />
        </svg>
      </motion.div>
    </section>
  );
} 