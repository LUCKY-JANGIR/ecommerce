const express = require('express');
const { body, validationResult, query } = require('express-validator');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect, admin, optionalAuth } = require('../middleware/auth');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const multer = require('multer');
const path = require('path');
const { uploadToCloudinary } = require('../utils/cloudinary');
const cloudinary = require('cloudinary').v2;

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
], optionalAuth, asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ApiError('Validation failed', 400);
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: 'Database connection is not available. Please try again later.',
            data: {
                products: [],
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalProducts: 0,
                    hasNextPage: false,
                    hasPrevPage: false
                }
            }
        });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) ;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = {};
    // Remove isActive filter so all products are visible to all users

    let products = [];
    let total = 0;
    let usedRegexFallback = false;



    // Professional search: use $text if search query is present
    let useTextSearch = false;
    if (req.query.search) {
        // If a text index exists, use $text search for relevance
        filter.$text = { $search: req.query.search };
        useTextSearch = true;
    }

    // Robust category filter: support both ObjectId and name, never throw CastError
    if (req.query.category) {
        const mongoose = require('mongoose');
        let categoryId = req.query.category;
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            // Try to find category by name (case-insensitive)
            const categoryDoc = await Category.findOne({ name: { $regex: `^${categoryId}$`, $options: 'i' } });
            if (categoryDoc) {
                categoryId = categoryDoc._id;
            } else {
                // No such category, return empty result
                return res.status(200).json({
                    success: true,
                    data: {
                        products: [],
                        pagination: {
                            currentPage: 1,
                            totalPages: 1,
                            totalProducts: 0,
                            hasNextPage: false,
                            hasPrevPage: false
                        }
                    },
                    message: 'No products found for the given category.'
                });
            }
        }
        filter.category = categoryId;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
        filter.price = {};
        if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
        if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Rating filter
    if (req.query.minRating) {
        filter.rating = { $gte: parseFloat(req.query.minRating) };
    }

    // Build sort object
    let sort = {};
    if (useTextSearch) {
        sort = { score: { $meta: 'textScore' } };
    } else {
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
    }

    // Execute query
    let query = Product.find(filter)
        .populate('category', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-reviews');
    if (useTextSearch) {
        query = query.select({ score: { $meta: 'textScore' } });
    }
    products = await query;
    total = await Product.countDocuments(filter);

    // Regex fallback for substring/typo search
    if (req.query.search && (products.length === 0 || req.query.search.length < 3)) {
        usedRegexFallback = true;
        const regex = new RegExp(req.query.search, 'i');
        const regexFilter = {
            $or: [
                { name: regex },
                { description: regex },
                { brand: regex },
                { tags: regex },
                { sku: regex },
            ],
            ...(!req.user || req.user.role !== 'admin' ? { isActive: true } : {}),
        };
        // Merge with other filters (category, price, etc.)
        if (filter.category) regexFilter.category = filter.category;
        if (filter.price) regexFilter.price = filter.price;
        if (filter.rating) regexFilter.rating = filter.rating;
        // For regex fallback, do NOT use textScore sort/select
        let regexSort = {};
        switch (req.query.sortBy) {
            case 'price_asc': regexSort.price = 1; break;
            case 'price_desc': regexSort.price = -1; break;
            case 'rating': regexSort.rating = -1; break;
            case 'newest': regexSort.createdAt = -1; break;
            case 'oldest': regexSort.createdAt = 1; break;
            case 'name': regexSort.name = 1; break;
            default: regexSort.createdAt = -1;
        }
        products = await Product.find(regexFilter)
            .populate('category', 'name')
            .sort(regexSort)
            .skip(skip)
            .limit(limit)
            .select('-reviews');
        total = await Product.countDocuments(regexFilter);
    }

    // If no products found, return empty array with message (not 404)
    if (!products || products.length === 0) {
        return res.status(200).json({
            success: true,
            data: {
                products: [],
                pagination: {
                    currentPage: page,
                    totalPages: 1,
                    totalProducts: 0,
                    hasNextPage: false,
                    hasPrevPage: false
                }
            },
            message: 'No products found for the given criteria.'
        });
    }

    res.json({
        success: true,
        data: {
            products,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalProducts: total,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        }
    });
}));

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get('/featured', async (req, res, next) => {
    try {
        const products = await Product.getFeatured()
            .limit(8)
            .select('-reviews');

        res.json(products);
    } catch (error) {
        next(error);
    }
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
router.get('/category/:category', async (req, res, next) => {
    try {
        const products = await Product.getByCategory(req.params.category)
            .limit(8)
            .select('-reviews');

        res.json(products);
    } catch (error) {
        next(error);
    }
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('category', 'name') // Populate category name
        .populate('reviews.user', 'name');

    if (!product) {
        throw new ApiError('Product not found', 404);
    }

    res.json({
        success: true,
        data: product
    });
}));

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, upload.array('images', 5), async (req, res, next) => {
    try {
        console.log('Product creation request received');
        console.log('Files received:', req.files ? req.files.length : 0);
        if (req.files && req.files.length > 0) {
            req.files.forEach((file, index) => {
                console.log(`File ${index}:`, {
                    originalname: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size
                });
            });
        }
        console.log('Body received:', req.body);

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
                const result = await uploadToCloudinary(file.buffer, file.originalname);
                images.push({
                    url: result.secure_url,
                    alt: req.body.name || file.originalname,
                    public_id: result.public_id,
                });
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
            // Note: createdBy field removed from schema
        });

        res.status(201).json({
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, upload.array('images', 5), async (req, res, next) => {
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

        // Handle images: existing images, new images, and reordering
        let finalImages = [];
        
        // Process existing images (from existingImages field)
        if (req.body.existingImages) {
            const existingImageUrls = Array.isArray(req.body.existingImages) 
                ? req.body.existingImages 
                : [req.body.existingImages];
            
            // Filter existing images to only include those that are still wanted
            const existingImages = product.images.filter(img => 
                existingImageUrls.includes(img.url)
            );
            finalImages = [...existingImages];
        }
        
        // Add new images
        if (req.files && req.files.length > 0) {
            const newImages = [];
            for (const file of req.files) {
                const result = await uploadToCloudinary(file.buffer, file.originalname);
                newImages.push({
                    url: result.secure_url,
                    alt: product.name,
                    public_id: result.public_id,
                });
            }
            finalImages = [...finalImages, ...newImages];
        }
        
        // If no images were processed, keep existing images
        if (finalImages.length === 0) {
            finalImages = product.images;
        }
        
        // Update product images
        product.images = finalImages;
        
        // Handle image reordering if imageOrder is provided
        if (req.body.imageOrder) {
            try {
                const imageOrder = JSON.parse(req.body.imageOrder);
                // Reorder images based on the provided order
                const orderedImages = [];
                for (const imageId of imageOrder) {
                    const image = finalImages.find(img => 
                        img.url === imageId || img._id?.toString() === imageId
                    );
                    if (image) {
                        orderedImages.push(image);
                    }
                }
                // Add any remaining images that weren't in the order
                finalImages.forEach(img => {
                    if (!orderedImages.find(ordered => ordered.url === img.url)) {
                        orderedImages.push(img);
                    }
                });
                product.images = orderedImages;
            } catch (error) {
                console.error('Error parsing image order:', error);
            }
        }

        await product.save();

        res.json({
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    // Delete images from Cloudinary
    for (const image of product.images) {
        if (image.public_id) {
            try {
                await cloudinary.uploader.destroy(image.public_id);
            } catch (err) {
                console.error('Cloudinary deletion error:', err.message);
            }
        }
    }
    await product.deleteOne();
    res.json({ message: 'Product and images deleted successfully' });
}));

// @desc    Get product reviews
// @route   GET /api/products/:id/reviews
// @access  Public
router.get('/:id/reviews', asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('reviews.user', 'name')
        .select('reviews');

    if (!product) {
        throw new ApiError('Product not found', 404);
    }

    res.json({
        success: true,
        reviews: product.reviews,
        averageRating: product.averageRating,
        numReviews: product.numReviews
    });
}));

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
], asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ApiError('Validation failed', 400);
    }

    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
        throw new ApiError('Product not found', 404);
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
        review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
        return res.status(400).json({
            success: false,
            message: 'You have already reviewed this product. You can edit your existing review instead.',
            existingReview: {
                _id: existingReview._id,
                rating: existingReview.rating,
                comment: existingReview.comment,
                createdAt: existingReview.createdAt
            }
        });
    }

    // Add review
    product.reviews.push({
        user: req.user._id,
        rating: parseInt(rating),
        comment: comment.trim()
    });

    // Calculate new average rating
    product.calculateAverageRating();

    await product.save();

    // Populate user info for the new review
    await product.populate('reviews.user', 'name');
    const newReview = product.reviews[product.reviews.length - 1];

    res.status(201).json({
        success: true,
        message: 'Review added successfully',
        review: newReview,
        averageRating: product.averageRating,
        numReviews: product.numReviews
    });
}));

