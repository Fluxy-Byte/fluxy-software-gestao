export interface LogResponseDTO {
  id: string;
  about: string;
  type: string;
  userId: string;
  createdAt: Date;
}

export interface CreateLogDTO {
  about: string;
  type: string;
  userId: string;
}

export interface UpdateLogDTO {
  about?: string;
  type?: string;
}