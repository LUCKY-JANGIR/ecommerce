import axios from 'axios';
import { useStore } from '@/store/useStore';

const API_BASE_URL = 'http://localhost:5001/api';

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

// Auth API
export const authAPI = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
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
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  changePassword: async (passwords: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.put('/auth/change-password', passwords);
    return response.data;
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
    const response = await api.get('/products', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getFeatured: async () => {
    const response = await api.get('/products/featured/list');
    return response.data;
  },

  getByCategory: async (category: string) => {
    const response = await api.get(`/products/category/${category}`);
    return response.data;
  },

  create: async (productData: FormData) => {
    const response = await api.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, productData: FormData) => {
    const response = await api.put(`/products/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  addReview: async (productId: string, review: {
    rating: number;
    comment: string;
  }) => {
    const response = await api.post(`/products/${productId}/reviews`, review);
    return response.data;
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
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  pay: async (id: string, paymentResult: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  }) => {
    const response = await api.put(`/orders/${id}/pay`, paymentResult);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  },

  // Admin only
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  updateStatus: async (id: string, orderStatus: string) => {
    const response = await api.put(`/orders/${id}/status`, { orderStatus });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/orders/stats/overview');
    return response.data;
  },
};

// Users API (Admin only)
export const usersAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
  }) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  update: async (id: string, userData: Partial<{
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  }>) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  createAdmin: async (adminData: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post('/users/create-admin', adminData);
    return response.data;
  },

  toggleStatus: async (id: string) => {
    const response = await api.put(`/users/${id}/toggle-status`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/users/stats/overview');
    return response.data;
  },
};

export default api; 