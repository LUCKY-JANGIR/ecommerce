# Ecommerce Backend API

A comprehensive REST API for an ecommerce application built with Node.js, Express.js, and MongoDB.

## Features

- **User Authentication & Authorization**

  - JWT-based authentication
  - Role-based access control (User/Admin)
  - Password hashing with bcrypt
  - Profile management

- **Product Management**

  - CRUD operations for products
  - Image upload support
  - Product categories and filtering
  - Search functionality
  - Product reviews and ratings
  - Stock management

- **Order Management**

  - Order creation and tracking
  - Payment integration ready
  - Order status management
  - Order history

- **Admin Features**
  - User management
  - Product management
  - Order management
  - Statistics and analytics

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:

   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   ```

4. Make sure MongoDB is running on your system

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get user profile (Protected)
- `PUT /profile` - Update user profile (Protected)
- `PUT /change-password` - Change password (Protected)
- `GET /verify` - Verify JWT token (Protected)

### Product Routes (`/api/products`)

- `GET /` - Get all products with filtering and pagination
- `GET /:id` - Get single product
- `POST /` - Create product (Admin)
- `PUT /:id` - Update product (Admin)
- `DELETE /:id` - Delete product (Admin)
- `POST /:id/reviews` - Add product review (Protected)
- `GET /featured/list` - Get featured products
- `GET /category/:category` - Get products by category

### Order Routes (`/api/orders`)

- `POST /` - Create new order (Protected)
- `GET /my-orders` - Get user orders (Protected)
- `GET /:id` - Get order by ID (Protected)
- `PUT /:id/pay` - Update order to paid (Protected)
- `PUT /:id/cancel` - Cancel order (Protected)
- `GET /` - Get all orders (Admin)
- `PUT /:id/status` - Update order status (Admin)
- `GET /stats/overview` - Get order statistics (Admin)

### User Routes (`/api/users`)

- `GET /` - Get all users (Admin)
- `GET /:id` - Get user by ID (Admin)
- `PUT /:id` - Update user (Admin)
- `DELETE /:id` - Delete user (Admin)
- `GET /stats/overview` - Get user statistics (Admin)
- `POST /create-admin` - Create admin user (Admin)
- `PUT /:id/toggle-status` - Toggle user status (Admin)

## Database Models

### User Model

- Personal information (name, email, phone, address)
- Authentication (password, role)
- Account status and verification

### Product Model

- Product details (name, description, price, category)
- Inventory management (stock, SKU)
- Media (images)
- Reviews and ratings
- Specifications and tags

### Order Model

- Order items and quantities
- Shipping address
- Payment information
- Order status tracking
- Price calculations

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization
- File upload restrictions

## File Upload

Product images are uploaded to the `uploads/products/` directory. Supported formats:

- JPEG
- PNG
- GIF
- WebP

Maximum file size: 5MB

## Error Handling

The API includes comprehensive error handling with appropriate HTTP status codes and error messages.

## Development

Run in development mode with auto-restart:

```bash
npm run dev
```

## Production

For production deployment:

1. Set `NODE_ENV=production` in your environment
2. Use a production MongoDB instance
3. Set secure JWT secrets
4. Configure proper CORS origins
5. Set up file upload storage (AWS S3, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License
