# Production Deployment Guide

This guide will help you deploy your ecommerce application to production.

## 🚀 Quick Start

### 1. Backend Deployment (Node.js/Express)

#### Option A: Deploy to Render (Recommended)
1. Push your code to GitHub
2. Connect your repository to Render
3. Create a new Web Service
4. Set the following environment variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-super-secure-jwt-secret-key
   EMAILJS_SERVICE_ID=your-emailjs-service-id
   EMAILJS_OTP_TEMPLATE_ID=your-otp-template-id
   EMAILJS_LINK_TEMPLATE_ID=your-link-template-id
   EMAILJS_PUBLIC_KEY=your-emailjs-public-key
   EMAILJS_PRIVATE_KEY=your-emailjs-private-key
   FRONTEND_URL=https://your-frontend-domain.com
   ```

#### Option B: Deploy to Railway
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

#### Option C: Deploy to Heroku
1. Install Heroku CLI
2. Create a new Heroku app
3. Set environment variables
4. Deploy with `git push heroku main`

### 2. Frontend Deployment (Next.js)

#### Option A: Deploy to Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
   ```
4. Deploy automatically

#### Option B: Deploy to Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Set environment variables

## 📋 Pre-Deployment Checklist

### Backend Checklist
- [ ] Environment variables configured
- [ ] Database connection string updated
- [ ] JWT secret is secure (32+ characters)
- [ ] Email service configured
- [ ] CORS origins updated
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Health check endpoints ready

### Frontend Checklist
- [ ] API URL updated to production backend
- [ ] Environment variables set
- [ ] TypeScript compilation successful
- [ ] ESLint passes
- [ ] Build optimization enabled
- [ ] Image optimization configured
- [ ] Error boundaries implemented
- [ ] Loading states handled

## 🔧 Environment Configuration

### Backend Environment Variables
```bash
# Required
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
EMAILJS_SERVICE_ID=your-service-id
EMAILJS_OTP_TEMPLATE_ID=your-template-id
EMAILJS_LINK_TEMPLATE_ID=your-template-id
EMAILJS_PUBLIC_KEY=your-public-key
EMAILJS_PRIVATE_KEY=your-private-key

# Optional
FRONTEND_URL=https://your-frontend-domain.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend Environment Variables
```bash
# Required
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api

# Optional
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-preset
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

## 🛠️ Production Build Commands

### Backend
```bash
# Install dependencies
npm install --production

# Run production build validation
npm run production-build

# Start production server
npm run production
```

### Frontend
```bash
# Install dependencies
npm install

# Run production build validation
npm run production-build

# Build for production
npm run build

# Start production server
npm run production
```

## 🔒 Security Considerations

### Backend Security
- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Set secure headers with Helmet
- [ ] Validate all inputs
- [ ] Use environment variables for secrets
- [ ] Implement proper CORS
- [ ] Use secure JWT secrets
- [ ] Enable request logging
- [ ] Implement error handling

### Frontend Security
- [ ] Use HTTPS
- [ ] Implement Content Security Policy
- [ ] Sanitize user inputs
- [ ] Use secure authentication
- [ ] Implement proper error handling
- [ ] Enable security headers

## 📊 Monitoring and Logging

### Backend Monitoring
- Health check endpoint: `/api/health`
- System health endpoint: `/api/system-health`
- Request logging enabled
- Error tracking implemented
- Performance monitoring active

### Frontend Monitoring
- Error boundaries implemented
- Console logging in development only
- Performance monitoring ready
- Analytics integration ready

## 🚨 Troubleshooting

### Common Issues

#### Backend Issues
1. **Database Connection Failed**
   - Check MongoDB URI format
   - Verify network connectivity
   - Check database credentials

2. **Environment Variables Missing**
   - Verify all required variables are set
   - Check variable names and values
   - Restart the application

3. **CORS Errors**
   - Update CORS origins in server.js
   - Check frontend URL configuration
   - Verify HTTPS/HTTP protocol

#### Frontend Issues
1. **Build Failures**
   - Check TypeScript errors
   - Verify all imports are correct
   - Check environment variables

2. **API Connection Issues**
   - Verify API URL is correct
   - Check CORS configuration
   - Test API endpoints directly

3. **Image Loading Issues**
   - Check image optimization configuration
   - Verify image domains in next.config.ts
   - Check Cloudinary configuration

## 📈 Performance Optimization

### Backend Optimization
- Database connection pooling
- Response compression
- Caching headers
- Rate limiting
- Request validation

### Frontend Optimization
- Code splitting
- Image optimization
- Bundle analysis
- Lazy loading
- Service worker (optional)

## 🔄 CI/CD Setup

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run production-build
      - run: npm run production

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run production-build
      - run: npm run build
```

## 📞 Support

If you encounter issues during deployment:
1. Check the logs in your hosting platform
2. Verify environment variables
3. Test locally with production settings
4. Check the troubleshooting section above

## 🎉 Success!

Once deployed, your ecommerce application will be available at:
- Frontend: `https://your-frontend-domain.com`
- Backend API: `https://your-backend-domain.com/api`
- Health Check: `https://your-backend-domain.com/api/health` 