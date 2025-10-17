/**
 * Centralized Type Definitions for Hastkari Ecommerce
 * This file contains all shared types and interfaces used across the application
 */

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export interface ProductImage {
  url: string;
  alt?: string;
  public_id?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: (ProductImage | string)[];
  category: string | Category;
  stock: number;
  averageRating?: number;
  numReviews?: number;
  createdAt: string;
  updatedAt?: string;
  featured?: boolean;
}

// ============================================================================
// CATEGORY TYPES
// ============================================================================

export interface Category {
  _id: string;
  name: string;
  description: string;
  image?: string;
  products?: Product[];
  productCount?: number;
}

// ============================================================================
// USER & AUTH TYPES
// ============================================================================

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  address?: Address;
  createdAt?: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// ============================================================================
// CART TYPES
// ============================================================================

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
}

// ============================================================================
// ORDER TYPES
// ============================================================================

export interface OrderItem {
  product: string | Product;
  quantity: number;
  price: number;
}

export interface ShippingAddress extends Address {
  name: string;
  phone: string;
}

export interface Order {
  _id: string;
  user: string | User;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    email_address?: string;
  };
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// ============================================================================
// REVIEW TYPES
// ============================================================================

export interface Review {
  _id: string;
  user: string | User;
  product: string | Product;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PlatformReview {
  _id: string;
  user: string | User;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pages: number;
  total: number;
  limit: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
  page?: number;
  limit?: number;
  featured?: boolean;
}

// ============================================================================
// UI COMPONENT TYPES
// ============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'handcrafted';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'error' | 'handcrafted';
export type BadgeSize = 'sm' | 'md' | 'lg';

export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

// ============================================================================
// HERO SLIDE TYPE
// ============================================================================

export interface HeroSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  cta: string;
  link: string;
  badge: string;
}

// ============================================================================
// FEATURE TYPE
// ============================================================================

export interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

// ============================================================================
// STORE STATE TYPE
// ============================================================================

export interface StoreState {
  auth: AuthState;
  cart: CartState;
  hydrated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setHydrated: () => void;
}

