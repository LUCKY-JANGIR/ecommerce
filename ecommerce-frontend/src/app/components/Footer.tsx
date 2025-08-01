import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiTwitter, FiYoutube } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
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

  const footerLinks = [
    {
      title: 'Shop',
      links: [
        { name: 'All Products', href: '/products' },
        { name: 'Categories', href: '/categories' },
        { name: 'New Arrivals', href: '/products?sort=newest' },
        { name: 'Featured', href: '/products?featured=true' },
      ]
    },
    {
      title: 'About',
      links: [
        { name: 'Our Story', href: '/about' },
        { name: 'Artisans', href: '/artisans' },
        { name: 'Sustainability', href: '/sustainability' },
        { name: 'Blog', href: '/blog' },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Contact Us', href: '/contact' },
        { name: 'FAQs', href: '/faqs' },
        { name: 'Shipping', href: '/shipping' },
        { name: 'Returns', href: '/returns' },
      ]
    },
  ];

  return (
    <footer className="bg-background-dark text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Brand Column */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Indian Handlooms</h2>
            </Link>
            <p className="text-gray-300 mb-6 max-w-md">
              Celebrating the rich heritage of Indian craftsmanship through authentic, handcrafted treasures that connect you to centuries of tradition and artistry.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-accent transition-colors">
                <FiInstagram size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-accent transition-colors">
                <FiFacebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-accent transition-colors">
                <FiTwitter size={20} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-accent transition-colors">
                <FiYoutube size={20} />
              </a>
            </div>
          </motion.div>
          
          {/* Links Columns */}
          {footerLinks.map((column) => (
            <motion.div variants={itemVariants} key={column.title}>
              <h3 className="text-lg font-semibold mb-4 text-accent">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-gray-300 hover:text-white transition-colors inline-block relative group"
                    >
                      <span>{link.name}</span>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300 ease-in-out"></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Contact & Newsletter */}
        <motion.div 
          className="border-t border-gray-700 pt-8 pb-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="flex items-center space-x-3 text-gray-300">
              <FiMail />
              <span>support@indianhandlooms.com</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <FiPhone />
              <span>+91 123 456 7890</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-300">
              <FiMapPin />
              <span>123 Craft Street, Artisan District, New Delhi, India</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Subscribe to Our Newsletter</h3>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow bg-gray-700 text-white border-0 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
              <button 
                type="submit" 
                className="bg-accent hover:bg-accent-dark text-white font-medium rounded-r-lg px-4 py-2 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </motion.div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-6 mt-2 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© {currentYear} Indian Handlooms. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}