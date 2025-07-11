const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');
const { protect, admin, optionalAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const driveService = require('../utils/drive');

const router = express.Router();

// Configure multer for memory storage (for Google Drive upload)
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

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
router.get('/', [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number')
], optionalAuth, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        // Build filter object
        let filter = {};
        if (!req.user || req.user.role !== 'admin') {
            filter.isActive = true;
        }

        // Category filter
        if (req.query.category) {
            filter.category = req.query.category;
        }

        // Price range filter
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
        }

        // Search filter
        if (req.query.search) {
            filter.$text = { $search: req.query.search };
        }

        // Brand filter
        if (req.query.brand) {
            filter.brand = new RegExp(req.query.brand, 'i');
        }

        // Rating filter
        if (req.query.minRating) {
            filter.rating = { $gte: parseFloat(req.query.minRating) };
        }

        // Build sort object
        let sort = {};
        switch (req.query.sortBy) {
            case 'price_asc':
                sort.price = 1;
                break;
            case 'price_desc':
                sort.price = -1;
                break;
            case 'rating':
                sort.rating = -1;
                break;
            case 'newest':
                sort.createdAt = -1;
                break;
            case 'oldest':
                sort.createdAt = 1;
                break;
            case 'name':
                sort.name = 1;
                break;
            default:
                sort.createdAt = -1;
        }

        // Execute query
        const products = await Product.find(filter)
            .populate('createdBy', 'name')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .select('-reviews'); // Exclude reviews for performance

        // Get total count for pagination
        const total = await Product.countDocuments(filter);

        res.json({
            products,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalProducts: total,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ message: 'Server error fetching products' });
    }
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('createdBy', 'name')
            .populate('reviews.user', 'name avatar');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Only show active products to non-admin users
        if (!product.isActive && (!req.user || req.user.role !== 'admin')) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(500).json({ message: 'Server error fetching product' });
    }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, upload.array('images', 5), async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authorized. Please log in as admin.' });
        }
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            name, description, price, originalPrice, discount, category,
            subcategory, brand, sku, stock, lowStockThreshold, weight,
            dimensions, specifications, tags, isFeatured
        } = req.body;

        // Check if SKU already exists
        const existingProduct = await Product.findOne({ sku });
        if (existingProduct) {
            return res.status(400).json({ message: 'Product with this SKU already exists' });
        }

        // Process uploaded images
        const images = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploadResult = await driveService.uploadFile(file);
                if (uploadResult.success) {
                    images.push({
                        url: uploadResult.url,
                        alt: name
                    });
                }
            }
        }

        // Create product
        const product = await Product.create({
            name,
            description,
            price,
            originalPrice: originalPrice || price,
            discount: discount || 0,
            category,
            subcategory: subcategory || '',
            brand: brand || '',
            sku,
            images,
            stock,
            lowStockThreshold: lowStockThreshold || 10,
            weight: weight || 0,
            dimensions: dimensions ? JSON.parse(dimensions) : {},
            specifications: specifications ? JSON.parse(specifications) : [],
            tags: tags ? JSON.parse(tags) : [],
            isFeatured: isFeatured === 'true',
            createdBy: req.user._id
        });

        res.status(201).json({
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ message: 'Server error creating product' });
    }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, upload.array('images', 5), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update fields
        const updateFields = [
            'name', 'description', 'price', 'originalPrice', 'discount',
            'category', 'subcategory', 'brand', 'stock', 'lowStockThreshold',
            'weight', 'isActive', 'isFeatured'
        ];

        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                product[field] = req.body[field];
            }
        });

        // Always preserve createdBy
        if (!product.createdBy) {
            // If for some reason createdBy is missing, set it to the current user
            product.createdBy = req.user._id;
        }

        // Handle complex fields
        if (req.body.dimensions) {
            product.dimensions = JSON.parse(req.body.dimensions);
        }
        if (req.body.specifications) {
            product.specifications = JSON.parse(req.body.specifications);
        }
        if (req.body.tags) {
            product.tags = JSON.parse(req.body.tags);
        }

        // Handle new images
        if (req.files && req.files.length > 0) {
            const newImages = [];
            for (const file of req.files) {
                const uploadResult = await driveService.uploadFile(file);
                if (uploadResult.success) {
                    newImages.push({
                        url: uploadResult.url,
                        alt: product.name
                    });
                }
            }
            product.images = [...product.images, ...newImages];
        }

        await product.save();

        res.json({
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error updating product' });
    }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error deleting product' });
    }
});

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, [
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    body('comment')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Comment must be between 10 and 500 characters')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { rating, comment } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user already reviewed this product
        const existingReview = product.reviews.find(
            review => review.user.toString() === req.user._id.toString()
        );

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        // Add review
        const review = {
            user: req.user._id,
            name: req.user.name,
            rating,
            comment
        };

        product.reviews.push(review);
        await product.save();

        res.status(201).json({
            message: 'Review added successfully',
            review
        });
    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ message: 'Server error adding review' });
    }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get('/featured/list', async (req, res) => {
    try {
        const products = await Product.getFeatured()
            .populate('createdBy', 'name')
            .limit(8)
            .select('-reviews');

        res.json(products);
    } catch (error) {
        console.error('Get featured products error:', error);
        res.status(500).json({ message: 'Server error fetching featured products' });
    }
});

// @desc    Upload image to Google Drive
// @route   POST /api/products/upload-image
// @access  Private/Admin
router.post('/upload-image', protect, admin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // Upload to Google Drive (or local storage for development)
        const uploadResult = await driveService.uploadFile(req.file);

        if (!uploadResult.success) {
            return res.status(500).json({ message: 'Failed to upload image', error: uploadResult.error });
        }

        res.json({
            message: 'Image uploaded successfully',
            imageUrl: uploadResult.url,
            filename: uploadResult.filename,
            driveUrl: uploadResult.driveUrl
        });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ message: 'Server error uploading image' });
    }
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
router.get('/category/:category', async (req, res) => {
    try {
        const products = await Product.getByCategory(req.params.category)
            .populate('createdBy', 'name')
            .select('-reviews');

        res.json(products);
    } catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({ message: 'Server error fetching products by category' });
    }
});

module.exports = router;