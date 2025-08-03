// Production configuration for ecommerce backend
module.exports = {
  // Database configuration
  database: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    bufferCommands: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },

  // Security configuration
  security: {
    bcryptRounds: 12,
    jwtExpiresIn: '7d',
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100, // requests per window
    corsOrigins: [
      'https://your-frontend-domain.com', // Replace with your actual frontend domain
      process.env.FRONTEND_URL
    ].filter(Boolean),
  },

  // File upload configuration
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ],
    uploadPath: 'uploads/products/',
  },

  // Logging configuration
  logging: {
    level: 'info',
    format: 'combined',
    maxFiles: 5,
    maxSize: '10m',
  },

  // Performance configuration
  performance: {
    compression: true,
    cacheControl: true,
    etag: true,
  },

  // Monitoring configuration
  monitoring: {
    healthCheckInterval: 30000, // 30 seconds
    memoryThreshold: 0.9, // 90% memory usage
    cpuThreshold: 0.8, // 80% CPU usage
  }
}; 