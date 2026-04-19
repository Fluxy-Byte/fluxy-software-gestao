export interface ResetPasswordResponseDTO {
  id: string;
  token: string;
  used: boolean;
  userId: string;
  createdAt: Date;
}

export interface CreateResetPasswordDTO {
  token: string;
  userId: string;
}

export interface UpdateResetPasswordDTO {
  used?: boolean;
}