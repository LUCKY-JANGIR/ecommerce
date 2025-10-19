"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, Heart, Star } from 'lucide-react';
import { Product } from '@/store/useStore';
import { categoriesAPI, productsAPI } from '@/components/services/api';
import { CategoriesGridSkeleton } from '@/components/ui/Skeleton';
import { getImagePreset } from '@/lib/cloudinary';
import { getBlurPlaceholder } from '@/lib/imageUtils';

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
}

interface CategoryWithProducts extends Category {
  products: Product[];
  productCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithProducts[]>([]);
  const [loading, setLoading] = useState(true);

  // Memoized fetch function for better performance
  const fetchCategoriesAndProducts = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch categories
      const categoriesData: Category[] = await categoriesAPI.getAll();

      // Fetch products for each category with optimized queries
      const categoriesWithProducts = await Promise.all(
        categoriesData.map(async (category) => {
          try {
            // Optimize: Get only 6 products for preview instead of 100
            const productsData = await productsAPI.getAll({ 
              category: category._id, 
              limit: 6, // Reduced for better performance
              sortBy: 'newest' // Get newest products for preview
            });
            
            return {
              ...category,
              products: productsData.products || [],
              productCount: productsData.pagination?.totalProducts || 0
            };
          } catch (error) {
            console.error(`Error fetching products for category ${category.name}:`, error);
            return {
              ...category,
              products: [],
              productCount: 0
            };
          }
        })
      );

