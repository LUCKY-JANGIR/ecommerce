import axios from 'axios';
import { useStore } from '@/store/useStore';
import { handleApiError } from '@/lib/errorHandler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useStore.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {

      
      // Only logout if the user is currently authenticated
      const currentAuth = useStore.getState().auth;
      if (currentAuth.isAuthenticated && currentAuth.token) {

        useStore.getState().logout();
        
        // Only redirect to login if not already on login page and not on public pages
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        const publicPages = ['/', '/login', '/register', '/products', '/categories'];
        const isPublicPage = publicPages.some(page => currentPath.startsWith(page));
        
        if (!isPublicPage && !currentPath.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);



// Auth API
export const authAPI: {
  register: (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    phone?: string;
  }) => Promise<{
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
    };
    token: string;
  }>;
  login: (credentials: { email: string; password: string }) => Promise<{
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
    };
    token: string;
  }>;
  getProfile: () => Promise<{
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }>;
  updateProfile: (userData: Partial<{
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }>) => Promise<{
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }>;
  changePassword: (passwords: { currentPassword: string; newPassword: string }) => Promise<{ message: string }>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (params: { email: string; token: string; newPassword: string }) => Promise<{ message: string }>;
} = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    phone?: string;
  }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  updateProfile: async (userData: Partial<{
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }>) => {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  changePassword: async (passwords: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      const response = await api.put('/auth/change-password', passwords);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  resetPassword: async ({ email, token, newPassword }: { email: string; token: string; newPassword: string }) => {
    try {
      const response = await api.post('/auth/reset-password', { email, token, newPassword });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getById: async (id: string) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  create: async (categoryData: { name: string; description?: string; image?: string } | FormData) => {
    try {
      const isFormData = typeof FormData !== 'undefined' && categoryData instanceof FormData;
      const response = await api.post('/categories', categoryData, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  update: async (id: string, categoryData: { name: string; description?: string; image?: string } | FormData) => {
    try {
      const isFormData = typeof FormData !== 'undefined' && categoryData instanceof FormData;
      const response = await api.put(`/categories/${id}`, categoryData, isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  delete: async (id: string) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

// Upload API
export const uploadAPI = {
  uploadImage: async (file: File, folder: string = 'products') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

// Products API
export const productsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  }) => {
    try {
      const response = await api.get('/products', { params });
      // Handle the response structure: {success: true, data: {products: [...], pagination: {...}}}
      if (response.data && response.data.success && response.data.data) {
        return response.data.data; // Return {products: [...], pagination: {...}}
      }
      return response.data; // Fallback for other response structures
    } catch (error) {
      handleApiError(error);
    }
  },

  getById: async (id: string) => {
    try {
      const response = await api.get(`/products/${id}`);
      // Handle the response structure: {success: true, data: product}
      if (response.data && response.data.success && response.data.data) {
        return response.data.data; // Return the product object
      }
      return response.data; // Fallback for other response structures
    } catch (error) {
      handleApiError(error);
    }
  },

  getFeatured: async () => {
    try {
      const response = await api.get('/products/featured');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getByCategory: async (category: string) => {
    try {
      const response = await api.get(`/products/category/${category}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  create: async (productData: FormData) => {
    try {
      const response = await api.post('/products', productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  update: async (id: string, productData: FormData) => {
    try {
      const response = await api.put(`/products/${id}`, productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  delete: async (id: string) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  toggleFeatured: async (id: string) => {
    try {
      const response = await api.patch(`/products/${id}/toggle-featured`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  addReview: async (productId: string, review: {
    rating: number;
    comment: string;
  }) => {
    try {
      const response = await api.post(`/products/${productId}/reviews`, review);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Get product reviews
  getProductReviews: async (productId: string) => {
    try {
      const response = await api.get(`/products/${productId}/reviews`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Add review to product
  addProductReview: async (productId: string, reviewData: { rating: number; comment: string }) => {
    try {
      const response = await api.post(`/products/${productId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Update review
  updateProductReview: async (productId: string, reviewId: string, reviewData: { rating?: number; comment?: string }) => {
    try {
      const response = await api.put(`/products/${productId}/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Delete review
  deleteProductReview: async (productId: string, reviewId: string) => {
    try {
      const response = await api.delete(`/products/${productId}/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

// Orders API
export const ordersAPI = {
  create: async (orderData: {
    orderItems: Array<{
      product: string;
      quantity: number;
    }>;
    shippingAddress: {
      fullName: string;
      address: string;
      city: string;
      postalCode: string;
      country: string;
      phone: string;
    };
    paymentMethod: string;
  }) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getMyOrders: async () => {
    try {
      const response = await api.get('/orders/my-orders');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getById: async (id: string) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  pay: async (id: string, paymentResult: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  }) => {
    try {
      const response = await api.put(`/orders/${id}/pay`, paymentResult);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  cancel: async (id: string) => {
    try {
      const response = await api.put(`/orders/${id}/cancel`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  // Admin only
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    isPaid?: string;
  }) => {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  updateStatus: async (id: string, orderStatus: string) => {
    try {
      const response = await api.put(`/orders/${id}/status`, { status: orderStatus });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  updateNegotiationNotes: async (id: string, negotiationNotes: string) => {
    try {
      const response = await api.put(`/orders/${id}/negotiation`, { negotiationNotes });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  updatePaymentStatus: async (id: string, isPaid: boolean) => {
    try {
      const response = await api.put(`/orders/${id}/payment-status`, { isPaid });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/orders/stats/overview');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

// Users API (Admin only)
export const usersAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
  }) => {
    try {
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getById: async (id: string) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  update: async (id: string, userData: Partial<{
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  }>) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  delete: async (id: string) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  createAdmin: async (adminData: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await api.post('/users/create-admin', adminData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  toggleStatus: async (id: string) => {
    try {
      const response = await api.put(`/users/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/users/stats/overview');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },


};

// Platform Reviews API
export const platformReviewsAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/reviews');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  create: async (reviewData: { comment: string }) => {
    try {
      const response = await api.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
};

export default api; 