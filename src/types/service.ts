export interface Provider {
  provider_id: string;
  business_name: string;
  provider_name: string;
  location: string;
  price: number;
  description: string;
  availability: string;
  verification_status: string;
  average_rating: number;
  review_count: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  isActive: boolean;
  providers: Provider[];
}

export interface ServiceCreateInput {
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
}

export interface ServiceUpdateInput extends Partial<ServiceCreateInput> {
  isActive?: boolean;
}

// Add this helper type
export type ServiceWithDefaults = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  isActive: boolean;
  providers: Provider[];
};

// Add default values constant
export const DEFAULT_SERVICE_VALUES = {
  price: 0,
  duration: 0,
  isActive: false,
  providers: []
};
