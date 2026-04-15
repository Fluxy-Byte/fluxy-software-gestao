import { NextResponse } from "next/server";
import { getBuilders, createBuilder, updateBuilder } from "@/lib/database/builder";
import { createBuilderMember } from "@/lib/database/builderMembers";
import { auth } from "@/lib/auth/auth";

export async function GET(req: Request) {

  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { status: false, organizations: [], message: "Não encontramos a sessão do usuario" },
        { status: 401 }
      );
    }

    const builders = await getBuilders();

    return NextResponse.json({
      status: true,
      builders,
      message: "Sucesso ao buscar builders"
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { status: false, builders: [], message: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { organizationId, name, tokenBuilder, tokenRooter, url } = await req.json();

    const session = await auth.api.getSession({
      headers: req.headers,
    });


    if (!session || !session.user) {
      return NextResponse.json(
        { status: false, builder: null, message: "Não encontramos a sessão do usuário" },
        { status: 401 }
      );
    }

    const user = session.user;

    const dados = {
      organizationId,
      name,
      tokenBuilder,
      tokenRooter,
      url,
      idUserCreate: user.id,
      idUserUpdate: user.id
    }

    const builder = await createBuilder(dados);

    if (builder) {
      await createBuilderMember({
        userId: user.id,
        idBuilder: builder.id
      });
    }

    return NextResponse.json({
      status: builder ? true : false,
      builder,
      message: "Sucesso na criação"
    });
  } catch (e: any) {
    console.error(e);

    return NextResponse.json(
      {
        status: false,
        builder: null,
        message: "Erro interno no servidor"
      },
      { status: 500 }
    );
  }
}


export async function PUT(req: Request) {
  try {
    const { id, name, tokenBuilder, tokenRooter, url } = await req.json();

    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { status: false, builder: null, message: "Não encontramos a sessão do usuário" },
        { status: 401 }
      );
    }

    const user = session.user;

    const dados = {
      name,
      tokenBuilder,
      tokenRooter,
      url,
      idUserUpdate: user.id
    }

    const builder = await updateBuilder(
      id,
      dados
    );

    return NextResponse.json({
      status: true,
      builder,
      message: "Sucesso na atualização"
    });
  } catch (e: any) {
    console.error(e);

    return NextResponse.json(
      {
        status: false,
        builder: null,
        message: "Erro interno no servidor"
      },
      { status: 500 }
    );
  }
}