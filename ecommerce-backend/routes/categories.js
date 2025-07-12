const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

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
router.post('/', protect, admin, [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 chars'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description max 500 chars'),
    body('image').optional().isString()
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
        }
        const { name, description, image } = req.body;
        const existing = await Category.findOne({ name });
        if (existing) {
            return res.status(400).json({ message: 'Category already exists' });
        }
        const category = await Category.create({ name, description, image });
        res.status(201).json({ message: 'Category created', category });
    } catch (error) {
        next(error);
    }
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
router.put('/:id', protect, admin, [
    body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 chars'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description max 500 chars'),
    body('image').optional().isString()
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
        }
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        if (req.body.name) category.name = req.body.name;
        if (req.body.description !== undefined) category.description = req.body.description;
        if (req.body.image !== undefined) category.image = req.body.image;
        await category.save();
        res.json({ message: 'Category updated', category });
    } catch (error) {
        next(error);
    }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.json({ message: 'Category deleted' });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 