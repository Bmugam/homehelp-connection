export interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  active: boolean;
  image?: string;
  availability?: {
    days: string[];
    timeSlots: string[];
  };
  createdAt?: string;
  updatedAt?: string;
  providers?: Array<{
    provider_id: number;
    business_name: string;
    provider_name: string;
    location: string;
    price: number;
    verification_status: string;
    average_rating: number;
    review_count: number;
  }>;
}

export interface ServiceCreateInput {
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  active?: boolean;
  image?: string;
}
