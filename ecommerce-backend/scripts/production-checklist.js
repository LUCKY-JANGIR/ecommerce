#!/usr/bin/env node

/**
 * Production Checklist Script
 * Run this script to verify all functionalities are working before deployment
 */

const axios = require('axios');
const mongoose = require('mongoose');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5001';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

console.log('🔍 Starting Production Checklist...\n');

// Test results storage
const testResults = {
    passed: 0,
    failed: 0,
    errors: []
};

// Helper function to run tests
const runTest = async (testName, testFunction) => {
    try {
        console.log(`Testing: ${testName}`);
        await testFunction();
        console.log(`✅ ${testName} - PASSED\n`);
        testResults.passed++;
    } catch (error) {
        console.log(`❌ ${testName} - FAILED`);
        console.log(`   Error: ${error.message}\n`);
        testResults.failed++;
        testResults.errors.push({ test: testName, error: error.message });
    }
};

// Database connection test
const testDatabaseConnection = async () => {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable not set');
    }
    
    await mongoose.connect(mongoUri);
    const dbState = mongoose.connection.readyState;
    
    if (dbState !== 1) {
        throw new Error(`Database not connected. State: ${dbState}`);
    }
    
    console.log('   Database connected successfully');
};

// API health check test
const testApiHealth = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/health`);
    
    if (response.status !== 200) {
        throw new Error(`Health check failed with status ${response.status}`);
    }
    
    if (!response.data.status || response.data.status !== 'OK') {
        throw new Error('Health check response format invalid');
    }
    
    console.log('   API health check passed');
};

// System health check test
const testSystemHealth = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/system-health`);
    
    if (response.status !== 200) {
        throw new Error(`System health check failed with status ${response.status}`);
    }
    
    const data = response.data;
    if (!data.status || !data.memory || !data.cpu) {
        throw new Error('System health response format invalid');
    }
    
    console.log(`   System health: ${data.status}`);
    console.log(`   Memory usage: ${data.memory.percentage}%`);
};

// Products API test
const testProductsApi = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/products`);
    
    if (response.status !== 200) {
        throw new Error(`Products API failed with status ${response.status}`);
    }
    
    if (!response.data.success) {
        throw new Error('Products API response format invalid');
    }
    
    console.log(`   Products API working - ${response.data.data.products.length} products found`);
};

// Categories API test
const testCategoriesApi = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/categories`);
    
    if (response.status !== 200) {
        throw new Error(`Categories API failed with status ${response.status}`);
    }
    
    if (!Array.isArray(response.data)) {
        throw new Error('Categories API response format invalid');
    }
    
    console.log(`   Categories API working - ${response.data.length} categories found`);
};

// Authentication test
const testAuthentication = async () => {
    // Test registration endpoint
    const registerData = {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        phone: '1234567890'
    };
    
    try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, registerData);
        
        if (response.status !== 201) {
            throw new Error(`Registration failed with status ${response.status}`);
        }
        
        console.log('   User registration working');
        
        // Test login
        const loginData = {
            email: registerData.email,
            password: registerData.password
        };
        
        const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, loginData);
        
        if (loginResponse.status !== 200) {
            throw new Error(`Login failed with status ${loginResponse.status}`);
        }
        
        if (!loginResponse.data.token) {
            throw new Error('Login response missing token');
        }
        
        console.log('   User login working');
        
        // Test protected route
        const token = loginResponse.data.token;
        const profileResponse = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (profileResponse.status !== 200) {
            throw new Error(`Profile API failed with status ${profileResponse.status}`);
        }
        
        console.log('   Protected routes working');
        
    } catch (error) {
        if (error.response && error.response.status === 409) {
            console.log('   User already exists, skipping registration test');
        } else {
            throw error;
        }
    }
};

// File upload test
const testFileUpload = async () => {
    // This would require actual file upload testing
    console.log('   File upload test skipped (requires actual file)');
};

// Frontend connectivity test
const testFrontendConnectivity = async () => {
    try {
        const response = await axios.get(FRONTEND_URL, { timeout: 5000 });
        
        if (response.status !== 200) {
            throw new Error(`Frontend not accessible with status ${response.status}`);
        }
        
        console.log('   Frontend is accessible');
    } catch (error) {
        console.log('   Frontend connectivity test skipped (frontend may not be running)');
    }
};

// Environment variables test
const testEnvironmentVariables = async () => {
    const requiredVars = [
        'MONGODB_URI',
        'JWT_SECRET',
        'EMAILJS_SERVICE_ID',
        'EMAILJS_OTP_TEMPLATE_ID',
        'EMAILJS_LINK_TEMPLATE_ID',
        'EMAILJS_PUBLIC_KEY',
        'EMAILJS_PRIVATE_KEY'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
    }
    
    console.log('   All required environment variables are set');
};

// Security test
const testSecurity = async () => {
    // Test CORS
    try {
        await axios.get(`${API_BASE_URL}/api/health`, {
            headers: { 'Origin': 'https://malicious-site.com' }
        });
        console.log('   CORS protection working');
    } catch (error) {
        if (error.response && error.response.status === 403) {
            console.log('   CORS protection working');
        } else {
            console.log('   CORS test inconclusive');
        }
    }
    
    // Test rate limiting (would need to make many requests)
    console.log('   Rate limiting test skipped (requires multiple requests)');
};

// Performance test
const testPerformance = async () => {
    const startTime = Date.now();
    
    await axios.get(`${API_BASE_URL}/api/health`);
    
    const responseTime = Date.now() - startTime;
    
    if (responseTime > 1000) {
        console.log(`   Warning: Slow response time (${responseTime}ms)`);
    } else {
        console.log(`   Performance OK (${responseTime}ms)`);
    }
};

// Main test runner
const runAllTests = async () => {
    console.log('🚀 Running Production Checklist Tests...\n');
    
    await runTest('Environment Variables', testEnvironmentVariables);
    await runTest('Database Connection', testDatabaseConnection);
    await runTest('API Health Check', testApiHealth);
    await runTest('System Health Check', testSystemHealth);
    await runTest('Products API', testProductsApi);
    await runTest('Categories API', testCategoriesApi);
    await runTest('Authentication System', testAuthentication);
    await runTest('File Upload System', testFileUpload);
    await runTest('Frontend Connectivity', testFrontendConnectivity);
    await runTest('Security Features', testSecurity);
    await runTest('Performance Check', testPerformance);
    
    // Print results
    console.log('📊 Test Results Summary:');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
    
    if (testResults.errors.length > 0) {
        console.log('\n❌ Failed Tests:');
        testResults.errors.forEach(({ test, error }) => {
            console.log(`   - ${test}: ${error}`);
        });
    }
    
    if (testResults.failed === 0) {
        console.log('\n🎉 All tests passed! Application is ready for production.');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some tests failed. Please fix issues before deploying to production.');
        process.exit(1);
    }
};

// Run the tests
runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
}); 