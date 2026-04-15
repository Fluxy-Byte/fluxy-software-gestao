import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { deleteBuilder } from "@/lib/database/builder";
import { deleteBuilderMemberToIdBuilder } from "@/lib/database/builderMembers";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const session = await auth.api.getSession({
            headers: req.headers,
        });

        if (!session || !session.user || !id) {
            return NextResponse.json(
                {
                    status: false,
                    message: "Não encontramos a sessão do usuário ou id da organização",
                },
                { status: 401 }
            );
        }

        if (session.user.role != "admin" && session.user.role != "telek") {
            return NextResponse.json(
                {
                    status: false,
                    message: "Seu usuario não tem permisão para concluir essa solicitação",
                },
                { status: 403 }
            );
        }

        await deleteBuilderMemberToIdBuilder(id);
        await deleteBuilder(id);

        return NextResponse.json({
            status: true,
            message: "Deletado com sucesso"
        });
    } catch (e) {
        return NextResponse.json(
            {
                status: false,
                message: "Erro interno no servidor",
            },
            { status: 500 }
        );
    }
}