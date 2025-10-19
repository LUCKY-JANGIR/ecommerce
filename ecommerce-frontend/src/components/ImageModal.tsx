'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import Image from 'next/image';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{ url: string; alt?: string } | string>;
  initialIndex?: number;
  productName: string;
}

export default function ImageModal({ 
  isOpen, 
  onClose, 
  images, 
  initialIndex = 0, 
  productName 
}: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
          break;
        case ' ':
          e.preventDefault();
          setIsZoomed(prev => !prev);
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, images.length]);

  const handlePrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
    setIsZoomed(false);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
    setIsZoomed(false);
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    setIsZoomed(false);
  };

  const currentImage = images[currentIndex];
  const imageUrl = typeof currentImage === 'string' ? currentImage : currentImage?.url || '/placeholder-product.svg';
  const imageAlt = typeof currentImage === 'string' ? `${productName} ${currentIndex + 1}` : currentImage?.alt || `${productName} ${currentIndex + 1}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999]"
            onClick={onClose}
            data-lenis-prevent
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            data-lenis-prevent
          >
            <div className="relative w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md rounded-t-2xl">
                <div className="flex items-center space-x-4">
                  <h3 className="text-white font-semibold text-lg">
                    {productName} - Image {currentIndex + 1} of {images.length}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                    title={isZoomed ? "Zoom Out" : "Zoom In"}
                  >
                    {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Main Image Container */}
              <div className="flex-1 relative overflow-hidden bg-black/50">
                <div className="w-full h-full flex items-center justify-center p-4">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`relative ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                    onClick={() => setIsZoomed(!isZoomed)}
                  >
                    <Image
                      src={imageUrl}
                      alt={imageAlt}
                      width={800}
                      height={800}
                      className={`object-contain transition-transform duration-300 ${
                        isZoomed ? 'scale-150' : 'scale-100'
                      }`}
                      style={{
                        maxWidth: isZoomed ? 'none' : '100%',
                        maxHeight: isZoomed ? 'none' : '100%',
                        width: isZoomed ? 'auto' : '100%',
                        height: isZoomed ? 'auto' : '100%'
                      }}
                    />
                  </motion.div>
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors text-white"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors text-white"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-b-2xl">
                  <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-2">
                    {images.map((image, index) => {
                      const thumbUrl = typeof image === 'string' ? image : image?.url || '/placeholder-product.svg';
                      return (
                        <button
                          key={index}
                          onClick={() => handleThumbnailClick(index)}
                          className={`flex-shrink-0 relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            currentIndex === index 
                              ? 'border-accent-500 shadow-lg' 
                              : 'border-white/30 hover:border-white/50'
                          }`}
                        >
                          <Image
                            src={thumbUrl}
                            alt={`${productName} thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 