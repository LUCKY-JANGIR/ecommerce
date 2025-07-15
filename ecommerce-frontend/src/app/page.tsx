"use client";
import React from "react";
import { motion } from "framer-motion";
import { FiUser } from "react-icons/fi";
import { useStore } from '@/store/useStore';
import '@fontsource/playfair-display/700.css';

// --- Design System ---
const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/products" },
];

const features = [
  {
    title: "Seamless Experience",
    desc: "Effortless navigation and blazing fast performance across all devices.",
    icon: "⚡",
  },
  {
    title: "Next-Gen Security",
    desc: "Your data is protected with industry-leading security and privacy.",
    icon: "🔒",
  },
  {
    title: "Modern Design",
    desc: "Minimal, elegant, and tech-inspired UI for a premium feel.",
    icon: "🌐",
  },
];

const testimonials = [
  {
    quote: "ShopEase redefines what a modern ecommerce brand can be. The experience is flawless!",
    name: "Alex Kim",
    title: "Product Designer, Vercel",
  },
  {
    quote: "The interface is so clean and intuitive. I love shopping here!",
    name: "Jordan Lee",
    title: "Frontend Lead, Shopify",
  },
  {
    quote: "A new standard for premium, trustworthy online brands.",
    name: "Morgan Patel",
    title: "UX Consultant, Apple",
  },
];

const heroBg = "https://img.freepik.com/premium-photo/luxury-indian-traditional-jewelry-set-display-black-mannequin-background_1162066-386.jpg";

function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Static full-screen background image with dark overlay and grain */}
      <img
        src={heroBg}
        alt="Luxury Indian Jewelry"
        className="absolute inset-0 w-full h-full object-cover object-center z-0"
      />
      <div className="absolute inset-0 bg-background/70 z-10" />
      <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: 'url(\"https://www.transparenttextures.com/patterns/asfalt-light.png\")', opacity: 0.15 }} />

      {/* Floating phrases */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 1 }}
        className="absolute left-8 bottom-8 md:left-16 md:bottom-12 z-30 text-primary text-sm md:text-base font-display italic font-semibold drop-shadow-lg"
        style={{ textShadow: '0 2px 12px #000a' }}
      >
        Handcrafted in Rajasthan
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 1 }}
        className="absolute right-8 bottom-8 md:right-16 md:bottom-12 z-30 text-primary text-sm md:text-base font-display italic font-semibold drop-shadow-lg text-right"
        style={{ textShadow: '0 2px 12px #000a' }}
      >
        Timeless Luxury
      </motion.div>

      {/* Main content moved to left side, vertically centered, with side padding */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="relative z-40 flex flex-col items-start justify-center text-left px-8 md:px-12 lg:px-16 pt-24 pb-16 max-w-2xl"
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 text-primary drop-shadow-xl font-display" style={{ textShadow: '0 2px 12px #000a' }}>
          ShopEase
        </h1>
        <h2 className="text-xl md:text-3xl text-primary mb-3 font-display font-semibold" style={{ textShadow: '0 2px 12px #000a' }}>
          Timeless Luxury, Handcrafted for You
        </h2>
        <p className="text-base md:text-lg text-secondary mb-8 font-body max-w-xl" style={{ textShadow: '0 2px 12px #000a' }}>
          Experience the artistry of finest heritage products and textiles.
        </p>
        <motion.a
          href="/products"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="inline-block px-8 py-3 rounded-full bg-primary text-background font-bold text-lg shadow-lg transition-all hover:bg-primary-light"
        >
          Shop Now
        </motion.a>
      </motion.div>
    </section>
  );
}

export default function Home() {
  const { auth } = useStore();

  // --- Testimonial Carousel State ---
  const [current, setCurrent] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="bg-background text-primary min-h-screen font-body">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Grid */}
      <section id="features" className="max-w-5xl mx-auto py-20 px-4 grid md:grid-cols-3 gap-10">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: i * 0.15, duration: 0.7 }}
            className="bg-secondary rounded-2xl p-8 flex flex-col items-center shadow-xl hover:shadow-2xl transition-shadow border border-primary"
          >
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">{f.title}</h3>
            <p className="text-gray-700 text-center">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Value Proposition Section */}
      <section className="max-w-4xl mx-auto py-20 px-4 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
          className="text-3xl md:text-5xl font-bold mb-6 text-text-main"
        >
          Why ShopEase?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="text-lg md:text-2xl text-gray-700 max-w-2xl mx-auto"
        >
          We combine cutting-edge technology, beautiful design, and a relentless focus on user experience to deliver a shopping platform you can trust and love.
        </motion.p>
      </section>

      {/* Testimonial Carousel */}
      <section id="testimonials" className="bg-background-light py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h3
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7 }}
            className="text-2xl md:text-4xl font-bold mb-8 text-text-main"
          >
            What People Are Saying
          </motion.h3>
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="bg-secondary rounded-2xl p-8 shadow-lg border border-primary"
          >
            <p className="text-xl md:text-2xl text-gray-800 mb-4">"{testimonials[current].quote}"</p>
            <div className="text-gray-600 text-sm">
              <span className="font-semibold text-gray-800">{testimonials[current].name}</span> — {testimonials[current].title}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section id="newsletter" className="max-w-2xl mx-auto py-20 px-4 text-center">
        <motion.h4
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
          className="text-2xl md:text-3xl font-bold mb-4 text-text-main"
        >
          Stay in the Loop
        </motion.h4>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="text-gray-700 mb-6"
        >
          Subscribe to our newsletter for updates, launches, and more.
        </motion.p>
        <form className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <input
            type="email"
            required
            placeholder="Your email address"
            className="px-5 py-3 rounded-full bg-secondary text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary border border-primary w-full sm:w-auto"
          />
          <button
            type="submit"
            className="px-7 py-3 rounded-full bg-primary hover:bg-primary-light text-background font-semibold shadow-lg transition-all"
          >
            Subscribe
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="bg-background-dark border-t border-primary py-8 px-4 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-lg font-bold tracking-tight text-primary">
            ShopEase
          </div>
          <div className="flex gap-6 text-text-muted text-sm">
            <a href="#features" className="hover:text-primary transition">Features</a>
            <a href="#testimonials" className="hover:text-primary transition">Testimonials</a>
            <a href="#newsletter" className="hover:text-primary transition">Newsletter</a>
          </div>
          <div className="text-text-muted text-xs">© {new Date().getFullYear()} ShopEase. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
