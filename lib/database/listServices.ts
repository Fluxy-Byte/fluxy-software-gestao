import { prisma } from "@/lib/prisma";
import { UpdateListServicesDTO } from "@/lib/interfaces/listService.interface";

export async function updateListService(id: string, data: UpdateListServicesDTO) {
  return await prisma.listServices.update({
    where: { id },
    data,
  });
}