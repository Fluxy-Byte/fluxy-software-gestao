import { NextResponse } from "next/server";
import { getUserWithEmail, sendTokenResetPassWordUser, } from "@/lib/database/user";
import { getResetPassWordWithUser } from "@/lib/database/resetPassWord";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const getUser = await getUserWithEmail(email);

    if (!getUser) {
      return NextResponse.json(
        {
          status: false,
          message: "Não encontramos um usuário com este e-mail!"
        },
        { status: 200 }
      );
    }

    const validarSeUsuarioJaTemSolicitacao = await getResetPassWordWithUser(getUser.id)

    if (validarSeUsuarioJaTemSolicitacao) {
      return NextResponse.json(
        {
          status: false,
          message: "Ja existe uma solicitação para esse e-mail, verifique a caixa de entrada ou solicite um administrador para fazer internamente"
        },
        { status: 200 }
      );
    }

    const enviandoEmailUser = await sendTokenResetPassWordUser(email)

    if (enviandoEmailUser.status == true) {
      return NextResponse.json({
        status: true,
        message: "Enviamos um link para alteração de sua senha!"
      },
        { status: 201 });
    }

    return NextResponse.json({
      status: false,
      message: "Houve um erro interno, tente novamente!"
    },
      { status: 200 });

  } catch (e: any) {
    console.error(e);

    return NextResponse.json(
      {
        status: false,
        message: "Erro interno no servidor"
      },
      { status: 500 }
    );
  }
}