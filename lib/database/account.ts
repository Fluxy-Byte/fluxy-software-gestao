import { prisma } from "@/lib/prisma";

export async function getAccountUser(userId: string) {
    return await prisma.account.findFirst({
        where: {
            userId
        }
    })
}