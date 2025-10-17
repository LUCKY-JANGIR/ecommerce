/**
 * Centralized Constants for Hastkari Ecommerce
 * All app-wide configuration values, API endpoints, and constants
 */

// ============================================================================
// API CONFIGURATION
// ============================================================================

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    UPDATE_PROFILE: '/auth/profile',
  },
  
  // Product endpoints
  PRODUCTS: {
    BASE: '/products',
    FEATURED: '/products/featured',
    BY_ID: (id: string) => `/products/${id}`,
    REVIEWS: (id: string) => `/products/${id}/reviews`,
  },
  
  // Category endpoints
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id: string) => `/categories/${id}`,
  },
  
  // Order endpoints
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
    MY_ORDERS: '/orders/myorders',
  },
  
  // Review endpoints
  REVIEWS: {
    PLATFORM: '/platformReviews',
  },
  
  // Upload endpoints
  UPLOAD: {
    IMAGE: '/upload',
  },
} as const;

// ============================================================================
// HASTKARI BRAND COLORS
// ============================================================================

export const BRAND_COLORS = {
  // Primary - Warm Terracotta (Handloom Red)
  PRIMARY: {
    50: '#fef7f7',
    100: '#fdeaea',
    200: '#fad5d5',
    300: '#f6b3b3',
    400: '#f08888',
    500: '#e85d5d',
    600: '#d63384',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Accent - Heritage Gold (Saffron)
  ACCENT: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#d97706',
    600: '#b45309',
    700: '#92400e',
    800: '#78350f',
    900: '#451a03',
  },
  
  // Heritage - Earthy Beige (Natural Cotton)
  HERITAGE: {
    50: '#fdf8f6',
    100: '#f2e8e5',
    200: '#eaddd7',
    300: '#e0cec7',
    400: '#d2bab0',
    500: '#bfa094',
    600: '#a18072',
    700: '#977669',
    800: '#846358',
    900: '#43302b',
  },
  
  // Indigo - Royal Blue (Traditional Indigo)
  INDIGO: {
    50: '#f0f4ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  
  // Earth - Clay Pot Brown
  EARTH: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
  },
  
  // Dark Theme Colors
  DARK: {
    BG: {
      PRIMARY: '#0a0a0a',
      SECONDARY: '#1a1a1a',
      TERTIARY: '#2a2a2a',
      HOVER: '#2a2a2a',
    },
    TEXT: {
      PRIMARY: '#f9fafb',
      SECONDARY: '#d1d5db',
      MUTED: '#9ca3af',
    },
    BORDER: {
      PRIMARY: '#374151',
      SECONDARY: '#4b5563',
    },
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const FONTS = {
  DISPLAY: ['Playfair Display', 'Georgia', 'serif'],
  BODY: ['Inter', 'system-ui', 'sans-serif'],
  ACCENT: ['Caveat', 'cursive'],
  SERIF: ['DM Serif Display', 'Playfair Display', 'serif'],
  HANDCRAFTED: ['Dancing Script', 'cursive'],
  TRADITIONAL: ['Noto Serif Devanagari', 'serif'],
} as const;

// ============================================================================
// PAGINATION & LIMITS
// ============================================================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
  FEATURED_PRODUCTS_LIMIT: 8,
  CATEGORY_PRODUCTS_PREVIEW: 10,
  SEARCH_SUGGESTIONS_LIMIT: 5,
} as const;

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 1000,
  REVIEW_COMMENT_MAX_LENGTH: 500,
  PHONE_REGEX: /^[0-9]{10}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// ============================================================================
// IMAGE CONFIGURATION
// ============================================================================

export const IMAGE_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FORMATS: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  QUALITY: {
    THUMBNAIL: 70,
    CARD: 80,
    HERO: 90,
    GALLERY: 85,
    FULL: 90,
  },
  SIZES: {
    THUMBNAIL: { width: 200, height: 200 },
    CARD: { width: 400, height: 400 },
    HERO: { width: 1920, height: 1080 },
    GALLERY: { width: 800, height: 800 },
    FULL: { width: 1200, height: 1200 },
  },
} as const;

// ============================================================================
// TOAST MESSAGES
// ============================================================================

export const TOAST_MESSAGES = {
  SUCCESS: {
    PRODUCT_ADDED: '✨ Added to your collection',
    PRODUCT_REMOVED: 'Removed from cart',
    PROFILE_UPDATED: 'Profile updated successfully',
    ORDER_PLACED: 'Order placed successfully',
    REVIEW_SUBMITTED: 'Thank you for your review!',
    LOGIN: 'Welcome back!',
    REGISTER: 'Account created successfully!',
  },
  ERROR: {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    AUTH_REQUIRED: 'Please log in to continue',
    OUT_OF_STOCK: 'This item is out of stock',
    INVALID_CREDENTIALS: 'Invalid email or password',
  },
} as const;

// ============================================================================
// ANIMATION DURATIONS
// ============================================================================

export const ANIMATION = {
  DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    DEFAULT: 'ease-out',
    SPRING: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    SMOOTH: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ============================================================================
// BREAKPOINTS (matching Tailwind)
// ============================================================================

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// ============================================================================
// ROUTE PATHS
// ============================================================================

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  CATEGORIES: '/categories',
  CATEGORY_DETAIL: (id: string) => `/categories/${id}`,
  CART: '/cart',
  CHECKOUT: '/checkout',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  ORDERS: '/orders',
  ADMIN: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_USERS: '/admin/users',
} as const;

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'hastkari_auth_token',
  USER_DATA: 'hastkari_user',
  CART_DATA: 'hastkari_cart',
  THEME: 'hastkari_theme',
} as const;

// ============================================================================
// CLOUDINARY CONFIGURATION
// ============================================================================

export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  API_KEY: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  FOLDER: 'hastkari',
  UPLOAD_PRESET: 'hastkari_preset',
} as const;

// ============================================================================
// META INFORMATION
// ============================================================================

export const SITE_META = {
  TITLE: 'Hastkari - Authentic Indian Handlooms',
  DESCRIPTION: 'Discover authentic handwoven Indian textiles and crafts. Each piece tells a story of heritage, skill, and passion passed down through generations.',
  KEYWORDS: 'handloom, indian textiles, handcrafted, artisan, traditional crafts, sustainable fashion',
  AUTHOR: 'Hastkari',
  URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://hastkari.com',
} as const;

