import { prisma } from "@/lib/prisma";

import { CreateClientDTO, UpdateClientDTO, ClientResponseDTO } from "@/lib/interfaces/client.interface";

export async function getClient(userId: string): Promise<ClientResponseDTO[]> {
    return await prisma.client.findMany({
        where: { userId },
        include:{
            orders: true
        }
    });
}

export async function createClient(data: CreateClientDTO): Promise<ClientResponseDTO> {
    return await prisma.client.create({
        data,
    });
}

export async function updateClient(id: string, data: UpdateClientDTO): Promise<ClientResponseDTO> {
    return await prisma.client.update({
        where: { id },
        data,
    });
}

export async function deleteClient(id: string){
    return await prisma.client.delete({
        where: { id },
    });
}