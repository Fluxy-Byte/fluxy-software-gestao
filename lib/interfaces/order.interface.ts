export interface OrderResponseDTO {
  id: string;
  clientId: string;
  userId: string;
  numberOrder: number;
  statusOrder: "PENDING" | "COMPLETED" | "CANCELED";
  payment: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderDTO {
  clientId: string;
  userId: string;
  numberOrder: number;
}

export interface UpdateOrderDTO {
  statusOrder?: "PENDING" | "COMPLETED" | "CANCELED";
  payment?: boolean;
}