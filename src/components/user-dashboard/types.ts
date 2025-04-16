export interface BookingCreate {
  providerId: string;
  serviceId: string;
  date: string;
  time: string;
  location: string;
  notes?: string;
}

export interface BookingUpdate {
  status?: 'confirmed' | 'completed' | 'cancelled';
  date?: string;
  time?: string;
  notes?: string;
}

export interface BookingType {
  id: number;
  service: string;
  provider: string;
  date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  rating?: number;
  // Additional fields for API operations
  providerId?: string;
  serviceId?: string;
  time?: string;
  location?: string;
  notes?: string;
}

export interface HistoryItemType extends BookingType {
  rating: number;
}

export interface UserDetailsType {
  name: string;
  email: string;
  phone: string;
  address: string;
  memberSince: string;
  profileCompletion: number;
}
