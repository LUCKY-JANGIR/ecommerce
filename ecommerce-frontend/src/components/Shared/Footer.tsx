'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Facebook, 
  Twitter, 
  Heart,
  Truck,
  Shield,
  RefreshCw
} from 'lucide-react';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: 'Shop',
    links: [
      { label: 'All Products', href: '/products' },
      { label: 'Categories', href: '/categories' },
      { label: 'Featured Products', href: '/products?featured=true' },
      { label: 'New Arrivals', href: '/products?sort=newest' },
    ]
  },
  {
    title: 'Customer Care',
    links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Shipping Info', href: '/shipping' },
      { label: 'Returns & Exchanges', href: '/returns' },
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Story', href: '/story' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
    ]
  }
];

const socialLinks = [
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Twitter', href: '#', icon: Twitter }
];

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over ₹999'
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure checkout'
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30-day return policy'
  },
  {
    icon: Heart,
    title: 'Handcrafted',
    description: 'Authentic artisan work'
  }
];

export default function Footer() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedSections(newExpanded);
  };



  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Features Section */}
        <div className="py-12 border-b border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-accent-600 rounded-full mb-4">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-serif font-bold text-lg">IH</span>
                  </div>
                  <span className="text-2xl font-serif font-bold text-white">Indian Handlooms</span>
                </div>
                
                <p className="text-gray-400 leading-relaxed max-w-md">
                  Celebrating the rich heritage of Indian craftsmanship. Each piece tells a story of tradition, 
                  skill, and artistry passed down through generations.
                </p>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-400">
                    <MapPin className="h-5 w-5 text-accent-500" />
                    <span className="text-sm">Mumbai, Maharashtra, India</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400">
                    <Phone className="h-5 w-5 text-accent-500" />
                    <span className="text-sm">+91 98765 43210</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400">
                    <Mail className="h-5 w-5 text-accent-500" />
                    <span className="text-sm">hello@indianhandlooms.com</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex space-x-4">
                  {socialLinks.map((social) => {
                    const IconComponent = social.icon;
                    return (
                      <a
                        key={social.name}
                        href={social.href}
                        className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-accent-600 transition-colors duration-300"
                        aria-label={social.name}
                      >
                        <IconComponent className="h-5 w-5" />
                      </a>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Footer Sections */}
            {footerSections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="space-y-4"
              >
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex items-center justify-between w-full md:justify-start md:cursor-default"
                  suppressHydrationWarning
                >
                  <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                  <svg
                    className={`w-5 h-5 md:hidden transition-transform duration-200 ${
                      expandedSections.has(section.title) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <nav className={`space-y-3 ${expandedSections.has(section.title) ? 'block' : 'hidden md:block'}`}>
                  {section.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="block text-gray-400 hover:text-accent-400 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="border-t border-gray-800 py-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2024 Indian Handlooms. All rights reserved. Made with ❤️ for artisans.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-accent-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-accent-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="text-gray-400 hover:text-accent-400 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
} 