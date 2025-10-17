const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = (fileBuffer, folder = 'products', options = {}) => {
    const { 
        quality = 'auto:best', 
        maxWidth = 1200, 
        maxHeight = 1200, 
        format = 'auto' 
    } = options;

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                public_id: `${folder}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        ).end(fileBuffer);
    });
};

module.exports = { uploadToCloudinary }; 