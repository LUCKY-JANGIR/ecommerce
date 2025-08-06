#!/bin/bash

# Production Deployment Script for Ecommerce Application
# This script helps automate the deployment process

echo "🚀 Starting Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

echo ""
echo "📋 Pre-deployment Checklist:"
echo "============================"

# Check if environment files exist
if [ -f "ecommerce-backend/env.production.template" ]; then
    print_status "Backend environment template found"
else
    print_error "Backend environment template not found"
fi

if [ -f "ecommerce-frontend/env.production.template" ]; then
    print_status "Frontend environment template found"
else
    print_error "Frontend environment template not found"
fi

# Check if production build scripts exist
if [ -f "ecommerce-backend/scripts/production-build.js" ]; then
    print_status "Backend production build script found"
else
    print_error "Backend production build script not found"
fi

if [ -f "ecommerce-frontend/scripts/production-build.js" ]; then
    print_status "Frontend production build script found"
else
    print_error "Frontend production build script not found"
fi

echo ""
echo "🔧 Environment Setup Instructions:"
echo "=================================="

echo ""
echo "1. Backend Environment Variables:"
echo "   Copy ecommerce-backend/env.production.template to .env.production"
echo "   Update with your actual production values:"
echo "   - MONGODB_URI"
echo "   - JWT_SECRET"
echo "   - EMAILJS_* variables"
echo "   - FRONTEND_URL"

echo ""
echo "2. Frontend Environment Variables:"
echo "   Copy ecommerce-frontend/env.production.template to .env.production.local"
echo "   Update with your actual production values:"
echo "   - NEXT_PUBLIC_API_URL"

echo ""
echo "🚀 Deployment Commands:"
echo "======================"

echo ""
echo "Backend Deployment:"
echo "cd ecommerce-backend"
echo "npm install --production"
echo "npm run production"

echo ""
echo "Frontend Deployment:"
echo "cd ecommerce-frontend"
echo "npm install"
echo "npm run build"
echo "npm run production"

echo ""
echo "📊 Post-Deployment Verification:"
echo "================================"

echo ""
echo "1. Test Backend Health:"
echo "   curl https://your-backend-domain.com/api/health"

echo ""
echo "2. Test Frontend:"
echo "   Visit https://your-frontend-domain.com"

echo ""
echo "3. Test Integration:"
echo "   - User registration/login"
echo "   - Product browsing"
echo "   - Cart functionality"
echo "   - Checkout process"

echo ""
echo "📈 Monitoring Setup:"
echo "==================="

echo ""
echo "1. Set up uptime monitoring:"
echo "   - UptimeRobot"
echo "   - Pingdom"
echo "   - StatusCake"

echo ""
echo "2. Set up error tracking:"
echo "   - Sentry"
echo "   - LogRocket"
echo "   - Bugsnag"

echo ""
echo "3. Set up analytics:"
echo "   - Google Analytics"
echo "   - Mixpanel"
echo "   - Amplitude"

echo ""
print_status "Deployment script completed!"
echo ""
echo "📚 Additional Resources:"
echo "======================="
echo "- PRODUCTION_DEPLOYMENT.md - Detailed deployment guide"
echo "- PRODUCTION_BUILD_RESULTS.md - Build validation results"
echo "- ecommerce-backend/README.md - Backend documentation"
echo "- ecommerce-frontend/README.md - Frontend documentation"

echo ""
echo "🎉 Your application is ready for production deployment!"
echo ""
echo "Remember to:"
echo "1. Set up proper SSL certificates"
echo "2. Configure custom domains"
echo "3. Set up database backups"
echo "4. Monitor application performance"
echo "5. Set up alerting for critical issues" 