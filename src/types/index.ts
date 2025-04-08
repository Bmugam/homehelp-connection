export interface Provider {
  id: number;
  name: string;
  image: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  rating: number;
  reviews: number;
  services: Service[];
  verification_status: 'pending' | 'verified' | 'rejected';
}

export interface Service {
  id: number;
  name: string;
  price: number;
  description?: string;
}

export interface Booking {
  id: number;
  provider_id: number;
  service_id: number;
  date: string;
  time_slot: string;
  location: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}
