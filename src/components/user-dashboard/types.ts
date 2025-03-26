
export interface BookingType {
  id: number;
  service: string;
  provider: string;
  date: string;
  status: string;
  rating?: number;
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
