# 🛍️ Hastkari - Authentic Indian Handloom Ecommerce

A modern, full-featured ecommerce platform celebrating authentic Indian handlooms and traditional crafts. Built with Next.js 14, TypeScript, and a focus on performance and user experience.

## 🌟 Features

- **🎨 Beautiful Dark Theme**: Carefully crafted brand identity with Indian craft-inspired colors
- **🔐 Authentication**: Secure user authentication with JWT tokens
- **🛒 Shopping Cart**: Persistent cart with real-time updates
- **📦 Product Management**: Browse, search, and filter products
- **⭐ Reviews & Ratings**: Customer reviews for products and platform
- **👤 User Profiles**: Manage account details and order history
- **💳 Checkout Flow**: Streamlined checkout process
- **📱 Responsive Design**: Mobile-first, works on all devices
- **⚡ Performance Optimized**: Image optimization, lazy loading, code splitting
- **♿ Accessible**: WCAG compliant with proper ARIA labels

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Image Optimization**: Cloudinary + Next.js Image
- **Icons**: React Icons, Lucide React
- **Forms**: React Hook Form + Zod validation

### Backend Integration
- **API Client**: Axios
- **Authentication**: JWT tokens
- **Data Persistence**: LocalStorage for cart/auth

## 📂 Project Structure

```
ecommerce-frontend/
├── public/                 # Static assets (images, fonts)
├── src/
│   ├── app/               # Next.js 14 App Router pages
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── Home/         # Homepage sections
│   │   └── Shared/       # Layout components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and helpers
│   ├── store/            # Zustand state management
│   └── types/            # TypeScript type definitions
├── tailwind.config.ts    # Tailwind configuration
├── next.config.ts        # Next.js configuration
└── package.json

See src/README.md for detailed source code documentation.
```

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running (see ecommerce-backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce/ecommerce-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5001/api
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

## 🎨 Design System

### Brand Colors
- **Primary** (Terracotta): `#e85d5d` - Warm handloom red
- **Accent** (Saffron): `#d97706` - Heritage gold
- **Heritage** (Beige): `#bfa094` - Natural cotton
- **Indigo**: `#6366f1` - Traditional blue
- **Earth**: `#78716c` - Clay pot brown

### Typography
- **Display**: Playfair Display (elegant serif)
- **Body**: Inter (clean sans-serif)
- **Handcrafted**: Dancing Script (decorative)
- **Traditional**: Noto Serif Devanagari (Hindi text)

### Key Design Principles
1. **Warmth & Trust**: Earth tones, soft shadows
2. **Clarity**: Clean layouts, clear hierarchy
3. **Cultural Authenticity**: Hindi text, traditional patterns
4. **Modern Polish**: Smooth animations, responsive design

## 📱 Key Pages

- `/` - Homepage with hero, featured products, categories
- `/products` - Product listing with filters and search
- `/products/[id]` - Individual product details
- `/categories` - Browse by category
- `/cart` - Shopping cart
- `/checkout` - Checkout flow
- `/login` & `/register` - Authentication
- `/profile` - User account management
- `/orders` - Order history
- `/admin` - Admin dashboard (restricted)

## 🔧 Configuration

### Tailwind Config
Custom theme with Hastkari brand colors, animations, and patterns. See `tailwind.config.ts`.

### Next.js Config
Image optimization, remote patterns for Cloudinary, internationalization ready. See `next.config.ts`.

### Constants
All app-wide constants centralized in `src/lib/constants.ts`:
- API endpoints
- Brand colors
- Validation rules
- Image settings
- Routes

### Types
All TypeScript interfaces in `src/types/index.ts`:
- Product, Category, User
- Order, Review, Cart
- API responses
- UI component props

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Build test
npm run build
```

## 📈 Performance Optimizations

- ✅ Next.js Image component for automatic optimization
- ✅ Cloudinary transformations for responsive images
- ✅ Code splitting with dynamic imports
- ✅ Lazy loading for below-the-fold content
- ✅ Memoization of expensive calculations
- ✅ Optimized bundle size with tree-shaking
- ✅ Client-side caching with Zustand persist

## ♿ Accessibility

- Semantic HTML5 elements
- ARIA labels and roles
- Keyboard navigation support
- Focus visible states
- Alt text for all images
- Color contrast compliance (WCAG AA)
- Screen reader friendly

## 🔒 Security

- JWT token authentication
- Secure HTTP-only cookies (backend)
- XSS protection
- CSRF protection
- Input validation and sanitization
- Environment variable protection

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Framer Motion Documentation](https://www.framer.com/motion/)

## 🤝 Contributing

1. Follow the coding conventions in `src/README.md`
2. Run linter before committing
3. Test on multiple screen sizes
4. Add comments for complex logic
5. Update types when adding new features

## 📄 License

This project is proprietary software for Hastkari.

## 👥 Team

Developed with ❤️ by the Hastkari team.

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Status**: Production Ready ✅