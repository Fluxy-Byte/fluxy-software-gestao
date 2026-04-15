import { prisma } from "@/lib/prisma";


export async function getResetPassWordWithUser(idUser: string) {
    return await prisma.verification.findFirst({
        where: {
            value: idUser
        }
    })
}
