import { UserResponse } from "@/lib/interfaces/user.interface";
import { BuilderMemberResponse } from "@/lib/interfaces/builderMembers.interface";

export interface CreateBuilderDTO {
    name: string;
    tokenBuilder: string;
    tokenRooter: string;
    url: string;

    idUserCreate: string;
    idUserUpdate: string;
}

export interface UpdateBuilderDTO {
    name?: string;
    tokenBuilder?: string;
    tokenRooter?: string;
    url?: string;

    idUserUpdate: string;
}

export interface BuilderResponse {
    id: string;
    organizationId: string;
    name: string;
    tokenBuilder: string;
    tokenRooter: string;
    url: string;

    idUserCreate: string;
    idUserUpdate: string;

    createDate: Date;
    lastUpdate?: Date | null;
}

export interface BuilderWithRelations extends BuilderResponse {
    builderMemberships: BuilderMemberResponse[];
    userCreate: UserResponse;
    userUpdate: UserResponse;
  }