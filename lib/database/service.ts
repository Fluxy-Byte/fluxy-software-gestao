import { prisma } from "@/lib/prisma";

import { CreateServiceDTO, UpdateServiceDTO, ServiceResponseDTO } from "@/lib/interfaces/service.interface";

export async function getService(userId: string): Promise<ServiceResponseDTO[]> {
    return await prisma.service.findMany({
        where: { userId },
    });
}

export async function createService(data: CreateServiceDTO): Promise<ServiceResponseDTO> {
    return await prisma.service.create({
        data,
    });
}

export async function updateService(id: string, data: UpdateServiceDTO): Promise<ServiceResponseDTO> {
    return await prisma.service.update({
        where: { id },
        data,
    });
}

export async function deleteService(id: string){
    return await prisma.service.delete({
        where: { id },
    });
}