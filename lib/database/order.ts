import { prisma } from "@/lib/prisma";

export async function getOrders() {
    return await prisma.order.findMany({
        include: {
            user: true,
            orderItems: {
                include: {
                    product: true
                }
            },
            listServices: {
                include: {
                    service: true
                }
            }
        }
    })
}

export async function createOrder(userId: string, clientId: string, items: { productId: number, quantity: number }[]) {
    return await prisma.order.create({
        data: {
            userId,
            clientId,
            numberOrder: Math.floor(Math.random() * 1000000),
            orderItems: {
                create: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            }
        }
    })
}

export async function updateOrder(id: string, statusOrder: "PENDING" | "COMPLETED" | "CANCELED", payment: boolean) {
    return await prisma.order.update({
        where: { id },
        data: {
            statusOrder,
            payment
        }
    })
}

export async function deleteOrder(id: string) {
    return await prisma.order.delete({
        where: { id },
    });
}