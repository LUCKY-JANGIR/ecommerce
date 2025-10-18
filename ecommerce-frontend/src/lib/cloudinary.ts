// Server-side only Cloudinary configuration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cloudinary: any = null;

// Only initialize on server side
if (typeof window === 'undefined') {
  try {
    const { v2 } = await import('cloudinary');
    cloudinary = v2;
    
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  } catch (error) {
    console.warn('Cloudinary not available:', error);
  }
}

export interface UploadResult {
  url: string;
  public_id: string;
  secure_url: string;
}

export const uploadToCloudinary = async (
  file: Buffer,
  folder: string = 'products',
  options: {
    quality?: string;
    maxWidth?: number;
    maxHeight?: number;
    format?: string;
  } = {}
): Promise<UploadResult> => {
  if (!cloudinary) {
    throw new Error('Cloudinary upload is only available on the server side');
  }

  const { 
    quality = 'auto:good', 
    maxWidth = 1200, 
    maxHeight = 1200, 
    format = 'auto' 
  } = options;

  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image' as const,
          transformation: [
            { 
              width: maxWidth, 
              height: maxHeight, 
              crop: 'limit',
              quality: quality,
              fetch_format: format,
              flags: 'lossy',
              dpr: 'auto'
            }
          ],
          // Additional upload options for better quality
          overwrite: false,
          invalidate: true,
          eager: [
            { width: 800, height: 800, crop: 'limit', quality: 'auto:good' },
            { width: 400, height: 400, crop: 'limit', quality: 'auto:good' },
            { width: 200, height: 200, crop: 'limit', quality: 'auto:good' }
          ],
          eager_async: true
        },
        (error: unknown, result: {
          secure_url: string;
          public_id: string;
        }) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
              secure_url: result.secure_url
            });
          }
        }
      );

      uploadStream.end(file);
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  if (!cloudinary) {
    throw new Error('Cloudinary delete is only available on the server side');
  }

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

// Enhanced image optimization function with better quality settings
export const getOptimizedImageUrl = (url: string, options: {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
  crop?: string;
  gravity?: string;
  dpr?: string | number;
  blur?: number;
  brightness?: number;
  contrast?: number;
} = {}): string => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const { 
    width = 500, 
    height, 
    quality = 'auto:good', 
    format = 'auto',
    crop = 'limit',
    gravity = 'auto',
    dpr = 'auto',
    blur,
    brightness,
    contrast
  } = options;
  
  // Build transformations array
  const transformations: string[] = [];
  
  // Size and cropping
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop && crop !== 'limit') transformations.push(`c_${crop}`);
  if (gravity && gravity !== 'auto') transformations.push(`g_${gravity}`);
  
  // Quality and format
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);
  
  // Device pixel ratio
  transformations.push(`dpr_${dpr}`);
  
  // Optional enhancements
  if (blur) transformations.push(`e_blur:${blur}`);
  if (brightness) transformations.push(`e_brightness:${brightness}`);
  if (contrast) transformations.push(`e_contrast:${contrast}`);
  
  // Insert transformations into the URL
  const baseUrl = url.split('/upload/')[0];
  const imagePath = url.split('/upload/')[1];
  
  return `${baseUrl}/upload/${transformations.join(',')}/${imagePath}`;
};

// Specific image size presets for different use cases
export const getImagePreset = (url: string, preset: 'thumbnail' | 'card' | 'hero' | 'gallery' | 'full'): string => {
  const presets = {
    thumbnail: { width: 150, height: 150, crop: 'fill', quality: 'auto:good' },
    card: { width: 400, height: 400, crop: 'limit', quality: 'auto:good' },
    hero: { width: 800, height: 600, crop: 'limit', quality: 'auto:best' },
    gallery: { width: 600, height: 600, crop: 'limit', quality: 'auto:good' },
    full: { width: 1200, height: 1200, crop: 'limit', quality: 'auto:best' }
  };

  return getOptimizedImageUrl(url, presets[preset]);
};

export default cloudinary; 