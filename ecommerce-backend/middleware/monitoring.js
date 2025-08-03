const os = require('os');

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
    const start = Date.now();
    
    // Monitor response time
    res.on('finish', () => {
        const duration = Date.now() - start;
        const memoryUsage = process.memoryUsage();
        
        // Log slow requests
        if (duration > 1000) {
            console.warn(`Slow request: ${req.method} ${req.url} took ${duration}ms`);
        }
        
        // Log memory usage if high
        const memoryUsagePercent = memoryUsage.heapUsed / memoryUsage.heapTotal;
        if (memoryUsagePercent > 0.8) {
            console.warn(`High memory usage: ${(memoryUsagePercent * 100).toFixed(2)}%`);
        }
        
        // Log request metrics in production
        if (process.env.NODE_ENV === 'production') {
            console.log(`Request: ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
        }
    });
    
    next();
};

// System health check
const systemHealth = () => {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = os.loadavg();
    const uptime = process.uptime();
    
    return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(uptime),
        memory: {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            external: Math.round(memoryUsage.external / 1024 / 1024),
            percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
        },
        cpu: {
            load1: cpuUsage[0],
            load5: cpuUsage[1],
            load15: cpuUsage[2]
        },
        platform: {
            node: process.version,
            platform: os.platform(),
            arch: os.arch()
        }
    };
};

// Error tracking middleware
const errorTracker = (error, req, res, next) => {
    const errorInfo = {
        timestamp: new Date().toISOString(),
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack
        },
        request: {
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: req.body,
            params: req.params,
            query: req.query,
            ip: req.ip,
            userAgent: req.get('User-Agent')
        },
        user: req.user ? {
            id: req.user._id,
            email: req.user.email,
            role: req.user.role
        } : null,
        system: systemHealth()
    };
    
    // Log error details
    console.error('Error tracked:', JSON.stringify(errorInfo, null, 2));
    
    // In production, you would send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
        // Example: Send to Sentry, LogRocket, or your custom error tracking service
        // sendToErrorService(errorInfo);
    }
    
    next(error);
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            contentLength: res.get('Content-Length') || 0
        };
        
        // Log in a structured format
        console.log(`[${logData.timestamp}] ${logData.method} ${logData.url} ${logData.statusCode} ${logData.duration}`);
    });
    
    next();
};

// Security monitoring middleware
const securityMonitor = (req, res, next) => {
    // Monitor for suspicious requests
    const suspiciousPatterns = [
        /\.\.\//, // Directory traversal
        /<script/i, // XSS attempts
        /union\s+select/i, // SQL injection attempts
        /eval\s*\(/i, // Code injection
        /document\.cookie/i // Cookie theft attempts
    ];
    
    const requestString = JSON.stringify({
        url: req.url,
        body: req.body,
        headers: req.headers
    });
    
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(requestString)) {
            console.warn(`Suspicious request detected: ${req.method} ${req.url} from ${req.ip}`);
            // In production, you might want to block these requests
            // return res.status(403).json({ error: 'Suspicious request detected' });
        }
    }
    
    next();
};

module.exports = {
    performanceMonitor,
    systemHealth,
    errorTracker,
    requestLogger,
    securityMonitor
}; 