'use client';

import React from 'react';
import Image from 'next/image';
import { getImagePreset } from '@/lib/cloudinary';
import { getResponsiveImageSizes, getBlurPlaceholder } from '@/lib/imageUtils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  preset?: 'thumbnail' | 'card' | 'hero' | 'gallery' | 'full';
  containerType?: 'product-card' | 'hero' | 'gallery' | 'thumbnail';
  placeholder?: 'blur' | 'empty';
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  priority = false,
  quality = 90,
  sizes,
  preset = 'card',
  containerType = 'product-card',
  placeholder = 'blur',
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  // Generate optimized image URL
  const optimizedSrc = React.useMemo(() => {
    if (!src || src === '/placeholder-product.svg') {
      return src;
    }
    
    try {
      return getImagePreset(src, preset);
    } catch (error) {
      console.warn('Failed to optimize image URL:', error);
      return src;
    }
  }, [src, preset]);

  // Generate blur placeholder
  const blurDataURL = React.useMemo(() => {
    if (placeholder === 'empty') return undefined;
    
    const blurWidth = width ? Math.min(width / 10, 20) : 20;
    const blurHeight = height ? Math.min(height / 10, 20) : 20;
    
    return getBlurPlaceholder(blurWidth, blurHeight);
  }, [placeholder, width, height]);

  // Generate responsive sizes
  const responsiveSizes = sizes || getResponsiveImageSizes(containerType);

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      priority={priority}
      quality={quality}
      sizes={responsiveSizes}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      onLoad={onLoad}
      onError={onError}
      {...props}
    />
  );
}

// Preset-based optimized image components
export const ProductImage = (props: Omit<OptimizedImageProps, 'preset' | 'containerType'>) => (
  <OptimizedImage preset="card" containerType="product-card" {...props} />
);

export const ThumbnailImage = (props: Omit<OptimizedImageProps, 'preset' | 'containerType'>) => (
  <OptimizedImage preset="thumbnail" containerType="thumbnail" {...props} />
);

export const HeroImage = (props: Omit<OptimizedImageProps, 'preset' | 'containerType'>) => (
  <OptimizedImage preset="hero" containerType="hero" {...props} />
);

export const GalleryImage = (props: Omit<OptimizedImageProps, 'preset' | 'containerType'>) => (
  <OptimizedImage preset="gallery" containerType="gallery" {...props} />
);
