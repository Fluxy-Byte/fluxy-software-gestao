import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

export async function getUsers() {
    return await prisma.user.findMany({
        include: {
            builderMemberships: true
        }
    })
}

export async function updateUser(id: string, name: string, email: string, role: string) {
    return await prisma.user.update({
        where: {
            id
        },
        data: {
            name,
            email,
            role,
            updatedAt: new Date()
        }
    })
}

export async function deleteUser(id: string) {
    return await prisma.user.delete({
        where: {
            id
        }
    })
}


export async function updatePassWordUser(userId: string, newPassword: string, req: Request) {
    return await auth.api.setUserPassword({
        headers: req.headers,
        body: {
            userId,
            newPassword
        }
    });
}

export async function updatePassWordUserWhitToken(newPassword: string, token: string) {
    try {
        const dados = await auth.api.resetPassword({
            body: {
                newPassword,
                token
            },
        });
        return dados
    } catch (e) {
        console.error(e)
    }
}

export async function sendTokenResetPassWordUser(email: string) {
    return await auth.api.requestPasswordReset({
        body: {
            email,
            redirectTo: "https://thato.nijpgo.easypanel.host/reset-password",
        },
    });
}

export async function createUser(name: string, email: string, password: string, role: string) {
    const user = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password
        }
    })

    if (user) {
        await prisma.user.update({
            where: {
                id: user.user.id
            },
            data: {
                role
            }
        })
    }

    return user;
}

export async function getUserWithEmail(email: string) {
    return await prisma.user.findFirst({
        where: {
            email
        }
    })
}