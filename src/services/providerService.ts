import axios from 'axios';
import { config } from '@/config/config';

export interface Provider {
  provider_id: number;
  name: string;
  email: string;
  phone: string;
  profile_image: string;
  location: string;
  bio: string;
  average_rating: number;
  review_count: number;
  verification_status: string;
  services: string[];
  reviews: Array<{
    id: number;
    rating: number;
    comment: string;
    reviewer_name: string;
    reviewer_image: string;
    created_at: string;
  }>;
}




const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProviderById = async (id: string): Promise<Provider> => {
  const response = await api.get(`/providers/${id}`);
  return response.data as Provider;
};
