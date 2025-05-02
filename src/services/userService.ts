import axios from 'axios';
import { API_BASE_URL } from '../apiConfig';

export interface UserData {
  id: number;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  profile_image: string;
  user_type: 'client' | 'provider' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface ClientData {
  id: number;
  user_id: number;
  address: string;
  location_coordinates: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewData {
  id: number;
  booking_id: number;
  rating: number;
  comment: string;
  created_at: string;
  service_name?: string;
  provider_name?: string;
}

const getAuthHeaders = (token?: string) => {
  // Get token from localStorage if not provided
  const authToken = token || localStorage.getItem('token');
  return authToken ? { Authorization: `Bearer ${authToken}` } : undefined;
};

const userService = {
  getUser: async (userId: number, token?: string) => {
    const response = await axios.get(`${API_BASE_URL}/api/clients/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  getClient: async (userId: number, token?: string) => {
    const response = await axios.get(`${API_BASE_URL}/api/clients/user/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  createUser: async (userData: Partial<UserData>, token?: string) => {
    const response = await axios.post(`${API_BASE_URL}/api/users/`, userData, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  updateUser: async (userId: number, userData: Partial<UserData>, token?: string) => {
    const response = await axios.put(`${API_BASE_URL}/api/clients/${userId}`, userData, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  updateClient: async (clientId: number, clientData: Partial<ClientData>, token?: string) => {
    const response = await axios.put(`${API_BASE_URL}/api/clients/${clientId}`, clientData, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  deleteUser: async (userId: number, token?: string) => {
    const response = await axios.delete(`${API_BASE_URL}/api/users/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  uploadProfileImage: async (userId: number, imageFile: File, token?: string) => {
    const formData = new FormData();
    formData.append('profile_image', imageFile);

    const response = await axios.put(`${API_BASE_URL}/api/clients/${userId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return response.data;
  },

  // Review API calls
  createReview: async (reviewData: { bookingId: number; rating: number; comment: string }, token?: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/reviews`, reviewData, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(token)
        }
      });
      return response.data;
    } catch (error) {
      console.error('Review creation error:', error.response?.data || error.message);
      throw error;
    }
  },

  getReviewsByClient: async (token?: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/reviews`, {
        headers: getAuthHeaders(token)
      });
      return response.data as ReviewData[];
    } catch (error) {
      console.error('Get reviews error:', error.response?.data || error.message);
      throw error;
    }
  },

  updateReview: async (reviewId: number, reviewData: { rating: number; comment: string }, token?: string) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/reviews/${reviewId}`, reviewData, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(token)
        }
      });
      return response.data;
    } catch (error) {
      console.error('Update review error:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteReview: async (reviewId: number, token?: string) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/reviews/${reviewId}`, {
        headers: getAuthHeaders(token)
      });
      return response.data;
    } catch (error) {
      console.error('Delete review error:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default userService;
