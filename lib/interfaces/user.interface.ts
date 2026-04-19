// GET
export interface UserResponseDTO {
  id: string;
  name?: string;
  email: string;
  role: string;
  color: string;
  banned: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// CREATE
export interface CreateUserDTO {
  name?: string;
  email: string;
  password: string;
  color?: string;
}

// UPDATE
export interface UpdateUserDTO {
  name?: string;
  email?: string;
  role?: string;
  banned?: boolean;
  emailVerified?: boolean;
  color?: string;
}