export interface Review {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Provider {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  reviewList?: Review[];
  location: string;
  phone: string;
  email: string;
  bio: string;
  services: string[];
  experience: number;
  verified: boolean;
  hourlyRate?: number;
}