// @desc    Update review
// @route   PUT /api/products/:id/reviews/:reviewId
// @access  Private
router.put('/:id/reviews/:reviewId', protect, [
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().trim().isLength({ min: 10, max: 500 }).withMessage('Comment must be between 10 and 500 characters')
], asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ApiError('Validation failed', 400);
    }

    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
        throw new ApiError('Product not found', 404);
    }

    // Find the review
    const review = product.reviews.id(req.params.reviewId);
    if (!review) {
        throw new ApiError('Review not found', 404);
    }

    // Check if user owns this review
    if (review.user.toString() !== req.user._id.toString()) {
        throw new ApiError('You can only edit your own reviews', 403);
    }

    // Update review
    if (rating !== undefined) review.rating = parseInt(rating);
    if (comment !== undefined) review.comment = comment.trim();

    // Calculate new average rating
    product.calculateAverageRating();

    await product.save();

    // Populate user info
    await product.populate('reviews.user', 'name');
    const updatedReview = product.reviews.id(req.params.reviewId);

    res.json({
        success: true,
        message: 'Review updated successfully',
        review: updatedReview,
        averageRating: product.averageRating,
        numReviews: product.numReviews
    });
}));

// @desc    Delete review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
router.delete('/:id/reviews/:reviewId', protect, asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        throw new ApiError('Product not found', 404);
    }

    // Find the review
    const review = product.reviews.id(req.params.reviewId);
    if (!review) {
        throw new ApiError('Review not found', 404);
    }

    // Check if user owns this review or is admin
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new ApiError('You can only delete your own reviews', 403);
    }

    // Remove review
    review.remove();

    // Calculate new average rating
    product.calculateAverageRating();

    await product.save();

    res.json({
        success: true,
        message: 'Review deleted successfully',
        averageRating: product.averageRating,
        numReviews: product.numReviews
    });
}));

// @desc    Toggle featured status of a product
// @route   PATCH /api/products/:id/toggle-featured
// @access  Private/Admin
router.patch('/:id/toggle-featured', protect, admin, asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        throw new ApiError('Product not found', 404);
    }

    // Toggle the featured status
    product.isFeatured = !product.isFeatured;
    await product.save();

    res.json({
        success: true,
        message: `Product ${product.isFeatured ? 'added to' : 'removed from'} featured products`,
        data: {
            productId: product._id,
            isFeatured: product.isFeatured
        }
    });
}));

// @desc    Upload image to Google Drive
// @route   POST /api/products/upload-image
// @access  Private/Admin
router.post('/upload-image', protect, admin, upload.single('image'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }
        const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        res.json({
            message: 'Image uploaded successfully',
            imageUrl: result.secure_url,
            public_id: result.public_id,
        });
    } catch (error) {
        next(error);
    }
});

// Category routes will be registered in a new file (categories.js)

module.exports = router;