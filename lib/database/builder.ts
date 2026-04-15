import { prisma } from "@/lib/prisma";
import { CreateBuilderDTO, UpdateBuilderDTO } from "@/lib/interfaces/builder.interface";


export async function getBuilders() {
    return await prisma.builder.findMany({
        select: {
            id: true,
            name: true,
            tokenBuilder: true,
            tokenRooter: true,
            lastUpdate: true,
            createDate: true,
            idUserCreate: true,
            url: true,
            builderMemberships: {
                select: {
                    user: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        }
    })
}

export async function createBuilder(data: CreateBuilderDTO) {
    return await prisma.builder.create({
        data: {
            name: data.name,
            tokenBuilder: data.tokenBuilder,
            tokenRooter: data.tokenRooter,
            url: data.url,
            idUserCreate: data.idUserCreate,
            idUserUpdate: data.idUserUpdate
        }
    })
}

export async function updateBuilder(id: string, dados: UpdateBuilderDTO) {
    const dateNow = new Date().toISOString();
    return prisma.builder.update({
        where: {
            id
        },
        data: {
            ...dados,
            lastUpdate: dateNow
        }
    })
}

export async function deleteBuilder(id: string) {
    return await prisma.builder.delete({
        where: {
            id
        },
        include: {
            builderMemberships: true
        }
    })
}