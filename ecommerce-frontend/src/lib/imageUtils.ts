// Browser-safe image optimization utilities

export const getOptimizedImageUrl = (url: string, options: {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
} = {}): string => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const { width = 500, height, quality = 'auto', format = 'auto' } = options;
  
  // Add Cloudinary transformations
  const transformations = [
    `w_${width}`,
    `q_${quality}`,
    `f_${format}`
  ];

  if (height) {
    transformations.push(`h_${height}`);
  }

  // Insert transformations into the URL
  const baseUrl = url.split('/upload/')[0];
  const imagePath = url.split('/upload/')[1];
  
  return `${baseUrl}/upload/${transformations.join(',')}/${imagePath}`;
};

export const getPlaceholderImage = (width: number = 500, height: number = 320): string => {
  return `https://via.placeholder.com/${width}x${height}/f3f4f6/6b7280?text=Product+Image`;
}; 