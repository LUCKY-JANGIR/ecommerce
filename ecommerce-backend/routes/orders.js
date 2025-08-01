const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, [
    body('orderItems')
        .isArray({ min: 1 })
        .withMessage('Order must contain at least one item'),
    body('orderItems.*.product')
        .isMongoId()
        .withMessage('Invalid product ID'),
    body('orderItems.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1'),
    body('shippingAddress.fullName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters'),
    body('shippingAddress.address')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Address must be between 5 and 200 characters'),
    body('shippingAddress.city')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('City must be between 2 and 50 characters'),
    body('shippingAddress.postalCode')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('Postal code must be between 3 and 20 characters'),
    body('shippingAddress.country')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Country must be between 2 and 50 characters'),
    body('shippingAddress.phone')
        .isMobilePhone()
        .withMessage('Please enter a valid phone number'),
    body('paymentMethod')
        .isIn(['PayPal', 'Stripe', 'Credit Card', 'Cash on Delivery', 'Negotiable'])
        .withMessage('Invalid payment method')
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

        const { orderItems, shippingAddress, paymentMethod } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items provided' });
        }

        // Validate and process order items
        const processedOrderItems = orderItems.map(item => ({
            product: item.product,
            name: item.name || 'Product',
            image: item.image || '',
            price: 0, // Negotiable
            quantity: item.quantity
        }));

        // Create order
        const order = await Order.create({
            user: req.user._id,
            orderItems: processedOrderItems,
            shippingAddress,
            paymentMethod: 'Negotiable',
            itemsPrice: 0,
            taxPrice: 0,
            shippingPrice: 0,
            totalPrice: 0,
            negotiationNotes: '',
        });

        // Reduce product stock
        for (const item of processedOrderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(400).json({ message: `Product ${item.name} not found` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${item.name}. Available: ${product.stock}, Requested: ${item.quantity}`
                });
            }

            product.reduceStock(item.quantity);
            await product.save();
        }

        // Populate order details
        const populatedOrder = await Order.findById(order._id)
            .populate('user', 'name email')
            .populate('orderItems.product', 'name images');

        res.status(201).json({
            message: 'Order created successfully',
            order: populatedOrder
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
router.get('/my-orders', protect, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find({ user: req.user._id })
            .populate('orderItems.product', 'name images')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments({ user: req.user._id });

        res.json({
            orders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalOrders: total,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('orderItems.product', 'name images');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Users can only view their own orders, admins can view all
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        next(error);
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(500).json({ message: 'Server error fetching order' });
    }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
router.put('/:id/pay', protect, [
    body('paymentResult.id').notEmpty().withMessage('Payment ID is required'),
    body('paymentResult.status').notEmpty().withMessage('Payment status is required'),
    body('paymentResult.email_address').optional().isEmail().withMessage('Invalid email address')
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

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Users can only update their own orders, admins can update all
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        if (order.isPaid) {
            return res.status(400).json({ message: 'Order is already paid' });
        }

        // Mark as paid
        order.markAsPaid(req.body.paymentResult);
        await order.save();

        res.json({
            message: 'Order marked as paid',
            order
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Users can only cancel their own orders, admins can cancel all
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to cancel this order' });
        }

        if (order.orderStatus === 'Delivered') {
            return res.status(400).json({ message: 'Cannot cancel delivered order' });
        }

        if (order.orderStatus === 'Cancelled') {
            return res.status(400).json({ message: 'Order is already cancelled' });
        }

        // Restore product stock
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        // Cancel order
        order.cancelOrder(req.body.reason);
        await order.save();

        res.json({
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        next(error);
    }
});

// ADMIN ROUTES

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Build filter
        const filter = {};
        if (req.query.status) {
            filter.orderStatus = req.query.status;
        }
        if (req.query.isPaid !== undefined) {
            filter.isPaid = req.query.isPaid === 'true';
        }

        const orders = await Order.find(filter)
            .populate('user', 'name email')
            .populate('orderItems.product', 'name images')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments(filter);

        res.json({
            orders,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalOrders: total,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, admin, [
    body('status')
        .isIn(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'])
        .withMessage('Invalid order status')
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

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const { status, trackingNumber, estimatedDelivery } = req.body;

        // Ensure order items have required fields
        if (order.orderItems && order.orderItems.length > 0) {
            for (let item of order.orderItems) {
                if (!item.name) item.name = 'Product';
                if (!item.image) item.image = '';
            }
        }

        // Update order status
        order.orderStatus = status;

        // Handle specific status updates
        if (status === 'Delivered') {
            order.markAsDelivered();
        } else if (status === 'Shipped' && trackingNumber) {
            order.updateTracking(trackingNumber, estimatedDelivery);
        }

        await order.save();

        res.json({
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        console.error('Order status update error:', error);
        next(error);
    }
});

// @desc    Update negotiation notes (Admin)
// @route   PUT /api/orders/:id/negotiation
// @access  Private/Admin
router.put('/:id/negotiation', protect, admin, async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        order.negotiationNotes = req.body.negotiationNotes || order.negotiationNotes;
        await order.save();
        res.json({ message: 'Negotiation notes updated', order });
    } catch (error) {
        next(error);
    }
});

// @desc    Update payment status (Admin)
// @route   PUT /api/orders/:id/payment-status
// @access  Private/Admin
router.put('/:id/payment-status', protect, admin, [
    body('isPaid')
        .isBoolean()
        .withMessage('isPaid must be a boolean value')
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

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const { isPaid } = req.body;

        // Update payment status
        order.isPaid = isPaid;
        if (isPaid) {
            order.paidAt = new Date();
            // If order is being marked as paid, also update status to Processing
            if (order.orderStatus === 'Pending') {
                order.orderStatus = 'Processing';
            }
        } else {
            order.paidAt = null;
        }

        await order.save();

        res.json({
            message: 'Payment status updated successfully',
            order
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Get order statistics (Admin)
// @route   GET /api/orders/stats/overview
// @access  Private/Admin
router.get('/stats/overview', protect, admin, async (req, res, next) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
        const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
        const cancelledOrders = await Order.countDocuments({ orderStatus: 'Cancelled' });

        // Calculate total revenue
        const revenueResult = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueResult[0]?.totalRevenue || 0;

        // Recent orders
        const recentOrders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            totalOrders,
            pendingOrders,
            deliveredOrders,
            cancelledOrders,
            totalRevenue,
            recentOrders
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;