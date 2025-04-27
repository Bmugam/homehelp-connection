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
  getUser: async (userId: number) => {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
    return response.data;
  },

  getClient: async (userId: number) => {
    const response = await axios.get(`${API_BASE_URL}/clients/user/${userId}`);
    return response.data;
  },

  updateUser: async (userId: number, userData: Partial<UserData>) => {
    const response = await axios.put(`${API_BASE_URL}/users/${userId}`, userData);
    return response.data;
  },

  updateClient: async (clientId: number, clientData: Partial<ClientData>) => {
    const response = await axios.put(`${API_BASE_URL}/clients/${clientId}`, clientData);
    return response.data;
  },

  uploadProfileImage: async (userId: number, imageFile: File) => {
    const formData = new FormData();
    formData.append('profile_image', imageFile);
    const response = await axios.put(`${API_BASE_URL}/users/${userId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteUser: async (userId: number) => {
    const response = await axios.delete(`${API_BASE_URL}/users/${userId}`);
    return response.data;
  },
};

export default userService;