      setCategories(categoriesWithProducts);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategoriesAndProducts();
  }, [fetchCategoriesAndProducts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg-primary">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12 space-y-4 pt-16">
            <div className="relative h-10 w-48 bg-gradient-to-r from-dark-bg-tertiary via-dark-bg-hover to-dark-bg-tertiary rounded overflow-hidden mx-auto">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>
            <div className="relative h-6 w-80 bg-gradient-to-r from-dark-bg-tertiary via-dark-bg-hover to-dark-bg-tertiary rounded overflow-hidden mx-auto">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>
          </div>
          <CategoriesGridSkeleton count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Simple Header */}
        <div className="text-center mb-12 pt-16">
          <h1 className="text-4xl md:text-5xl font-bold text-dark-text-primary mb-4 font-display">
            Traditional Crafts
          </h1>
          <p className="text-xl text-dark-text-secondary max-w-2xl mx-auto">
            Explore our handcrafted collections organized by traditional categories
          </p>
        </div>

        {/* Optimized Categories Grid */}
        {categories.length > 0 && (
          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {categories.map((category, index) => (
                <OptimizedCategoryCard 
                  key={category._id}
                  category={category}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        )}


      </div>
    </div>
  );
}

// Optimized Category Card Component
interface OptimizedCategoryCardProps {
  category: CategoryWithProducts;
  index: number;
}

const OptimizedCategoryCard = ({ category, index }: OptimizedCategoryCardProps) => {
  // Memoized product images for better performance
  const productImages = useMemo(() => {
    return category.products.slice(0, 4).map(product => {
      const imageUrl = product.images?.[0] && typeof product.images[0] === 'object' && product.images[0].url 
        ? product.images[0].url 
        : typeof product.images?.[0] === 'string' 
        ? product.images[0] 
        : null;
      
      return {
        url: imageUrl,
        alt: product.name,
        id: product._id
      };
    }).filter(img => img.url);
  }, [category.products]);

  // Memoized category stats
  const categoryStats = useMemo(() => {
    const totalProducts = category.productCount;
    const avgRating = category.products.reduce((acc, product) => acc + (product.averageRating || 0), 0) / category.products.length || 0;
    const priceRange = category.products.length > 0 ? {
      min: Math.min(...category.products.map(p => p.price)),
      max: Math.max(...category.products.map(p => p.price))
    } : null;

    return { totalProducts, avgRating, priceRange };
  }, [category.products, category.productCount]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/category/${encodeURIComponent(category.name)}`}>
        <div className="bg-gradient-to-br from-dark-bg-secondary to-dark-bg-tertiary rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-3 border border-dark-border-primary/50 hover:border-accent-500/40 group-hover:shadow-accent-500/10 h-full flex flex-col">
          
          {/* Enhanced Category Image */}
          <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[28rem] overflow-hidden bg-dark-bg-tertiary flex items-center justify-center">
            {category.image ? (
              <div className="relative w-full h-full">
                <Image
                  src={getImagePreset(category.image, 'card')}
                  alt={category.name}
                  fill
                  className="object-contain group-hover:scale-[1.02] transition-transform duration-700"
                  style={{ objectFit: 'contain', objectPosition: 'center' }}
                  quality={95}
                  placeholder="blur"
                  blurDataURL={getBlurPlaceholder(50, 50)}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  priority={index < 4}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 via-transparent to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                {/* Handwoven Pattern Overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-handloom-pattern pointer-events-none"></div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-accent-500 via-primary-500 to-heritage-500 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-white text-8xl font-bold opacity-90 font-display">
                    {category.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="w-20 h-1 bg-white/30 rounded-full mx-auto mt-3"></div>
                </div>
              </div>
            )}
            
            {/* Enhanced Product Count Badge */}
            <motion.div 
              className="absolute top-4 right-4 bg-gradient-to-r from-dark-bg-primary/95 to-dark-bg-secondary/95 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20 shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-accent-500" />
                <span className="text-sm font-bold text-dark-text-primary">
                  {categoryStats.totalProducts}
                </span>
                <span className="text-xs text-dark-text-secondary">items</span>
              </div>
            </motion.div>

            {/* Category Quality Badge */}
            {categoryStats.avgRating > 0 && (
              <div className="absolute top-4 left-4 bg-gradient-to-r from-accent-500 to-primary-500 rounded-2xl px-3 py-1.5 shadow-lg">
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-white fill-current" />
                  <span className="text-xs font-bold text-white">
                    {categoryStats.avgRating.toFixed(1)}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Enhanced Category Info */}
          <div className="p-6 relative flex-1 flex flex-col">
            {/* Handcrafted Indicator */}
            <div className="absolute -top-3 left-6 w-6 h-6 bg-gradient-to-r from-accent-500 to-primary-500 rounded-full flex items-center justify-center shadow-lg">
              <Heart className="w-3 h-3 text-white fill-current" />
            </div>

            <div className="mt-4 flex-1 flex flex-col">
              <h3 className="text-2xl font-bold text-dark-text-primary mb-3 group-hover:text-accent-500 transition-colors font-display">
                {category.name}
              </h3>
              <p className="text-dark-text-secondary mb-4 line-clamp-2 leading-relaxed text-sm">
                {category.description}
              </p>
              
              {/* Price Range */}
              {categoryStats.priceRange && (
                <div className="mb-4">
                  <p className="text-xs text-dark-text-muted mb-1">Price Range</p>
                  <p className="text-accent-500 font-bold">
                    ₹{categoryStats.priceRange.min.toLocaleString('en-IN')} - ₹{categoryStats.priceRange.max.toLocaleString('en-IN')}
                  </p>
                </div>
              )}
              
              {/* Enhanced Product Preview */}
              {productImages.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs text-dark-text-muted mb-3 font-medium">Featured Products</p>
                  <div className="flex -space-x-2">
                    {productImages.slice(0, 4).map((img, idx) => (
                      <motion.div
                        key={img.id}
                        className="relative w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-dark-bg-tertiary shadow-lg group/thumb"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.1 + idx * 0.1, type: "spring", stiffness: 300 }}
                      >
                        <Image
                          src={getImagePreset(img.url!, 'card')}
                          alt={img.alt}
                          fill
                          className="object-contain group-hover/thumb:scale-110 transition-transform duration-300"
                          quality={90}
                          placeholder="blur"
                          blurDataURL={getBlurPlaceholder(15, 15)}
                          sizes="48px"
                        />
                      </motion.div>
                    ))}
                    {categoryStats.totalProducts > 4 && (
                      <motion.div 
                        className="w-12 h-12 rounded-full border-2 border-dark-border-primary bg-gradient-to-br from-dark-bg-tertiary to-dark-bg-hover flex items-center justify-center shadow-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.4, type: "spring", stiffness: 300 }}
                      >
                        <span className="text-xs font-bold text-dark-text-primary">
                          +{categoryStats.totalProducts - 4}
                        </span>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Enhanced Explore Button */}
              <motion.div 
                className="flex items-center justify-between bg-gradient-to-r from-dark-bg-hover/50 to-dark-bg-primary/50 rounded-2xl p-4 border border-dark-border-primary/30 group-hover:border-accent-500/50 transition-all duration-300 mt-auto"
                whileHover={{ backgroundColor: "rgba(217, 119, 6, 0.1)" }}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-accent-500 font-bold group-hover:text-accent-400 transition-colors">
                    Explore Collection
                  </span>
                  <div className="w-2 h-2 bg-accent-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-r from-accent-500 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-accent-500/25 transition-all duration-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}; 