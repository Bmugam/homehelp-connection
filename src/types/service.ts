export interface Provider {
  provider_id: number;
  business_name: string;
  provider_name?: string;
  provider_image?: string;
  location?: string;
  price?: number;
  description?: string;
  availability?: unknown;
  verification_status?: string;
  average_rating?: number;
  review_count?: number;
  duration?: number;
  isActive?: boolean;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  category: string;
  imageUrl?: string;
  price?: number;
  duration?: number;
  isActive?: boolean;
  providers?: Provider[];
}

export interface ServiceCreateInput {
  name: string;
  description?: string;
  category: string;
  imageFile?: File | null;
  price?: number;
  duration?: number;
  imageUrl?: string;
}

export type ServiceWithDefaults = Service & {
  price: number;
  duration: number;
  isActive: boolean;
};

export const DEFAULT_SERVICE_VALUES: ServiceWithDefaults = {
  id: '',
  name: '',
  description: '',
  category: '',
  imageUrl: '',
  price: 0,
  duration: 30,
  isActive: true,
  providers: []
};
