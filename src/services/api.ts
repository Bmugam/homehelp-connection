import axios from 'axios';
import { API_BASE_URL } from '../apiConfig'; // fixed import path

// Create axios instance with custom config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Remove withCredentials if you're not using cookies
  // withCredentials: true
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
    if (error.response) {
      // Handle CORS and other errors
      if (error.response.status === 0 || error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(new Error('Authentication failed'));
      }
      return Promise.reject(error.response.data);
    }
    
    if (error.request) {
      console.error('Network Error:', error);
      return Promise.reject(new Error('Network error - please check your connection'));
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
  location: string;
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

interface AdminBooking {
  id: number;
  provider_id: number;
  service_id: number;
  date: string;
  time_slot: string;
  location: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
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
    getAll: () => api.get('/api/services'),
    getById: (id: string) => api.get(`/api/services/${id}`),
    getProvidersByService: (serviceId: string) => api.get(`/api/services/${serviceId}/providers`),
  },

  // Providers endpoints
  providers: {
    getAll: () => api.get('/api/providers'),
    getById: (id: string) => api.get(`/api/providers/${id}`),  // fixed path here
    getByService: (serviceId: string) => api.get(`/api/providers/service/${serviceId}`),
    getAppointments: (providerId: string | number) => 
      api.get(`/api/bookings/provider/${providerId}`), // Updated endpoint path
    updateAppointmentStatus: (id: number, status: string, providerId: string | number) => 
      api.put(`/api/appointments/${id}/status`, { status, providerId }),
  },

  // Bookings endpoints
    bookings: {
      getUserBookings: () => api.get<Booking[]>('/api/bookings'),
      getById: (id: string) => api.get<Booking>(`/api/bookings/${id}`),
      create: (data: BookingCreate) => api.post<Booking>('/api/bookings', data),
      update: (id: string, data: BookingUpdate) => api.put<Booking>(`/api/bookings/${id}`, data),
      cancel: (id: string, reason?: string) => 
        api.request({ url: `/api/bookings/${id}`, method: 'DELETE', data: { reason } }),
      reschedule: (id: string, newDate: string, newTime: string) =>
        api.patch<Booking>(`/api/bookings/${id}/reschedule`, { date: newDate, time: newTime }),
      getAllForAdmin: () => api.get<AdminBooking[]>('/api/admin/bookings').then(res => res.data),
  },
};

export default api;
