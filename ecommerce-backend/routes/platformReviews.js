const express = require('express');
const { body, validationResult } = require('express-validator');
const PlatformReview = require('../models/PlatformReview');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/reviews - public, get all platform reviews
router.get('/', async (req, res, next) => {
    try {
        const reviews = await PlatformReview.find().populate('user', 'name').sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (err) {
        next(err);
    }
});

// POST /api/reviews - private, add a new platform review
router.post('/',
    protect,
    [
        body('comment').trim().isLength({ min: 10, max: 500 }).withMessage('Comment must be between 10 and 500 characters')
    ],
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        try {
            const { comment } = req.body;
            const review = new PlatformReview({
                user: req.user._id,
                comment: comment.trim()
            });
            await review.save();
            await review.populate('user', 'name');
            res.status(201).json({ success: true, review });
        } catch (err) {
            next(err);
        }
    }
);

module.exports = router;