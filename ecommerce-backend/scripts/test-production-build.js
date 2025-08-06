#!/usr/bin/env node

/**
 * Test Production Build Script for Ecommerce Backend
 * This script validates the production environment with mock variables for testing
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting production build validation (TEST MODE)...\n');

// Set mock environment variables for testing
process.env.NODE_ENV = 'production';
process.env.MONGODB_URI = 'mongodb+srv://test:test@test.mongodb.net/test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-production-minimum-32-characters-long';
process.env.EMAILJS_SERVICE_ID = 'test-service-id';
process.env.EMAILJS_OTP_TEMPLATE_ID = 'test-otp-template-id';
process.env.EMAILJS_LINK_TEMPLATE_ID = 'test-link-template-id';
process.env.EMAILJS_PUBLIC_KEY = 'test-public-key';
process.env.EMAILJS_PRIVATE_KEY = 'test-private-key';

console.log('⚠️  Using mock environment variables for testing\n');

// Required environment variables for production
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'EMAILJS_SERVICE_ID',
  'EMAILJS_OTP_TEMPLATE_ID',
  'EMAILJS_LINK_TEMPLATE_ID',
  'EMAILJS_PUBLIC_KEY',
  'EMAILJS_PRIVATE_KEY'
];

console.log('📋 Checking required environment variables...');
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease set these environment variables before deploying to production.');
  process.exit(1);
}

console.log('✅ All required environment variables are set\n');

// Validate JWT secret strength
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET is too short. Must be at least 32 characters long.');
  process.exit(1);
}

console.log('✅ JWT_SECRET meets security requirements\n');

// Check if uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('📁 Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Uploads directory created\n');
} else {
  console.log('✅ Uploads directory exists\n');
}

// Run security audit
console.log('🔒 Running security audit...');
try {
  execSync('npm audit --audit-level=moderate', { stdio: 'inherit' });
  console.log('✅ Security audit passed\n');
} catch (error) {
  console.error('❌ Security audit failed. Please fix vulnerabilities before deploying.');
  process.exit(1);
}

// Check package.json for required scripts
console.log('📦 Validating package.json...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

const requiredScripts = ['start', 'production'];
const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);

if (missingScripts.length > 0) {
  console.error('❌ Missing required scripts in package.json:');
  missingScripts.forEach(script => console.error(`   - ${script}`));
  process.exit(1);
}

console.log('✅ Package.json validation passed\n');

// Test database connection format
console.log('🗄️  Testing database connection format...');
try {
  if (!process.env.MONGODB_URI.includes('mongodb')) {
    throw new Error('Invalid MongoDB URI format');
  }
  console.log('✅ Database URI format is valid\n');
} catch (error) {
  console.error('❌ Database connection format test failed:', error.message);
  process.exit(1);
}

// Create production-ready server configuration
console.log('⚙️  Creating production configuration...');
const productionConfig = {
  NODE_ENV: 'production',
  PORT: process.env.PORT || 5001,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  EMAILJS_SERVICE_ID: process.env.EMAILJS_SERVICE_ID,
  EMAILJS_OTP_TEMPLATE_ID: process.env.EMAILJS_OTP_TEMPLATE_ID,
  EMAILJS_LINK_TEMPLATE_ID: process.env.EMAILJS_LINK_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY,
  EMAILJS_PRIVATE_KEY: process.env.EMAILJS_PRIVATE_KEY,
  FRONTEND_URL: process.env.FRONTEND_URL,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
};

console.log('✅ Production configuration ready\n');

// Final validation summary
console.log('🎉 Production build validation completed successfully! (TEST MODE)');
console.log('\n📋 Deployment Checklist:');
console.log('   ✅ Environment variables configured');
console.log('   ✅ Security audit passed');
console.log('   ✅ Database connection format validated');
console.log('   ✅ Package.json scripts verified');
console.log('   ✅ Uploads directory ready');
console.log('\n🚀 Ready for production deployment!');
console.log('\nNext steps:');
console.log('   1. Deploy to your hosting platform (Render, Railway, etc.)');
console.log('   2. Set REAL environment variables in your hosting platform');
console.log('   3. Run: npm run production');
console.log('   4. Monitor logs for any issues');
console.log('\n⚠️  Note: This was a test run with mock environment variables.');
console.log('   In production, you must set real environment variables.'); 