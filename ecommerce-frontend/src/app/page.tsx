"use client";
import React from "react";
import { motion } from "framer-motion";
import { FiUser } from "react-icons/fi";
import { useStore } from '@/store/useStore';
import '@fontsource/playfair-display/700.css';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Footer from './components/Footer';
import HeroSectionComponent from './components/HeroSection';
import FeaturedCategoriesComponent from './components/FeaturedCategories';

// Add Review type
interface Review {
  _id: string;
  user?: { name?: string };
  comment: string;
  createdAt: string;
}

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

function Values() {
  const values = [
    { title: 'Quality', icon: '🌟', desc: 'Handpicked products crafted with care and precision.' },
    { title: 'Authenticity', icon: '🛡️', desc: 'Every item is genuine and sourced from trusted artisans.' },
    { title: 'Valuable', icon: '💎', desc: 'Unique finds that add lasting value to your life.' },
    { title: 'Trust', icon: '🤝', desc: 'Transparent service and a commitment to your satisfaction.' },
  ];
  return (
    <section className="max-w-6xl mx-auto py-28 px-4 flex flex-col items-center bg-gradient-to-b from-white via-background-light to-white rounded-3xl shadow-sm">
      <h2 className="text-5xl md:text-6xl font-serif font-extrabold uppercase text-primary mb-3 text-center tracking-tight">
        Our Core Values
      </h2>
      <div className="w-16 h-1 bg-accent rounded-full mb-14" />
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
        {values.map((v, i) => (
          <div
            key={v.title}
            className="flex flex-col items-center text-center p-10 bg-card rounded-2xl border border-accent shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl animate-fadeIn"
            style={{ animationDelay: `${i * 0.1 + 0.1}s` }}
          >
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-accent/10 mb-7 shadow-inner text-5xl text-accent">
              {v.icon}
            </div>
            <h3 className="text-2xl font-serif font-extrabold text-primary mb-3 uppercase tracking-wide">
              {v.title}
            </h3>
            <p className="text-muted text-lg font-medium leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BrandStory() {
  return (
    <section className="max-w-3xl mx-auto py-24 px-4 flex flex-col items-center bg-card border border-accent rounded-3xl shadow-md">
      <h2 className="text-4xl md:text-5xl font-serif font-extrabold text-primary mb-6 text-center tracking-tight">Our Story</h2>
      <div className="w-14 h-1 bg-accent rounded mb-10" />
      <p className="text-lg md:text-xl text-muted font-serif text-center leading-relaxed font-medium">
        Rooted in tradition, inspired by the future. Our brand was born from a passion for authentic craftsmanship and a vision to bring timeless beauty to the modern world. We partner with skilled artisans, honor heritage, and curate collections that celebrate quality, trust, and individuality. Every piece tells a story—yours and ours, woven together.
      </p>
    </section>
  );
}

function PlatformReviews() {
  const { auth } = useStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5001/api/reviews')
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load reviews.');
        setLoading(false);
      });
  }, [success]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:5001/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ comment }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.errors?.[0]?.msg || data.message || 'Failed to submit review.');
      } else {
        setSuccess('Review submitted!');
        setComment('');
        setShowModal(false);
      }
    } catch {
      setError('Failed to submit review.');
    }
    setSubmitting(false);
  };

  return (
    <section className="max-w-3xl mx-auto py-24 px-4 flex flex-col items-center bg-gradient-to-b from-white via-background-light to-white rounded-3xl shadow-sm border border-accent">
      <h2 className="text-4xl md:text-5xl font-serif font-extrabold text-primary mb-6 text-center tracking-tight">
        What Our Customers Say
      </h2>
      <div className="flex items-center gap-2 mb-10">
        <div className="w-10 h-1 bg-accent rounded" />
        <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20l9-5-9-5-9 5 9 5z" />
        </svg>
        <div className="w-10 h-1 bg-accent rounded" />
      </div>
      {auth.isAuthenticated && (
        <button
          onClick={() => setShowModal(true)}
          className="mb-8 bg-primary text-white px-6 py-3 rounded font-bold hover:bg-accent transition shadow-md"
        >
          Add Review
        </button>
      )}
      {loading ? (
        <p className="text-muted">Loading reviews...</p>
      ) : (
        <div className="w-full flex flex-col gap-8 mb-12 max-h-[400px] overflow-y-auto pr-2">
          {reviews.length === 0 ? (
            <p className="text-muted text-center">No reviews yet.</p>
          ) : (
            reviews.map((r) => (
              <div
                key={r._id}
                className="bg-card border border-accent rounded-2xl p-7 shadow-lg flex flex-col gap-2 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl animate-fadeIn"
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-lg font-bold text-accent">
                    {r.user?.name?.[0] || 'A'}
                  </div>
                  <span className="font-bold text-primary text-lg font-serif">{r.user?.name || 'Anonymous'}</span>
                  <span className="text-xs text-muted ml-auto">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-accent/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h3m4 0a4 4 0 00-4-4H7a4 4 0 00-4 4v2a4 4 0 004 4h3" />
                  </svg>
                  <p className="text-gray-800 text-base italic">“{r.comment}”</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {/* Modal for adding review */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-card border border-accent rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-accent hover:text-primary text-2xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-2 text-primary font-serif text-center">Share Your Thoughts</h3>
            {error && <p className="text-red-600 text-sm animate-pulse text-center">{error}</p>}
            {success && <p className="text-green-600 text-sm animate-pulse text-center">{success}</p>}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
              <div className="relative">
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  minLength={10}
                  maxLength={500}
                  required
                  className="p-4 border rounded h-24 w-full focus:ring-2 focus:ring-accent transition peer"
                  placeholder=" "
                />
                <label className="absolute left-4 top-2 text-accent pointer-events-none transition-all duration-200 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-primary bg-white px-1">
                  Your Review
                </label>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary text-white px-6 py-3 rounded font-bold hover:bg-accent transition"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}
      {!auth.isAuthenticated && (
        <div className="text-center text-muted py-8">
          <span className="font-semibold">Please log in to add your review.</span>
        </div>
      )}
    </section>
  );
}

// Featured Categories Section
function FeaturedCategories() {
  const categories = [
    { name: 'Jewelry', image: '/placeholder-product.svg', href: '/categories/Jewelry' },
    { name: 'Textiles', image: '/placeholder-product.svg', href: '/categories/Textiles' },
    { name: 'Decor', image: '/placeholder-product.svg', href: '/categories/Decor' },
  ];
  return (
    <section className="max-w-6xl mx-auto py-20 px-4">
      <h2 className="text-4xl md:text-5xl font-serif font-extrabold text-primary mb-8 text-center tracking-tight">Featured Categories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {categories.map((cat) => (
          <a
            key={cat.name}
            href={cat.href}
            className="group bg-card border border-accent rounded-2xl shadow-lg p-8 flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <img src={cat.image} alt={cat.name} className="w-24 h-24 mb-6 rounded-full object-contain border-2 border-accent group-hover:scale-105 transition-transform" />
            <h3 className="text-2xl font-serif font-bold text-primary mb-2">{cat.name}</h3>
            <span className="text-muted text-sm">Explore {cat.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

// Featured Products Section
function FeaturedProducts() {
  const products = [
    { name: 'Handcrafted Necklace', image: '/placeholder-product.svg', href: '/products/1' },
    { name: 'Silk Scarf', image: '/placeholder-product.svg', href: '/products/2' },
    { name: 'Artisan Vase', image: '/placeholder-product.svg', href: '/products/3' },
  ];
  return (
    <section className="max-w-6xl mx-auto py-20 px-4">
      <h2 className="text-4xl md:text-5xl font-serif font-extrabold text-primary mb-8 text-center tracking-tight">Featured Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {products.map((prod) => (
          <a
            key={prod.name}
            href={prod.href}
            className="group bg-card border border-accent rounded-2xl shadow-lg p-8 flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <img src={prod.image} alt={prod.name} className="w-28 h-28 mb-6 rounded-xl object-contain border-2 border-accent group-hover:scale-105 transition-transform" />
            <h3 className="text-xl font-serif font-bold text-primary mb-2">{prod.name}</h3>
            <span className="text-muted text-sm">View Details</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
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
  );
}

function ValueProposition() {
  return (
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
  );
}

function Testimonials() {
  const [current, setCurrent] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
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
  );
}

function Newsletter() {
  return (
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
  );
}

// Footer is now imported from components directory

export default function Home() {
  return (
    <main className="min-h-screen">
      <motion.section
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <HeroSectionComponent />
      </motion.section>
      <motion.section
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
      >
        <Values />
      </motion.section>
      <motion.section
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
      >
        <BrandStory />
      </motion.section>
      <motion.section
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
      >
        <FeaturedCategoriesComponent />
      </motion.section>
      <motion.section
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
      >
        <FeaturedProducts />
      </motion.section>
      <motion.section
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, delay: 0.35, ease: 'easeOut' }}
      >
        <PlatformReviews />
      </motion.section>
      <motion.section
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
      >
        <Testimonials />
      </motion.section>
      <motion.section
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, delay: 0.45, ease: 'easeOut' }}
      >
        <Newsletter />
      </motion.section>
      <motion.section
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
      >
        <Footer />
      </motion.section>
    </main>
  );
}
