const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Validate token format
            if (!token || token === 'null' || token === 'undefined') {
                return res.status(401).json({ message: 'Invalid token format' });
            }

            // Verify token
            const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
            const decoded = jwt.verify(token, jwtSecret);

            // Get user from token (excluding password)
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }

            next();
        } catch (error) {
            console.error('Token verification error:', error.message);

            // Handle specific JWT errors
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid token' });
            } else if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired' });
            } else {
                return res.status(401).json({ message: 'Not authorized, token failed' });
            }
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Admin middleware - check if user is admin
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as admin' });
    }
};

// Optional auth - doesn't require token but adds user if present
const optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Validate token format
            if (!token || token === 'null' || token === 'undefined') {
                req.user = null;
                return next();
            }

            const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
            const decoded = jwt.verify(token, jwtSecret);
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            // Token is invalid but we don't fail the request
            console.log('Optional auth token error:', error.message);
            req.user = null;
        }
    }

    next();
};

// Generate JWT token
const generateToken = (id) => {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-for-development';
    return jwt.sign({ id }, jwtSecret, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

module.exports = {
    protect,
    admin,
    optionalAuth,
    generateToken
};