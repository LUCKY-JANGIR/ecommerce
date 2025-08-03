const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');
const bcrypt = require('bcrypt');
const emailjs = require('@emailjs/nodejs');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY;
const EMAILJS_OTP_TEMPLATE_ID = process.env.EMAILJS_OTP_TEMPLATE_ID;
const EMAILJS_LINK_TEMPLATE_ID = process.env.EMAILJS_LINK_TEMPLATE_ID;

// Rate limiters
const otpSendLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // max 5 OTP requests per hour per IP
    message: { message: 'Too many OTP requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const otpVerifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // max 10 OTP verification attempts per 15 minutes per IP
    message: { message: 'Too many OTP verification attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // max 5 login attempts per 15 minutes per IP
    message: { message: 'Too many login attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// In-memory stores (for demo; use Redis/DB for production)
const otpStore = {};
const verifiedEmails = new Set();
const otpAttempts = {}; // Track OTP verification attempts per email

// Cleanup expired OTPs every 10 minutes
setInterval(() => {
    const now = Date.now();
    Object.keys(otpStore).forEach(email => {
        if (otpStore[email].expires < now) {
            delete otpStore[email];
        }
    });

    // Cleanup old verification attempts
    Object.keys(otpAttempts).forEach(email => {
        if (otpAttempts[email].expires < now) {
            delete otpAttempts[email];
        }
    });
}, 10 * 60 * 1000);

const router = express.Router();

console.log('EMAILJS_SERVICE_ID:', EMAILJS_SERVICE_ID);
console.log('EMAILJS_PUBLIC_KEY:', EMAILJS_PUBLIC_KEY);
console.log('EMAILJS_PRIVATE_KEY:', EMAILJS_PRIVATE_KEY);

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
router.post('/send-otp', otpSendLimiter, async (req, res, next) => {
    try {
        const { email } = req.body;

        // Enhanced email validation
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email address' });
        }

        // Check if user already exists (prevent OTP for existing users)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[email] = {
            otp,
            expires: Date.now() + 10 * 60 * 1000, // 10 min expiry
            attempts: 0 // Track verification attempts
        };

        // Send OTP via EmailJS (Node.js SDK expects both keys)
        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_OTP_TEMPLATE_ID,
            { email: email, passcode: otp },
            {
                publicKey: EMAILJS_PUBLIC_KEY,
                privateKey: EMAILJS_PRIVATE_KEY
            }
        );

        res.json({ message: 'OTP sent to email.' });
    } catch (error) {
        console.error('OTP send error:', error);
        next(error);
    }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', otpVerifyLimiter, async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const record = otpStore[email];
        if (!record) {
            return res.status(400).json({ message: 'OTP not found or expired' });
        }

        // Check if OTP is expired
        if (Date.now() > record.expires) {
            delete otpStore[email];
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Track verification attempts
        record.attempts = (record.attempts || 0) + 1;

        // Limit OTP verification attempts
        if (record.attempts > 5) {
            delete otpStore[email];
            return res.status(400).json({ message: 'Too many OTP verification attempts. Please request a new OTP.' });
        }

        if (record.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // OTP is valid
        verifiedEmails.add(email);
        delete otpStore[email];
        res.json({ message: 'Email verified' });
    } catch (error) {
        next(error);
    }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email')
        .custom(async (email) => {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('User already exists with this email');
            }
            return true;
        }),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('confirmPassword')
        .optional()
        .custom((value, { req }) => {
            if (value !== undefined && value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        })
], async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Log all validation errors for debugging
            console.warn('Registration validation failed:', errors.array());
            const firstError = errors.array()[0];
            return res.status(400).json({
                message: 'Validation failed',
                errors: [firstError]
            });
        }

        const { name, email, password } = req.body;

        // Check if email is verified
        if (!verifiedEmails.has(email)) {
            return res.status(400).json({
                message: 'Please verify your email before registering. Check your email for the OTP and verify before registering.',
                errors: [{ msg: 'Email not verified via OTP', param: 'email', location: 'body' }]
            });
        }
        verifiedEmails.delete(email); // One-time use

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            isEmailVerified: true
        });

        const token = generateToken(user._id);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        // Handle known errors gracefully
        if (error.message && error.message.includes('User already exists')) {
            return res.status(400).json({
                message: 'Registration failed',
                errors: [{ msg: 'User already exists with this email', param: 'email', location: 'body' }]
            });
        }
        // Fallback for unexpected errors
        return res.status(500).json({
            message: 'An unexpected error occurred during registration. Please try again later.',
            errors: [{ msg: error.message || 'Unknown error', param: 'server', location: 'internal' }]
        });
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginLimiter, [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
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

        const { email, password } = req.body;

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.warn(`Login failed: User not found for email ${email}`);
            return res.status(401).json({ message: 'User not found' });
        }

        // Check password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.warn(`Login failed: Incorrect password for email ${email}`);
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                phone: user.phone,
                address: user.address,
                isEmailVerified: user.isEmailVerified,
                lastLogin: user.lastLogin,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
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

        const { name, phone, address } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if provided
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) user.address = { ...user.address, ...address };

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                phone: user.phone,
                address: user.address,
                createdAt: user.createdAt // Ensure createdAt is included
            }
        });
    } catch (error) {
        next(error);
    }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
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

        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.user.id).select('+password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
});

// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Private
router.get('/verify', protect, (req, res) => {
    res.json({
        valid: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        }
    });
});

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Invalid email address' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            // For security, do not reveal if user exists
            return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
        }
        // Generate token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();
        // Send email with reset link
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_LINK_TEMPLATE_ID,
            { email: email, link: resetUrl },
            {
                publicKey: EMAILJS_PUBLIC_KEY,
                privateKey: EMAILJS_PRIVATE_KEY
            }
        );
        res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    } catch (error) {
        next(error);
    }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res, next) => {
    try {
        const { email, token, newPassword } = req.body;
        if (!email || !token || !newPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const user = await User.findOne({ email });
        if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        if (user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ message: 'Reset token has expired' });
        }
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        if (tokenHash !== user.resetPasswordToken) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;