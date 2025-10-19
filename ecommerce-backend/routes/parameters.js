const express = require('express');
const router = express.Router();
const Parameter = require('../models/Parameter');
const { protect, admin } = require('../middleware/auth');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

// @desc    Get all parameters
// @route   GET /api/parameters
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
    const parameters = await Parameter.find({ isActive: true }).sort({ name: 1 });
    
    res.json({
        success: true,
        data: parameters
    });
}));

// @desc    Get single parameter by ID
// @route   GET /api/parameters/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
    const parameter = await Parameter.findById(req.params.id);
    
    if (!parameter) {
        throw new ApiError('Parameter not found', 404);
    }
    
    res.json({
        success: true,
        data: parameter
    });
}));

// @desc    Create new parameter
// @route   POST /api/parameters
// @access  Private/Admin
router.post('/', protect, admin, asyncHandler(async (req, res) => {
    const {
        name,
        type,
        options,
        required,
        unit,
        min,
        max,
        step,
        allowCustom,
        description
    } = req.body;
    
    // Validate required fields
    if (!name || !type) {
        throw new ApiError('Name and type are required', 400);
    }
    
    // Validate type
    const validTypes = ['select', 'text', 'number', 'custom-range', 'dimensions'];
    if (!validTypes.includes(type)) {
        throw new ApiError('Invalid parameter type', 400);
    }
    
    // Create parameter
    const parameter = await Parameter.create({
        name,
        type,
        options: options || [],
        required: required || false,
        unit,
        min,
        max,
        step: step || 1,
        allowCustom: allowCustom || false,
        description
    });
    
    res.status(201).json({
        success: true,
        message: 'Parameter created successfully',
        data: parameter
    });
}));

// @desc    Update parameter
// @route   PUT /api/parameters/:id
// @access  Private/Admin
router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
    let parameter = await Parameter.findById(req.params.id);
    
    if (!parameter) {
        throw new ApiError('Parameter not found', 404);
    }
    
    const {
        name,
        type,
        options,
        required,
        unit,
        min,
        max,
        step,
        allowCustom,
        description,
        isActive
    } = req.body;
    
    // Update fields
    if (name) parameter.name = name;
    if (type) {
        const validTypes = ['select', 'text', 'number', 'custom-range', 'dimensions'];
        if (!validTypes.includes(type)) {
            throw new ApiError('Invalid parameter type', 400);
        }
        parameter.type = type;
    }
    if (options !== undefined) parameter.options = options;
    if (required !== undefined) parameter.required = required;
    if (unit !== undefined) parameter.unit = unit;
    if (min !== undefined) parameter.min = min;
    if (max !== undefined) parameter.max = max;
    if (step !== undefined) parameter.step = step;
    if (allowCustom !== undefined) parameter.allowCustom = allowCustom;
    if (description !== undefined) parameter.description = description;
    if (isActive !== undefined) parameter.isActive = isActive;
    
    await parameter.save();
    
    res.json({
        success: true,
        message: 'Parameter updated successfully',
        data: parameter
    });
}));

// @desc    Delete parameter
// @route   DELETE /api/parameters/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
    const parameter = await Parameter.findById(req.params.id);
    
    if (!parameter) {
        throw new ApiError('Parameter not found', 404);
    }
    
    await parameter.deleteOne();
    
    res.json({
        success: true,
        message: 'Parameter deleted successfully'
    });
}));

module.exports = router;

