import axios from 'axios';
import { useStore } from '@/store/useStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

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
      useStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

function handleApiError(error: any) {
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error);
  }
  // You can customize this further for production logging
  throw new Error(
    error?.response?.data?.message || error?.message || 'An unexpected error occurred.'
  );
}

// Auth API
export const authAPI = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
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
    sort?: string;
  }) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getById: async (id: string) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getFeatured: async () => {
    try {
      const response = await api.get('/products/featured/list');
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
      const response = await api.put(`/orders/${id}/status`, { orderStatus });
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

export default api; 