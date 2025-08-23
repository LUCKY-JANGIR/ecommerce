import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usersAPI } from '@/components/services/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  avatar?: string;
  isEmailVerified?: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string | { _id: string; name: string };
  subcategory?: string;
  brand?: string;
  sku: string;
  images: Array<{
    url: string;
    alt?: string;
  }>;
  stock: number;
  averageRating: number;
  numReviews: number;
  reviews: Review[];
  specifications: Array<{
    name: string;
    value: string;
  }>;
  tags: string[];
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  _id: string;
  user: string;
  orderItems: {
    product: Product;
    quantity: number;
    price: number;
  }[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Refunded';
  trackingNumber?: string;
  notes?: string;
  estimatedDelivery?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

interface AppState {
  // Auth
  auth: AuthState;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  
  // Cart
  cart: CartState;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // UI
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Hydration
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;

  // Wishlist
  wishlist: Product[];
  fetchWishlist: () => Promise<void>;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth state
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      },
      
      login: async (user: User, token: string) => {
        set((state) => ({
          auth: {
            ...state.auth,
            user,
            token,
            isAuthenticated: true,
            loading: false,
          },
        }));
        // Fetch wishlist from backend after login
        await get().fetchWishlist();
      },
      
      logout: () =>
        set((state) => ({
          auth: {
            ...state.auth,
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
          },
          cart: {
            items: [],
            totalItems: 0,
            totalPrice: 0,
          },
        })),
      
      setLoading: (loading: boolean) =>
        set((state) => ({
          auth: {
            ...state.auth,
            loading,
          },
        })),
      
      // Cart state
      cart: {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      },
      
      addToCart: (product: Product, quantity = 1) =>
        set((state) => {
          const existingItem = state.cart.items.find(
            (item) => item.product._id === product._id
          );
          
          let newItems: CartItem[];
          if (existingItem) {
            newItems = state.cart.items.map((item) =>
              item.product._id === product._id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            newItems = [...state.cart.items, { product, quantity }];
          }
          
          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalPrice = newItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );
          
          return {
            cart: {
              items: newItems,
              totalItems,
              totalPrice,
            },
          };
        }),
      
      removeFromCart: (productId: string) =>
        set((state) => {
          const newItems = state.cart.items.filter(
            (item) => item.product._id !== productId
          );
          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalPrice = newItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );
          
          return {
            cart: {
              items: newItems,
              totalItems,
              totalPrice,
            },
          };
        }),
      
      updateCartItemQuantity: (productId: string, quantity: number) =>
        set((state) => {
          const newItems = state.cart.items.map((item) =>
            item.product._id === productId ? { ...item, quantity } : item
          );
          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalPrice = newItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );
          
          return {
            cart: {
              items: newItems,
              totalItems,
              totalPrice,
            },
          };
        }),
      
      clearCart: () =>
        set({
          cart: {
            items: [],
            totalItems: 0,
            totalPrice: 0,
          },
        }),
      
      // UI state
      sidebarOpen: false,
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

      // Hydration
      hydrated: false,
      setHydrated: (hydrated: boolean) => set({ hydrated }),

      // Wishlist state
      wishlist: [],
      fetchWishlist: async () => {
        const { auth } = get();
        if (!auth.isAuthenticated || !auth.token) {
          console.log('Not authenticated, skipping wishlist fetch');
          set({ wishlist: [] });
          return;
        }
        try {
          const data = await usersAPI.getWishlist();
          console.log('Fetched wishlist from backend:', data.wishlist);
          // Extract products from the nested structure
          const products = data.wishlist?.map((item: any) => item.product) || [];
          set({ wishlist: products });
        } catch (e) {
          console.error('Error fetching wishlist:', e);
          set({ wishlist: [] });
        }
      },
      addToWishlist: async (product: Product) => {
        try {
          const { auth } = get();
          if (!auth.isAuthenticated || !auth.token) {
            console.log('User not authenticated, cannot add to wishlist');
            // You could redirect to login here or show a toast
            return;
          }
          
          console.log('Adding to wishlist:', product._id);
          console.log('Auth state:', { isAuthenticated: auth.isAuthenticated, hasToken: !!auth.token });
          
          const data = await usersAPI.addToWishlist(product._id);
          console.log('Wishlist response:', data);
          
          // Extract products from the nested structure
          const products = data.wishlist?.map((item: any) => item.product) || [];
          set({ wishlist: products });
        } catch (e: any) {
          console.error('Error adding to wishlist:', e);
          // Show user-friendly error message
          if (e?.response?.status === 400) {
            console.error('400 Error details:', e.response.data);
          }
        }
      },
      removeFromWishlist: async (productId: string) => {
        try {
          const { auth } = get();
          if (!auth.isAuthenticated || !auth.token) {
            console.log('User not authenticated, cannot remove from wishlist');
            return;
          }
          
          console.log('Removing from wishlist:', productId);
          const data = await usersAPI.removeFromWishlist(productId);
          console.log('Remove wishlist response:', data);
          
          // Extract products from the nested structure
          const products = data.wishlist?.map((item: any) => item.product) || [];
          set({ wishlist: products });
        } catch (e: any) {
          console.error('Error removing from wishlist:', e);
          // Show user-friendly error message
          if (e?.response?.status === 400) {
            console.error('400 Error details:', e.response.data);
          }
        }
      },
      clearWishlist: () => set({ wishlist: [] }),
    }),
    {
      name: 'ecommerce-store',
      partialize: (state) => ({
        auth: {
          user: state.auth.user,
          token: state.auth.token,
          isAuthenticated: state.auth.isAuthenticated,
        },
        cart: state.cart,
        wishlist: state.wishlist,
      }),
    }
  )
); 