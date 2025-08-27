const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, admin, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Build filter
        const filter = {};
        if (req.query.role) {
            filter.role = req.query.role;
        }
        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(filter);

        res.json({
            users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalUsers: total,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Get user by ID (Admin)
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', protect, admin, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's order statistics
        const orderStats = await Order.aggregate([
            { $match: { user: user._id } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$totalPrice' },
                    avgOrderValue: { $avg: '$totalPrice' }
                }
            }
        ]);

        const stats = orderStats[0] || {
            totalOrders: 0,
            totalSpent: 0,
            avgOrderValue: 0
        };

        res.json({
            user,
            orderStats: stats
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'User not found' });
        }
        next(error);
    }
});

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put('/:id', protect, admin, [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email'),
    body('role')
        .optional()
        .isIn(['user', 'admin'])
        .withMessage('Role must be either user or admin'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please enter a valid phone number')
], async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is being changed and if it's already taken
        if (req.body.email && req.body.email !== user.email) {
            const existingUser = await User.findOne({ email: req.body.email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        // Update fields
        const updateFields = ['name', 'email', 'role', 'phone', 'isEmailVerified'];
        updateFields.forEach(field => {
            if (req.body[field] !== undefined) {
                user[field] = req.body[field];
            }
        });

        // Update address if provided
        if (req.body.address) {
            user.address = { ...user.address, ...req.body.address };
        }

        await user.save();

        res.json({
            message: 'User updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                isEmailVerified: user.isEmailVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Delete user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        // Check if user has orders
        const orderCount = await Order.countDocuments({ user: user._id });
        if (orderCount > 0) {
            return res.status(400).json({
                message: 'Cannot delete user with existing orders. Consider deactivating instead.'
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// @desc    Get user statistics (Admin)
// @route   GET /api/users/stats/overview
// @access  Private/Admin
router.get('/stats/overview', protect, admin, async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const adminUsers = await User.countDocuments({ role: 'admin' });
        const regularUsers = await User.countDocuments({ role: 'user' });
        const verifiedUsers = await User.countDocuments({ isEmailVerified: true });

        // Recent users
        const recentUsers = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(5);

        // User registration trend (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const registrationTrend = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Top customers by order value
        const topCustomers = await Order.aggregate([
            {
                $match: { isPaid: true }
            },
            {
                $group: {
                    _id: '$user',
                    totalSpent: { $sum: '$totalPrice' },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    name: '$user.name',
                    email: '$user.email',
                    totalSpent: 1,
                    orderCount: 1
                }
            },
            {
                $sort: { totalSpent: -1 }
            },
            {
                $limit: 10
            }
        ]);

        res.json({
            totalUsers,
            adminUsers,
            regularUsers,
            verifiedUsers,
            recentUsers,
            registrationTrend,
            topCustomers
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Create admin user (Super Admin only)
// @route   POST /api/users/create-admin
// @access  Private/Admin
router.post('/create-admin', protect, admin, [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
], async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create admin user
        const user = await User.create({
            name,
            email,
            password,
            role: 'admin',
            isEmailVerified: true
        });

        res.status(201).json({
            message: 'Admin user created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Toggle user status (Admin)
// @route   PUT /api/users/:id/toggle-status
// @access  Private/Admin
router.put('/:id/toggle-status', protect, admin, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from deactivating themselves
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot modify your own account status' });
        }

        // Toggle email verification status (used as active/inactive)
        user.isEmailVerified = !user.isEmailVerified;
        await user.save();

        res.json({
            message: `User ${user.isEmailVerified ? 'activated' : 'deactivated'} successfully`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isEmailVerified: user.isEmailVerified
            }
        });
    } catch (error) {
        next(error);
    }
});



module.exports = router;