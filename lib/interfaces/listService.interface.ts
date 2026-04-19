export interface ListServicesResponseDTO {
  id: string;
  orderId: string;
  serviceId: string;
  value: number;
  discount: number;
  quantity: number;
}

export interface CreateListServicesDTO {
  orderId: string;
  serviceId: string;
  value: number;
  discount?: number;
  quantity?: number;
}

export interface UpdateListServicesDTO {
  value?: number;
  discount?: number;
  quantity?: number;
}