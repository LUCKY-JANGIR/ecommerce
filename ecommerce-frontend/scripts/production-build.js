#!/usr/bin/env node

/**
 * Production Build Script for Ecommerce Frontend
 * This script validates the production environment and performs pre-deployment checks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting frontend production build validation...\n');

// Check if we're in production mode
if (process.env.NODE_ENV !== 'production') {
  console.log('⚠️  Warning: NODE_ENV is not set to production');
  console.log('   Setting NODE_ENV=production for this build...\n');
  process.env.NODE_ENV = 'production';
}

// Required environment variables for production
const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL'
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

// Validate API URL format
if (process.env.NEXT_PUBLIC_API_URL) {
  try {
    const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL);
    if (!apiUrl.protocol.startsWith('http')) {
      throw new Error('API URL must use HTTP or HTTPS protocol');
    }
    console.log('✅ API URL format is valid');
  } catch (error) {
    console.error('❌ Invalid API URL format:', error.message);
    process.exit(1);
  }
}

console.log('');

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

const requiredScripts = ['build', 'start'];
const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);

if (missingScripts.length > 0) {
  console.error('❌ Missing required scripts in package.json:');
  missingScripts.forEach(script => console.error(`   - ${script}`));
  process.exit(1);
}

console.log('✅ Package.json validation passed\n');

// Check TypeScript configuration
console.log('📝 Validating TypeScript configuration...');
const tsConfigPath = path.join(__dirname, '..', 'tsconfig.json');
if (!fs.existsSync(tsConfigPath)) {
  console.error('❌ TypeScript configuration file not found');
  process.exit(1);
}

try {
  const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
  if (!tsConfig.compilerOptions) {
    throw new Error('Invalid TypeScript configuration');
  }
  console.log('✅ TypeScript configuration is valid\n');
} catch (error) {
  console.error('❌ TypeScript configuration error:', error.message);
  process.exit(1);
}

// Check Next.js configuration
console.log('⚙️  Validating Next.js configuration...');
const nextConfigPath = path.join(__dirname, '..', 'next.config.ts');
if (!fs.existsSync(nextConfigPath)) {
  console.error('❌ Next.js configuration file not found');
  process.exit(1);
}

console.log('✅ Next.js configuration found\n');

// Run type checking
console.log('🔍 Running TypeScript type checking...');
try {
  execSync('npm run type-check', { stdio: 'inherit' });
  console.log('✅ Type checking passed\n');
} catch (error) {
  console.error('❌ Type checking failed. Please fix TypeScript errors before deploying.');
  process.exit(1);
}

// Run linting
console.log('🧹 Running ESLint...');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ Linting passed\n');
} catch (error) {
  console.error('❌ Linting failed. Please fix linting errors before deploying.');
  process.exit(1);
}

// Check for build optimization
console.log('⚡ Checking build optimizations...');
const nextConfig = require('../next.config.ts');
if (nextConfig.output !== 'standalone') {
  console.log('⚠️  Consider using output: "standalone" for better deployment optimization');
}

if (!nextConfig.compiler?.removeConsole) {
  console.log('⚠️  Consider enabling removeConsole in production for smaller bundle size');
}

console.log('✅ Build optimization checks completed\n');

// Final validation summary
console.log('🎉 Frontend production build validation completed successfully!');
console.log('\n📋 Deployment Checklist:');
console.log('   ✅ Environment variables configured');
console.log('   ✅ Security audit passed');
console.log('   ✅ TypeScript configuration valid');
console.log('   ✅ Next.js configuration ready');
console.log('   ✅ Type checking passed');
console.log('   ✅ Linting passed');
console.log('   ✅ Package.json scripts verified');
console.log('\n🚀 Ready for production build!');
console.log('\nNext steps:');
console.log('   1. Run: npm run build');
console.log('   2. Deploy the .next folder to your hosting platform (Vercel, Netlify, etc.)');
console.log('   3. Set environment variables in your hosting platform');
console.log('   4. Monitor build logs for any issues'); 