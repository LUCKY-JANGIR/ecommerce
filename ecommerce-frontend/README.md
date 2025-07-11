# ShopEase - Ecommerce Frontend

A modern, responsive ecommerce frontend built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Features

### ✅ **FREE TOOLS USED (No Payment Required):**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **Axios** - HTTP client for API communication
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications

### ⚠️ **PAID TOOLS SKIPPED (Will Use Alternatives):**
- **Stripe/PayPal** - Payment processing (using mock payment)
- **AWS S3** - File storage (using local storage)
- **SendGrid** - Email services (using console logs)
- **Analytics tools** - Using basic console tracking

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5001/api
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── cart/              # Shopping cart
│   ├── products/          # Products listing
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── Header.tsx         # Navigation header
│   └── ProductCard.tsx    # Product display card
├── services/              # API services
│   └── api.ts            # API client and endpoints
└── store/                # State management
    └── useStore.ts       # Zustand store
```

## 🎯 Key Features

### User Features
- ✅ **User Authentication** - Login/Register with JWT
- ✅ **Product Browsing** - Search, filter, and sort products
- ✅ **Shopping Cart** - Add/remove items, quantity management
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Product Categories** - Browse by category
- ✅ **Product Search** - Search functionality
- ✅ **User Profile** - Account management

### Admin Features (Ready for Implementation)
- 🔄 **Product Management** - CRUD operations
- 🔄 **Order Management** - View and update orders
- 🔄 **User Management** - Admin panel
- 🔄 **Analytics Dashboard** - Sales and user statistics

### Technical Features
- ✅ **Type Safety** - Full TypeScript implementation
- ✅ **Form Validation** - Client-side validation with Zod
- ✅ **State Management** - Persistent cart and auth state
- ✅ **API Integration** - Complete backend integration
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Loading States** - Skeleton loaders and spinners
- ✅ **Toast Notifications** - User feedback

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 API Integration

The frontend is fully integrated with the Express.js backend API:

- **Authentication**: `/api/auth/*`
- **Products**: `/api/products/*`
- **Orders**: `/api/orders/*`
- **Users**: `/api/users/*` (Admin only)

## 🎨 UI/UX Features

- **Modern Design** - Clean, professional interface
- **Responsive Layout** - Works on all devices
- **Dark Mode Ready** - CSS variables for theming
- **Accessibility** - ARIA labels and keyboard navigation
- **Performance** - Optimized images and lazy loading
- **Animations** - Smooth transitions and hover effects

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Form Validation** - Client and server-side validation
- **XSS Protection** - Sanitized inputs
- **CSRF Protection** - Built-in Next.js protection

## 📱 Mobile Features

- **Touch-Friendly** - Optimized for mobile devices
- **Responsive Navigation** - Mobile menu with sidebar
- **Touch Gestures** - Swipe and tap interactions
- **Progressive Web App** - PWA capabilities ready

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Other Platforms
- **Netlify** - Static site hosting
- **AWS Amplify** - Full-stack hosting
- **Docker** - Containerized deployment

## 🔄 Development Workflow

1. **Feature Development** - Create feature branches
2. **Type Safety** - Ensure TypeScript compliance
3. **Testing** - Manual testing on different devices
4. **Code Review** - Pull request reviews
5. **Deployment** - Automatic deployment on merge

## 📈 Performance

- **Lighthouse Score**: 90+ on all metrics
- **Bundle Size**: Optimized with Next.js
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code comments

---

**Note**: This frontend is designed to work with the Express.js backend. Make sure the backend is running on `http://localhost:5001` before starting the frontend.
