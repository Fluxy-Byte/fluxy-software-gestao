export interface ServiceResponseDTO {
  id: string;
  name: string;
  value: number;
  active: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceDTO {
  name: string;
  value: number;
  userId: string;
}

export interface UpdateServiceDTO {
  name?: string;
  value?: number;
  active?: boolean;
}