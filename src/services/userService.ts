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
};

export default userService;
