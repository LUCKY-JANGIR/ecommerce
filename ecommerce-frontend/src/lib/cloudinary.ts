// Server-side only Cloudinary configuration
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
  folder: string = 'products'
): Promise<UploadResult> => {
  if (!cloudinary) {
    throw new Error('Cloudinary upload is only available on the server side');
  }

  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image' as const,
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
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

// Browser-safe image optimization function
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

export default cloudinary; 