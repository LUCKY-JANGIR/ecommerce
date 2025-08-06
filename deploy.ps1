# Production Deployment Script for Ecommerce Application (PowerShell)
# This script helps automate the deployment process

Write-Host "🚀 Starting Production Deployment..." -ForegroundColor Green

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "Please run this script from the project root directory"
    exit 1
}

Write-Host ""
Write-Host "📋 Pre-deployment Checklist:" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Check if environment files exist
if (Test-Path "ecommerce-backend/env.production.template") {
    Write-Status "Backend environment template found"
} else {
    Write-Error "Backend environment template not found"
}

if (Test-Path "ecommerce-frontend/env.production.template") {
    Write-Status "Frontend environment template found"
} else {
    Write-Error "Frontend environment template not found"
}

# Check if production build scripts exist
if (Test-Path "ecommerce-backend/scripts/production-build.js") {
    Write-Status "Backend production build script found"
} else {
    Write-Error "Backend production build script not found"
}

if (Test-Path "ecommerce-frontend/scripts/production-build.js") {
    Write-Status "Frontend production build script found"
} else {
    Write-Error "Frontend production build script not found"
}

Write-Host ""
Write-Host "🔧 Environment Setup Instructions:" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "1. Backend Environment Variables:" -ForegroundColor Yellow
Write-Host "   Copy ecommerce-backend/env.production.template to .env.production"
Write-Host "   Update with your actual production values:"
Write-Host "   - MONGODB_URI"
Write-Host "   - JWT_SECRET"
Write-Host "   - EMAILJS_* variables"
Write-Host "   - FRONTEND_URL"

Write-Host ""
Write-Host "2. Frontend Environment Variables:" -ForegroundColor Yellow
Write-Host "   Copy ecommerce-frontend/env.production.template to .env.production.local"
Write-Host "   Update with your actual production values:"
Write-Host "   - NEXT_PUBLIC_API_URL"

Write-Host ""
Write-Host "🚀 Deployment Commands:" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Backend Deployment:" -ForegroundColor Yellow
Write-Host "cd ecommerce-backend"
Write-Host "npm install --production"
Write-Host "npm run production"

Write-Host ""
Write-Host "Frontend Deployment:" -ForegroundColor Yellow
Write-Host "cd ecommerce-frontend"
Write-Host "npm install"
Write-Host "npm run build"
Write-Host "npm run production"

Write-Host ""
Write-Host "📊 Post-Deployment Verification:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "1. Test Backend Health:" -ForegroundColor Yellow
Write-Host "   curl https://your-backend-domain.com/api/health"

Write-Host ""
Write-Host "2. Test Frontend:" -ForegroundColor Yellow
Write-Host "   Visit https://your-frontend-domain.com"

Write-Host ""
Write-Host "3. Test Integration:" -ForegroundColor Yellow
Write-Host "   - User registration/login"
Write-Host "   - Product browsing"
Write-Host "   - Cart functionality"
Write-Host "   - Checkout process"

Write-Host ""
Write-Host "📈 Monitoring Setup:" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

Write-Host ""
Write-Host "1. Set up uptime monitoring:" -ForegroundColor Yellow
Write-Host "   - UptimeRobot"
Write-Host "   - Pingdom"
Write-Host "   - StatusCake"

Write-Host ""
Write-Host "2. Set up error tracking:" -ForegroundColor Yellow
Write-Host "   - Sentry"
Write-Host "   - LogRocket"
Write-Host "   - Bugsnag"

Write-Host ""
Write-Host "3. Set up analytics:" -ForegroundColor Yellow
Write-Host "   - Google Analytics"
Write-Host "   - Mixpanel"
Write-Host "   - Amplitude"

Write-Host ""
Write-Status "Deployment script completed!"
Write-Host ""
Write-Host "📚 Additional Resources:" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host "- PRODUCTION_DEPLOYMENT.md - Detailed deployment guide"
Write-Host "- PRODUCTION_BUILD_RESULTS.md - Build validation results"
Write-Host "- ecommerce-backend/README.md - Backend documentation"
Write-Host "- ecommerce-frontend/README.md - Frontend documentation"

Write-Host ""
Write-Host "🎉 Your application is ready for production deployment!" -ForegroundColor Green
Write-Host ""
Write-Host "Remember to:" -ForegroundColor Yellow
Write-Host "1. Set up proper SSL certificates"
Write-Host "2. Configure custom domains"
Write-Host "3. Set up database backups"
Write-Host "4. Monitor application performance"
Write-Host "5. Set up alerting for critical issues" -ForegroundColor Yellow 