# Hastkari Ecommerce - Source Code Structure

This document provides a clear overview of the codebase organization for the Hastkari ecommerce application.

## 📁 Directory Structure

```
src/
├── app/                    # Next.js 14 App Router pages
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── admin/             # Admin dashboard and management
│   ├── cart/              # Shopping cart page
│   ├── categories/        # Category listing and details
│   ├── checkout/          # Checkout flow
│   ├── orders/            # Order history and details
│   ├── products/          # Product listing and details
│   ├── profile/           # User profile management
│   ├── globals.css        # Global styles and Tailwind
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Homepage
│
├── components/            # React components
│   ├── ui/               # Reusable UI primitives
│   │   ├── Button.tsx        # Button component with variants
│   │   ├── Card.tsx          # Card component for content containers
│   │   ├── Badge.tsx         # Badge/label component
│   │   ├── LoadingSpinner.tsx # Loading indicator
│   │   └── OptimizedImage.tsx # Optimized next/image wrapper
│   │
│   ├── Home/             # Homepage-specific components
│   │   ├── HeroSection.tsx   # Main hero slider
│   │   ├── FeaturedProducts.tsx # Featured products grid
│   │   ├── CategoriesSection.tsx # Categories showcase
│   │   ├── BrandStory.tsx    # Brand story section
│   │   └── Testimonials.tsx  # Customer reviews
│   │
│   ├── Shared/           # Shared layout components
│   │   ├── Header.tsx        # Main navigation header
│   │   └── Footer.tsx        # Site footer
│   │
│   ├── services/         # API service layer
│   │   └── api.ts           # API client functions
│   │
│   ├── ProductCard.tsx   # Product card (grid/list view)
│   ├── RecommendedProducts.tsx # Product recommendations
│   └── ErrorHandlingExample.tsx # Error handling demo
│
├── hooks/                # Custom React hooks
│   ├── useAsync.ts          # Async operation handling
│   ├── useDebounce.ts       # Debounce input values
│   └── usePersistentState.ts # LocalStorage state management
│
├── lib/                  # Utility functions and helpers
│   ├── constants.ts         # App-wide constants and config
│   ├── utils.ts             # General utility functions
│   ├── cloudinary.ts        # Cloudinary image management
│   ├── imageUtils.ts        # Image optimization utilities
│   └── errorHandler.ts      # Centralized error handling
│
├── store/                # Global state management (Zustand)
│   └── useStore.ts          # Main app store (auth, cart)
│
└── types/                # TypeScript type definitions
    └── index.ts             # All shared interfaces and types
```

## 🎨 Key Design Patterns

### 1. **Component Organization**
- **UI Components** (`components/ui/`): Pure, reusable components with no business logic
- **Feature Components** (`components/Home/`, etc.): Domain-specific components with logic
- **Layout Components** (`components/Shared/`): Site-wide layout elements

### 2. **Type Safety**
- All types centralized in `types/index.ts`
- Strict TypeScript configuration
- Props and state are fully typed

### 3. **State Management**
- **Zustand** for global state (authentication, shopping cart)
- **React hooks** for local component state
- Persistent state synced with localStorage

### 4. **API Layer**
- All API calls go through `components/services/api.ts`
- Centralized error handling
- Typed request/response interfaces

### 5. **Styling**
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for animations
- Dark theme with brand-specific color palette
- Responsive design (mobile-first)

## 🚀 Key Files Explained

### `types/index.ts`
Central type definitions for:
- Products, categories, users
- Orders, reviews, cart items
- API responses, filters
- UI component props

### `lib/constants.ts`
Centralized configuration:
- API endpoints and base URLs
- Brand colors and typography
- Validation rules
- Toast messages
- Image settings

### `store/useStore.ts`
Global Zustand store managing:
- Authentication state (token, user)
- Shopping cart (items, total)
- Hydration status for SSR

### `components/services/api.ts`
API client with functions for:
- Authentication (login, register, profile)
- Products (list, search, featured)
- Categories, orders, reviews
- Image uploads

## 📝 Coding Conventions

### Naming
- **Components**: PascalCase (`ProductCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useDebounce.ts`)
- **Utilities**: camelCase (`formatPrice`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS`)
- **Types**: PascalCase (`Product`, `User`)

### File Structure
```typescript
// 1. Imports (grouped: React, third-party, local)
import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/types';

// 2. Types/Interfaces
interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
}

// 3. Constants
const ANIMATION_DURATION = 300;

// 4. Component
export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  // Component logic
}
```

### Comments
- Add comments for complex logic
- Document non-obvious decisions
- Use `// @review` for risky changes
- JSDoc for exported functions

## 🛠️ Common Tasks

### Adding a New Page
1. Create file in `app/your-route/page.tsx`
2. Add route constant to `lib/constants.ts`
3. Update navigation in `components/Shared/Header.tsx`

### Adding a New API Endpoint
1. Add endpoint to `lib/constants.ts` (`API_ENDPOINTS`)
2. Create function in `components/services/api.ts`
3. Add types to `types/index.ts` if needed

### Creating a New Component
1. Add to appropriate directory (`ui/`, `Home/`, `Shared/`)
2. Define props interface
3. Use existing UI components from `ui/`
4. Follow naming and styling conventions

### Adding a New Type
1. Add to `types/index.ts` in relevant section
2. Export from the file
3. Import where needed: `import { YourType } from '@/types'`

## 🎯 Best Practices

1. **Use Absolute Imports**: `@/components/...` instead of `../../../`
2. **Type Everything**: No `any` types unless absolutely necessary
3. **Centralize Constants**: Add to `lib/constants.ts`, not hardcoded
4. **Reuse UI Components**: Use existing components from `ui/` directory
5. **Error Handling**: Use try/catch and centralized error handler
6. **Performance**: Use React.memo, useMemo, useCallback where appropriate
7. **Accessibility**: Add proper ARIA labels and keyboard navigation

## 🔧 Maintenance

### Before Committing
- Run `npm run lint` to check for errors
- Run `npm run build` to ensure production build works
- Test on multiple screen sizes
- Check console for warnings

### Code Quality
- Keep components under 300 lines
- Split large files into smaller ones
- Remove unused imports and code
- Keep functions focused and single-purpose

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Zustand](https://github.com/pmndrs/zustand)

---

**Last Updated**: 2025-10-17
**Maintained By**: Hastkari Development Team

