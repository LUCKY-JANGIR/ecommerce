'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { platformReviewsAPI } from '@/components/services/api';
import { Star } from 'lucide-react';
import PlatformReviewModal from '@/components/PlatformReviewModal';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Review {
  _id: string;
  comment: string;
  user: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const fetchReviews = async () => {
    try {
      const data = await platformReviewsAPI.getAll();
      if (data && data.reviews && Array.isArray(data.reviews)) {
        // Take the latest 6 reviews
        setReviews(data.reviews.slice(0, 6));
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleReviewSubmitted = () => {
    fetchReviews(); // Refresh reviews after submission
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">What Our Customers Say</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">Real reviews from our valued customers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 animate-pulse">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-300 rounded-full"></div>
                  <div className="ml-3 sm:ml-4">
                    <div className="h-3 sm:h-4 bg-gray-300 rounded w-20 sm:w-24 mb-1 sm:mb-2"></div>
                    <div className="h-2 sm:h-3 bg-gray-300 rounded w-12 sm:w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 sm:h-4 bg-gray-300 rounded"></div>
                  <div className="h-3 sm:h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-4">What Our Customers Say</h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">Real reviews from our valued customers</p>
          <motion.button
            onClick={() => setIsReviewModalOpen(true)}
            className="mt-4 sm:mt-6 bg-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-orange-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Write a Review
          </motion.button>
        </motion.div>

        {reviews.length > 0 ? (
          <div className="relative">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={16}
              slidesPerView={1}
              navigation={{
                nextEl: '.testimonials-swiper-next',
                prevEl: '.testimonials-swiper-prev',
              }}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                480: {
                  slidesPerView: 1,
                  spaceBetween: 16,
                },
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 24,
                },
              }}
              className="testimonials-swiper"
            >
              {reviews.map((review, index) => (
                <SwiperSlide key={review._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 h-full"
                  >
                    {/* Stars */}
                    <div className="flex items-center mb-3 sm:mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            i < 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Review Text */}
                    <blockquote className="text-gray-700 mb-4 sm:mb-6 italic text-xs sm:text-sm leading-relaxed">
                      "{review.comment}"
                    </blockquote>

                    {/* User Info */}
                    <div className="flex items-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-lg">
                        {review.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">{review.user.name}</div>
                        <div className="text-xs sm:text-sm text-gray-500">{formatDate(review.createdAt)}</div>
                      </div>
                    </div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Custom Navigation Buttons */}
            <div className="testimonials-swiper-prev absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <div className="testimonials-swiper-next absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ) : (
          <motion.div 
            className="text-center py-8 sm:py-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="max-w-md mx-auto">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Be the First to Review</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                We'd love to hear about your experience with our handloom products. 
                Share your thoughts and help others discover the beauty of authentic Indian textiles.
              </p>
              <button 
                onClick={() => setIsReviewModalOpen(true)}
                className="bg-orange-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-orange-700 transition-colors"
              >
                Write a Review
              </button>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        {reviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 text-center"
          >
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">{reviews.length}+</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">5.0</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">100%</div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600">Satisfaction Rate</div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Review Modal */}
      <PlatformReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </section>
  );
} 