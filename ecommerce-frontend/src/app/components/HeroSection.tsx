import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

export default function HeroSection() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
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

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05, 
      transition: { 
        type: "spring" as const, 
        stiffness: 400, 
        damping: 10 
      } 
    },
    tap: { scale: 0.95 }
  };

  const floatingElements = {
    initial: { y: 0 },
    animate: { 
      y: [-10, 10, -10], 
      transition: { 
        repeat: Infinity, 
        duration: 3, 
        ease: "easeInOut" as const 
      } 
    }
  };

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background-light to-background">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated circles */}
        <motion.div 
          className="absolute top-20 right-20 w-64 h-64 rounded-full border border-accent opacity-20"
          variants={floatingElements}
          initial="initial"
          animate="animate"
        />
        <motion.div 
          className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full border-2 border-accent opacity-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div 
          className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-accent opacity-20"
          variants={floatingElements}
          initial="initial"
          animate="animate"
          transition={{ delay: 1 }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/3 w-6 h-6 rounded-full bg-accent opacity-10"
          variants={floatingElements}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.5 }}
        />
        
        {/* Light beams */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-radial from-accent/5 to-transparent opacity-50" />
      </div>

      {/* Main content */}
      <motion.div
        className="z-10 text-center px-6 max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-2">
          <span className="inline-block py-1 px-3 rounded-full bg-accent/10 text-accent text-sm font-medium tracking-wide mb-4">Premium Handcrafted Goods</span>
        </motion.div>
        
        <motion.h1 
          variants={itemVariants} 
          className="text-5xl md:text-7xl font-extrabold mb-6 text-primary tracking-tight"
        >
          <span className="relative inline-block">
            <span className="relative z-10">Discover</span>
            <motion.span 
              className="absolute bottom-0 left-0 w-full h-3 bg-accent/20 rounded-sm -z-10"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 1.2, duration: 0.8 }}
            />
          </span>{' '}
          <span className="text-accent">Timeless</span> Beauty
        </motion.h1>
        
        <motion.p 
          variants={itemVariants} 
          className="text-xl md:text-2xl font-medium mb-10 max-w-2xl mx-auto text-secondary leading-relaxed"
        >
          Curated collection of handcrafted treasures from artisans around the world
        </motion.p>
        
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col sm:flex-row gap-5 justify-center items-center"
        >
          <motion.div
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
          >
            <Link href="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors shadow-lg">
              Shop Now
              <FiArrowRight className="ml-1" />
            </Link>
          </motion.div>
          
          <motion.div
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
          >
            <Link href="/categories" className="inline-flex items-center gap-2 px-8 py-4 border-2 border-accent text-accent font-medium rounded-xl hover:bg-accent hover:text-white transition-colors">
              Explore Categories
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Trust badges */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-wrap justify-center items-center gap-8 mt-12 text-sm text-muted"
        >
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full" />
            Free Shipping
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full" />
            Secure Payment
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full" />
            Quality Guarantee
          </span>
        </motion.div>
      </motion.div>
      
      {/* Bottom decoration */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background-dark/20 to-transparent"
      />
    </section>
  );
}