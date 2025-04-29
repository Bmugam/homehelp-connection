import api from './api';

export interface DayAvailability {
  active: boolean;
  start: string;
  end: string;
}

export interface AvailabilityHours {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  reviewer_name: string;
  reviewer_image: string;
  created_at: string;
}

export interface Service {
  service_id: number;
  price: string | number;
  description: string;
  availability: AvailabilityHours;
}

export interface Provider {
  provider_id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone: string;
  profile_image: string | null;
  location: string;
  bio: string;
  average_rating: string; // changed from number to string to match backend
  review_count: number;
  verification_status: string;
  services: Service[]; // changed from string[] to Service[]
  reviews: Review[];
  business_name: string | null;
  availability_hours?: AvailabilityHours;
}

export interface ServiceData {
  service_id: number;
  price: string | number;
  description: string;
  availability: AvailabilityHours;
}

export interface ServiceUpdateData {
  price: string | number;
  description: string;
  availability: AvailabilityHours;
}

export const getProviderById = async (id: string): Promise<Provider> => {
  const response = await api.get(`/api/providers/${id}`);
  return response.data as Provider;
};

export const updateProviderProfile = async (id: string, profileData: { business_name: string; business_description: string; location: string }) => {
  const response = await api.put(`/api/providers/${id}`, profileData);
  return response.data;
};

export const updateProviderAvailability = async (id: string, availabilityData: { availability_hours: AvailabilityHours }) => {
  const response = await api.put(`/api/providers/${id}/availability`, availabilityData);
  return response.data;
};

export const getProviderServices = async (id: string) => {
  const response = await api.get(`/api/providers/${id}/services`);
  return response.data;
};

export const addProviderService = async (id: string, serviceData: FormData) => {
  const response = await api.post(`/api/providers/${id}/services`, serviceData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updateProviderService = async (id: string, serviceId: number, serviceData: FormData) => {
  const response = await api.put(`/api/providers/${id}/services/${serviceId}`, serviceData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteProviderService = async (id: string, serviceId: number) => {
  await api.delete(`/api/providers/${id}/services/${serviceId}`);
};
