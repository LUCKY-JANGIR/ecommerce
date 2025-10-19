require('dotenv').config();         

// Validate required environment variables
const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'EMAILJS_SERVICE_ID',
    'EMAILJS_OTP_TEMPLATE_ID',
    'EMAILJS_LINK_TEMPLATE_ID',
    'EMAILJS_PUBLIC_KEY',
    'EMAILJS_PRIVATE_KEY'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('Please check your .env file and restart the server.');
    process.exit(1);
}

console.log('✅ All required environment variables are set');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { 
    performanceMonitor, 
    errorTracker, 
    requestLogger, 
    securityMonitor,
    systemHealth 
} = require('./middleware/monitoring');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const uploadRoutes = require('./routes/upload');
const platformReviewsRoute = require('./routes/platformReviews');
const parameterRoutes = require('./routes/parameters');

console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('Using URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
const app = express();
app.set('trust proxy', 1); // trust first proxy for Render and similar platforms

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// Additional security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Monitoring middleware
app.use(performanceMonitor);
app.use(requestLogger);
app.use(securityMonitor);

// Rate limiting - more lenient for development
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased from 100 to 1000 for development
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to all routes except health checks
app.use('/api', limiter);

// Skip rate limiting for health checks
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/api/system-health', (req, res) => {
    res.json(systemHealth());
});

// CORS configuration
const allowedOrigins = [
    'http://localhost:3000', // Development frontend
    'https://your-frontend-app-name.vercel.app', // Production frontend (replace with your actual Vercel URL)
    process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploaded images
app.use('/uploads', express.static('uploads'));

// Database connection with improved options
const mongoUri = process.env.MONGODB_URI;
const mongooseOptions = {
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout
    socketTimeoutMS: 45000, // 45 seconds socket timeout
    bufferCommands: true, // Enable mongoose buffering for better compatibility
    maxPoolSize: 5, // Reduced from 10 to 5 for better memory management
    minPoolSize: 1, // Minimum number of connections in the pool
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    connectTimeoutMS: 10000, // 10 seconds connection timeout
    retryWrites: true,
    w: 'majority'
};

// Try to connect to MongoDB, but don't fail if it's not available
mongoose.connect(mongoUri, mongooseOptions)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        console.log('📊 Connection pool size:', mongoose.connection.db.serverConfig?.s?.options?.maxPoolSize || 'Default');
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('💡 For development, you can:');
        console.log('   1. Install MongoDB locally: https://docs.mongodb.com/manual/installation/');
        console.log('   2. Use MongoDB Atlas (free): https://www.mongodb.com/atlas');
        console.log('   3. Update MONGODB_URI in .env file');
        console.log('🔄 Server will continue without database connection...');
        
        // Set up a mock database connection for development
        mongoose.connection.readyState = 0; // disconnected
    });

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', platformReviewsRoute);
app.use('/api/parameters', parameterRoutes);

// Error handling middleware (must be after routes)
app.use(notFound);
app.use(errorTracker); // Add error tracking before main error handler
app.use(errorHandler);

// Process-level error handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
    process.exit(1); // Optional: exit process
});

const PORT = process.env.PORT;

// Wake-up bot - Self-ping to prevent server sleep
const startWakeUpBot = () => {
    const PRODUCTION_URL = process.env.PRODUCTION_URL; // Add this to your .env
    
    if (process.env.NODE_ENV === 'production' && PRODUCTION_URL) {
        console.log('🤖 Wake-up bot started - Server will ping itself every 8 minutes');
        
        setInterval(async () => {
            try {
                const response = await fetch(`${PRODUCTION_URL}/api/health`);
                const timestamp = new Date().toISOString();
                
                if (response.ok) {
                    console.log(`✅ [${timestamp}] Wake-up ping successful - Server is alive`);
                } else {
                    console.log(`⚠️ [${timestamp}] Wake-up ping failed with status: ${response.status}`);
                }
            } catch (error) {
                const timestamp = new Date().toISOString();
                console.log(`❌ [${timestamp}] Wake-up ping error:`, error.message);
            }
        }, 8 * 60 * 1000); // Ping every 8 minutes (before 10-minute sleep)
    }
};

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startWakeUpBot(); // Start the wake-up bot after server starts
}); 
