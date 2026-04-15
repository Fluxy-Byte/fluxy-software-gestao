import { BuilderResponse } from "@/lib/interfaces/builder.interface";
import { UserResponse } from "@/lib/interfaces/user.interface";

export interface CreateBuilderMemberDTO {
    idBuilder: string;
    userId: string;
}

export interface BuilderMemberResponse {
    id: string;
    idBuilder: string;
    userId: string;
    role: string;
}

export interface BuilderMemberWithRelations extends BuilderMemberResponse {
    builder: BuilderResponse;
    user: UserResponse;
}