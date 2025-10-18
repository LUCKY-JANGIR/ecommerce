'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { platformReviewsAPI } from '@/components/services/api';
import { Star } from 'lucide-react';
import PlatformReviewModal from '@/components/PlatformReviewModal';

interface Review {
  _id: string;
  comment: string;
  rating: number;
  user: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await platformReviewsAPI.getAll();
      if (response && response.success) {
        setReviews(response.reviews || []);
      } else {
        setError('Failed to load reviews');
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReviewSubmitted = () => {
    // Refresh reviews after a new review is submitted
    fetchReviews();
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover why customers love shopping with us
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-2xl shadow-lg p-6 h-64">
                  <div className="flex justify-center mb-4">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className="w-5 h-5 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-gray-200 h-4 rounded"></div>
                    <div className="bg-gray-200 h-4 rounded"></div>
                    <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  </div>
                  <div className="flex items-center mt-6">
                    <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                    <div className="space-y-1">
                      <div className="bg-gray-200 h-3 w-20 rounded"></div>
                      <div className="bg-gray-200 h-2 w-16 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || reviews.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover why customers love shopping with us
            </p>
          </div>
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-2">No reviews available yet</p>
              <p className="text-sm text-gray-400">Be the first to share your experience!</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover why customers love shopping with us
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {reviews.map((review, index) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-lg p-6 md:p-8 h-full hover:shadow-xl transition-all duration-300"
            >
              <div className="text-center h-full flex flex-col">
                {/* Stars */}
                <div className="flex items-center justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 md:w-6 md:h-6 ${
                        i < (review.rating || 5) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-base md:text-lg text-gray-700 mb-6 flex-grow leading-relaxed">
                  &quot;{review.comment}&quot;
                </blockquote>

                {/* Author */}
                <div className="flex items-center justify-center mt-auto">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                    {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">
                      {review.user?.name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        {reviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Share Your Experience
              </h3>
              <p className="text-gray-600 mb-6">
                Help others discover great products by sharing your review
              </p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Write a Review
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Review Modal */}
      <PlatformReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </section>
  );
}
