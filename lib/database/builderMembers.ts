import { prisma } from "@/lib/prisma";
import { CreateBuilderMemberDTO } from "@/lib/interfaces/builderMembers.interface";

export async function createBuilderMember(data: CreateBuilderMemberDTO) {
    return await prisma.builderMember.create({
        data
    })
}

export async function deleteBuilderMemberToIdUser(userId: string) {
    return await prisma.builderMember.deleteMany({
        where: {
            userId
        }
    })
}

export async function deleteBuilderMemberToIdBuilder(id: string) {
    return await prisma.builderMember.deleteMany({
        where: {
            id
        }
    })
}