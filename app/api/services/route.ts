import { NextResponse } from "next/server";
import { getService, createService } from "@/lib/database/service";
import { auth } from "@/lib/auth/auth";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { status: false, users: null, message: "Não encontramos a sessão do usuário" },
        { status: 401 }
      );
    }

    const services = await getService(session.user.id);

    return NextResponse.json({
      status: true,
      services,
      message: "Sucesso na coleta de serviços"
    });
  } catch (e: any) {
    console.error(e);

    return NextResponse.json(
      {
        status: false,
        services: [],
        message: "Erro interno no servidor"
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, value, userId } = await req.json();

  const session = await auth.api.getSession({
    headers: req.headers,
  });


  if (!session || !session.user) {
    return NextResponse.json(
      { status: false, user: null, message: "Não encontramos a sessão do usuário" },
      { status: 401 }
    );
  }

  const service = await createService({name, value, userId});

  return NextResponse.json({
    status: service ? true : false,
    service,
    message: "Sucesso na criação do serviço"
  });
} catch (e: any) {
  console.error(e);

  return NextResponse.json(
    {
      status: false,
      service: null,
      message: "Erro interno no servidor"
    },
    { status: 500 }
  );
}
}


