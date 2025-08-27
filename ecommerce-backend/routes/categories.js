const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const { protect, admin } = require('../middleware/auth');
const multer = require('multer');
const { uploadToCloudinary } = require('../utils/cloudinary');
const cloudinary = require('cloudinary').v2;

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res, next) => {
    try {

        
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        next(error);
    }
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json(category);
    } catch (error) {
        next(error);
    }
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), async (req, res, next) => {
    try {
        let imageUrl = '';
        let imagePublicId = '';
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
            imageUrl = result.secure_url;
            imagePublicId = result.public_id;
        }
        // Accept image URL from body if provided and no file is uploaded
        if (req.body.image && !req.file && req.body.image.trim() !== '') {
            imageUrl = req.body.image;
        }
        const category = await Category.create({
            name: req.body.name,
            description: req.body.description,
            image: imageUrl,
            imagePublicId,
        });
        res.status(201).json({ message: 'Category created', category });
    } catch (err) {
        next(err);
    }
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
router.put('/:id', protect, admin, upload.single('image'), async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        if (req.body.name) category.name = req.body.name;
        if (req.body.description) category.description = req.body.description;
        // Handle image replacement
        if (req.file) {
            // Delete old image if exists
            if (category.imagePublicId) {
                await cloudinary.uploader.destroy(category.imagePublicId);
            }
            const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
            category.image = result.secure_url;
            category.imagePublicId = result.public_id;
        }
        // Accept image URL from body if provided and no file is uploaded
        if (req.body.image && !req.file && req.body.image.trim() !== '') {
            category.image = req.body.image;
        }
        // Handle image removal
        if (req.body.removeImage === 'true' && category.imagePublicId) {
            await cloudinary.uploader.destroy(category.imagePublicId);
            category.image = '';
            category.imagePublicId = '';
        }
        await category.save();
        res.json({ message: 'Category updated', category });
    } catch (err) {
        next(err);
    }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        if (category.imagePublicId) {
            await cloudinary.uploader.destroy(category.imagePublicId);
        }
        await category.deleteOne();
        res.json({ message: 'Category and image deleted' });
    } catch (err) {
        next(err);
    }
});

module.exports = router; 