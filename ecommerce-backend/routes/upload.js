const express = require('express');
const multer = require('multer');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { protect, admin } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',');
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images are allowed.'));
        }
    }
});

// @desc    Upload image
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protect, admin, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file provided' });
        }
        // Validate file type
        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({ message: 'File must be an image' });
        }
        // Validate file size (max 5MB)
        if (req.file.size > 5 * 1024 * 1024) {
            return res.status(400).json({ message: 'File size must be less than 5MB' });
        }
        // Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        res.json({
            success: true,
            data: {
                url: result.secure_url,
                public_id: result.public_id,
                secure_url: result.secure_url
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            message: 'Failed to upload image',
            error: error.message
        });
    }
});

// Delete image from Cloudinary by public_id
router.post('/delete', protect, admin, async (req, res) => {
    const { public_id } = req.body;
    if (!public_id) {
        return res.status(400).json({ message: 'public_id is required' });
    }
    try {
        await cloudinary.uploader.destroy(public_id);
        res.json({ message: 'Image deleted from Cloudinary' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete image', error: err.message });
    }
});

module.exports = router; 