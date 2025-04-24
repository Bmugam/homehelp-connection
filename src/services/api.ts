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

// Add debug logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status}`, response.data);
    return response;
  },
  async (error) => {
    console.error('[API Error]', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
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

interface CreateAppointmentDTO {
  clientName: string;
  service: string;
  date: string;
  time: string;
  location: string;
  providerId: string | number;
}

interface Appointment {
  id: number;
  clientName: string;
  service: string;
  date: string;
  time: string;
  location: string;
  status: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  jobsCompleted: number;
  lastService: string;
  lastServiceDate: string;
  rating: number;
  favorites: boolean;
  status: 'active' | 'inactive';
}

interface ProviderServiceData {
  name: string;
  description: string;
  category: string;
  price: number;
  availability: {
    days: string[];
    timeSlots: string[];
  };
  active: boolean;
  image?: string;
}

// Add new interfaces
interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
}

interface ServiceCreate {
  name: string;
  description: string;
  category: string;
  price: number;
  providerId: string | number;
  availability: {
    days: string[];
    timeSlots: string[];
  };
  active: boolean;
  image?: string;
}

interface Service extends ServiceCreate {
  id: number;
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

  // Updated services endpoints
  services: {
    // Get all services with optional filters
    getAll: (params?: { category?: string; active?: boolean; search?: string }) => 
      api.get<Service[]>('/api/services', { params }),
    
    // Get single service
    getById: (id: string | number) => 
      api.get<Service>(`/api/services/${id}`),
    
    // Create new service
    create: (data: ServiceCreate) => 
      api.post<Service>('/api/services', data),
    
    // Update service
    update: (id: string | number, data: Partial<ServiceCreate>) => 
      api.put<Service>(`/api/services/${id}`, data),
    
    // Delete service
    delete: (id: string | number) => 
      api.delete(`/api/services/${id}`),
    
    // Toggle service active status
    toggleStatus: (id: string | number, active: boolean) => 
      api.patch<Service>(`/api/services/${id}/status`, { active }),
    
    // Get all service categories
    getCategories: () => 
      api.get<ServiceCategory[]>('/api/services/service-categories'),
    
    // Create service category (admin only)
    createCategory: (data: Omit<ServiceCategory, 'id'>) => 
      api.post<ServiceCategory>('/api/services/service-categories', data),
    
    // Update service category (admin only)
    updateCategory: (id: number, data: Partial<Omit<ServiceCategory, 'id'>>) => 
      api.put<ServiceCategory>(`/api/services/service-categories/${id}`, data),
    
    // Delete service category (admin only)
    deleteCategory: (id: number) => 
      api.delete(`/api/services/service-categories/${id}`),
    
    // Get services by provider
    getProviderServices: (providerId: string | number) => 
      api.get<Service[]>(`/api/providers/${providerId}/services`),
    
    // Get providers offering a specific service
    getProvidersByService: (serviceId: string | number) => 
      api.get(`/api/services/${serviceId}/providers`),
  },

  // Providers endpoints
  providers: {
    getAll: () => api.get('/api/providers'),
    getById: (id: string) => api.get(`/api/providers/${id}`),  // fixed path here
    getByService: (serviceId: string) => api.get(`/api/providers/service/${serviceId}`),
    getAppointments: (userId: string | number) => 
      api.get<{ success: boolean; data: Appointment[] }>(`/api/bookings/provider/${userId}`),
    updateAppointmentStatus: (id: number, status: string, userId: string | number) => 
      api.post(`/api/bookings/${id}/status`, { status, userId }),
    createAppointment: (data: CreateAppointmentDTO) => 
      api.post('/api/bookings', data),
    deleteAppointment: (appointmentId: number, userId: string | number) => 
      api.request({ url: `/api/bookings/${appointmentId}`, method: 'DELETE', data: { userId } }),

    // Provider services endpoints updated with new interfaces
    getServices: (providerId: string | number) => 
      api.get<Service[]>(`/api/providers/${providerId}/services`),
    
    addService: (providerId: string | number, data: Omit<ServiceCreate, 'providerId'>) => 
      api.post<Service>(`/api/providers/${providerId}/services`, data),
    
    updateService: (providerId: string | number, serviceId: string | number, data: Partial<Omit<ServiceCreate, 'providerId'>>) => 
      api.put<Service>(`/api/providers/${providerId}/services/${serviceId}`, data),
    
    deleteService: (providerId: string | number, serviceId: string | number) => 
      api.delete(`/api/providers/${providerId}/services/${serviceId}`),
    
    toggleServiceStatus: (providerId: string | number, serviceId: string | number, active: boolean) => 
      api.patch<Service>(`/api/providers/${providerId}/services/${serviceId}/status`, { active }),
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

  // Clients endpoints
  clients: {
    getAll: (providerId: string | number) => 
      api.get<Client[]>(`/api/clients/provider/${providerId}`), // Updated path
    getById: (clientId: number) => 
      api.get<Client>(`/api/clients/${clientId}`),
    create: (data: Omit<Client, 'id'>) => 
      api.post<Client>('/api/clients', data),
    update: (clientId: number, data: Partial<Client>) => 
      api.put<Client>(`/api/clients/${clientId}`, data),
    delete: (clientId: number) => 
      api.delete(`/api/clients/${clientId}`),
    toggleFavorite: (clientId: number) => 
      api.post(`/api/clients/${clientId}/favorite`),
    updateStatus: (clientId: number, status: 'active' | 'inactive') => 
      api.put(`/api/clients/${clientId}/status`, { status }),
  },
};

export default api;
