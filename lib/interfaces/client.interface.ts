import { OrderResponseDTO } from "./order.interface";

export interface ClientResponseDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  cep: string;
  cpf?: string | null;
  cnpj?: string | null;
  active: boolean;
  discount: number;
  increase: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  orders?: OrderResponseDTO[];
}

export interface CreateClientDTO {
  name: string;
  email: string;
  phone: string;
  address: string;
  cep: string;
  cpf?: string;
  cnpj?: string;
  discount?: number;
  increase?: number;
  userId: string;
}

export interface UpdateClientDTO {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  cep?: string;
  cpf?: string;
  cnpj?: string;
  active?: boolean;
  discount?: number;
  increase?: number;
}