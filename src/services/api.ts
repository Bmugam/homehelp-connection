import axios from 'axios';
import { API_BASE_URL } from '@/apiConfig';

// Create axios instance with custom config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      // Handle 401 Unauthorized errors
      if (error.response.status === 401 && !originalRequest._retry) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      return Promise.reject(error.response.data);
    }

    return Promise.reject(error);
  }
);

// Booking interfaces
interface BookingCreate {
  providerId: string;
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
}

interface BookingUpdate {
  status?: 'confirmed' | 'completed' | 'cancelled';
  date?: string;
  time?: string;
  notes?: string;
}

interface Booking extends BookingCreate {
  id: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// API service methods
export const apiService = {
  // Auth endpoints
  auth: {
    login: (data: { email: string; password: string }) => 
      api.post('/auth/login', data),
    register: (data: { name: string; email: string; password: string; phone: string }) => 
      api.post('/auth/register', data),
    registerProvider: (data: { name: string; email: string; password: string; phone: string; location: string; services: string; bio: string }) => 
      api.post('/auth/register/provider', data),
    getCurrentUser: () => 
      api.get('/auth/me'),
  },

  // Services endpoints
  services: {
    getAll: () => api.get('/services'),
    getById: (id: string) => api.get(`/services/${id}`),
  },

  // Providers endpoints
  providers: {
    getAll: () => api.get('/providers'),
    getById: (id: string) => api.get(`/providers/${id}`),
  },

  // Bookings endpoints
  bookings: {
    getAll: () => api.get<Booking[]>('/bookings'),
    getById: (id: string) => api.get<Booking>(`/bookings/${id}`),
    create: (data: BookingCreate) => api.post<Booking>('/bookings', data),
    update: (id: string, data: BookingUpdate) => api.put<Booking>(`/bookings/${id}`, data),
    cancel: (id: string) => api.delete<void>(`/bookings/${id}`),
  },
};

export default api;
