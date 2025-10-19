"use client";

import React, { useState, useEffect } from 'react';
import { X, Star, Star as StarFilled } from 'lucide-react';
import { productsAPI } from './services/api';
import toast from 'react-hot-toast';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  existingReview?: {
    _id: string;
    rating: number;
    comment: string;
  };
  onReviewSubmitted: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  existingReview,
  onReviewSubmitted
}: ReviewModalProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    } else {
      setRating(0);
      setComment('');
    }
  }, [existingReview, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    
    if (comment.trim().length < 10) {
      toast.error('Comment must be at least 10 characters long');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (existingReview) {
        // Update existing review
        await productsAPI.updateProductReview(productId, existingReview._id, {
          rating,
          comment: comment.trim()
        });
        toast.success('Review updated successfully');
      } else {
        // Add new review
        await productsAPI.addProductReview(productId, {
          rating,
          comment: comment.trim()
        });
        toast.success('Review added successfully');
      }
      
      onReviewSubmitted();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;
    
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await productsAPI.deleteProductReview(productId, existingReview._id);
      toast.success('Review deleted successfully');
      onReviewSubmitted();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete review');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      data-lenis-prevent
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full universal-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="universal-modal-content">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {existingReview ? 'Edit Review' : 'Write a Review'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {productName}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating *
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="text-2xl text-gray-300 hover:text-yellow-400 transition-colors"
                    disabled={isSubmitting}
                  >
                    {star <= (hoveredRating || rating) ? (
                      <StarFilled className="h-8 w-8 text-yellow-400 fill-current" />
                    ) : (
                      <Star className="h-8 w-8" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {rating > 0 && (
                  <>
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </>
                )}
              </p>
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                Review *
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Share your experience with this product..."
                disabled={isSubmitting}
                maxLength={500}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>Minimum 10 characters</span>
                <span>{comment.length}/500</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              {existingReview && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Review'}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting 
                  ? (existingReview ? 'Updating...' : 'Submitting...') 
                  : (existingReview ? 'Update Review' : 'Submit Review')
                }
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
} 