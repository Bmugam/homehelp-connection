
export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
