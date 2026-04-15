import { BuilderResponse } from "@/lib/interfaces/builder.interface";
import { BuilderMemberResponse } from "@/lib/interfaces/builderMembers.interface";

export interface CreateUserDTO {
    name?: string;
    email: string;
    role?: string; // opcional (default = "user")
}

export interface UpdateUserDTO {
    name?: string;
    email?: string;
    role?: string;
}

export interface UserResponse {
    id: string;
    name?: string | null;
    email: string;
    role: string;

    createdAt: Date;
    updatedAt: Date;
}

export interface UserWithRelations extends UserResponse {
    builderMemberships: BuilderMemberResponse[];
    buildersCreated?: BuilderResponse[];
    buildersUpdated?: BuilderResponse[];
}