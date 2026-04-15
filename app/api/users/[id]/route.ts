import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { deleteUser } from "@/lib/database/user";
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
          message: "Você não tem permissão para deletar uma organização",
        },
        { status: 403 }
      );
    }

    await deleteUser(id);

    await deleteBuilderMemberToIdBuilder(id);

    return NextResponse.json({
      status: true,
      message: "Sucesso ao deletar usuario",
    },
      { status: 200 });
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