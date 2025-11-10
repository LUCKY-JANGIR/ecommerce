/**
 * Hastkari Global State Store
 * Manages authentication and shopping cart using Zustand
 * Persists data to localStorage for session continuity
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Product, CartItem, SelectedParameter } from '@/types';

// ============================================================================
// INTERNAL STATE INTERFACES
// ============================================================================

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
  addToCart: (product: Product, quantity?: number, selectedParameters?: SelectedParameter[]) => void;
  removeFromCart: (itemIndex: number) => void;
  updateCartItemQuantity: (itemIndex: number, quantity: number) => void;
  clearCart: () => void;
  
  // UI
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Hydration (for SSR)
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate cart totals from items array
 */
const calculateCartTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  return { totalItems, totalPrice };
};

// ============================================================================
// ZUSTAND STORE
// ============================================================================

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // ========================================================================
      // AUTH STATE & ACTIONS
      // ========================================================================
      
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      },
      
      /**
       * Login user and store token
       */
      login: (user: User, token: string) => {
        set((state) => ({
          auth: {
            ...state.auth,
            user,
            token,
            isAuthenticated: true,
            loading: false,
          },
        }));
      },
      
      /**
       * Logout user and clear all data
       */
      logout: () => {
        set({
          auth: {
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
        });
      },
      
      /**
       * Set auth loading state
       */
      setLoading: (loading: boolean) => {
        set((state) => ({
          auth: {
            ...state.auth,
            loading,
          },
        }));
      },
      
      // ========================================================================
      // CART STATE & ACTIONS
      // ========================================================================
      
      cart: {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      },
      
      /**
       * Add product to cart or increment quantity if already exists
       */
      addToCart: (product: Product, quantity = 1, selectedParameters?: SelectedParameter[]) => {
        set((state) => {
          const existingItem = state.cart.items.find(
            (item) => item.product._id === product._id && 
            JSON.stringify(item.selectedParameters) === JSON.stringify(selectedParameters)
          );
          
          let newItems: CartItem[];
          
          if (existingItem) {
            // Increment quantity for existing item
            newItems = state.cart.items.map((item) =>
              item.product._id === product._id && 
              JSON.stringify(item.selectedParameters) === JSON.stringify(selectedParameters)
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            // Add new item to cart
            newItems = [...state.cart.items, { product, quantity, selectedParameters }];
          }
          
          const { totalItems, totalPrice } = calculateCartTotals(newItems);
          
          return {
            cart: {
              items: newItems,
              totalItems,
              totalPrice,
            },
          };
        });
      },
      
      /**
       * Remove product from cart completely by item index
       */
      removeFromCart: (itemIndex: number) => {
        set((state) => {
          const newItems = state.cart.items.filter(
            (_, index) => index !== itemIndex
          );
          
          const { totalItems, totalPrice } = calculateCartTotals(newItems);
          
          return {
            cart: {
              items: newItems,
              totalItems,
              totalPrice,
            },
          };
        });
      },
      
      /**
       * Update quantity of a specific cart item by item index
       */
      updateCartItemQuantity: (itemIndex: number, quantity: number) => {
        set((state) => {
          const newItems = state.cart.items.map((item, index) =>
            index === itemIndex ? { ...item, quantity } : item
          );
          
          const { totalItems, totalPrice } = calculateCartTotals(newItems);
          
          return {
            cart: {
              items: newItems,
              totalItems,
              totalPrice,
            },
          };
        });
      },
      
      /**
       * Clear all items from cart
       */
      clearCart: () => {
        set({
          cart: {
            items: [],
            totalItems: 0,
            totalPrice: 0,
          },
        });
      },
      
      // ========================================================================
      // UI STATE & ACTIONS
      // ========================================================================
      
      sidebarOpen: false,
      
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      
      // ========================================================================
      // HYDRATION (for SSR)
      // ========================================================================
      
      hydrated: false,
      
      setHydrated: (hydrated: boolean) => set({ hydrated }),
    }),
    {
      name: 'hastkari-store', // localStorage key
      partialize: (state) => ({
        // Only persist auth and cart, not UI state
        auth: {
          user: state.auth.user,
          token: state.auth.token,
          isAuthenticated: state.auth.isAuthenticated,
        },
        cart: state.cart,
      }),
    }
  )
);

// ============================================================================
// EXPORTS
// ============================================================================

// Re-export types for convenience
export type { User, Product, CartItem } from '@/types';