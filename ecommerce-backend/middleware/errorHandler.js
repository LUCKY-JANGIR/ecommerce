const mongoose = require('mongoose');

// Custom error class for API errors
class ApiError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
        user: req.user ? req.user._id : 'Not authenticated'
    });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new ApiError(message, 404);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        const message = `${field} with value "${value}" already exists`;
        error = new ApiError(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new ApiError(message, 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new ApiError(message, 401);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new ApiError(message, 401);
    }

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        const message = 'File too large';
        error = new ApiError(message, 400);
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        const message = 'Too many files';
        error = new ApiError(message, 400);
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        const message = 'Unexpected file field';
        error = new ApiError(message, 400);
    }

    // CORS errors
    if (err.message === 'Not allowed by CORS') {
        const message = 'CORS policy violation';
        error = new ApiError(message, 403);
    }

    // Rate limit errors
    if (err.status === 429) {
        const message = 'Too many requests, please try again later';
        error = new ApiError(message, 429);
    }

    // Database connection errors
    if (err.name === 'MongooseServerSelectionError') {
        const message = 'Database connection failed';
        error = new ApiError(message, 503);
    }

    // Default error
    if (!error.statusCode) {
        error.statusCode = 500;
        error.message = 'Internal server error';
    }

    // Send error response
    res.status(error.statusCode).json({
        success: false,
        error: {
            message: error.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        },
        ...(process.env.NODE_ENV === 'development' && {
            details: {
                name: err.name,
                code: err.code,
                url: req.url,
                method: req.method,
                timestamp: new Date().toISOString()
            }
        })
    });
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Not found handler
const notFound = (req, res, next) => {
    const error = new ApiError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};

module.exports = {
    ApiError,
    errorHandler,
    asyncHandler,
    notFound
}; 