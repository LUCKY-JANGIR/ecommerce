// Enhanced image utilities for better performance and quality

import { getOptimizedImageUrl } from './cloudinary';

// Generate optimized placeholder with better styling
export const getPlaceholderImage = (width: number = 500, height: number = 320, text?: string): string => {
  const placeholderText = text || 'Product Image';
  return `https://via.placeholder.com/${width}x${height}/1a1a1a/9ca3af?text=${encodeURIComponent(placeholderText)}`;
};

// Generate blur placeholder for better loading experience
export const getBlurPlaceholder = (width: number = 10, height: number = 10): string => {
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1a1a"/>
      <rect width="100%" height="100%" fill="#2a2a2a" opacity="0.3"/>
    </svg>`
  ).toString('base64')}`;
};

// Responsive image sizes for different breakpoints
export const getResponsiveImageSizes = (containerType: 'product-card' | 'hero' | 'gallery' | 'thumbnail' = 'product-card'): string => {
  const sizes = {
    'product-card': '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
    'hero': '(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 70vw',
    'gallery': '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw',
    'thumbnail': '(max-width: 640px) 20vw, (max-width: 768px) 15vw, 10vw'
  };
  
  return sizes[containerType];
};

// Get optimized image URL with preset
export const getOptimizedImage = (url: string, preset: 'thumbnail' | 'card' | 'hero' | 'gallery' | 'full'): string => {
  if (!url) return getPlaceholderImage();
  return getOptimizedImageUrl(url, { quality: 'auto:good' });
};

// Generate multiple image sizes for responsive loading
export const generateResponsiveImageSet = (url: string, baseWidth: number = 400) => {
  if (!url || !url.includes('cloudinary.com')) {
    return {
      src: url,
      srcSet: undefined,
      sizes: undefined
    };
  }

  const sizes = [baseWidth, baseWidth * 1.5, baseWidth * 2, baseWidth * 3];
  const srcSet = sizes
    .map(size => {
      const optimizedUrl = getOptimizedImageUrl(url, { width: size, quality: 'auto:good' });
      return `${optimizedUrl} ${size}w`;
    })
    .join(', ');

  return {
    src: getOptimizedImageUrl(url, { width: baseWidth, quality: 'auto:good' }),
    srcSet,
    sizes: getResponsiveImageSizes('product-card')
  };
};

// Image loading optimization hook
export const useImagePreload = (urls: string[]) => {
  const preloadImages = (imageUrls: string[]) => {
    imageUrls.forEach(url => {
      if (url && url.includes('cloudinary.com')) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = getOptimizedImageUrl(url, { width: 400, quality: 'auto:good' });
        document.head.appendChild(link);
      }
    });
  };

  return { preloadImages };
}; 