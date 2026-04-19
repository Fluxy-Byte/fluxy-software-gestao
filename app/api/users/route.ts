import { NextResponse } from "next/server";
import { updateUser, updatePassWordUser, createUser, getUsers, getUserWithEmail } from "@/lib/database/user";
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

    if (session.user.role != "admin") {
      return NextResponse.json(
        { status: false, users: null, message: "Você não tem acesso de adminstirador" },
        { status: 403 }
      );
    }

    const users = await getUsers();

    return NextResponse.json({
      status: true,
      users,
      message: "Sucesso na coleta de usuarios"
    });
  } catch (e: any) {
    console.error(e);

    return NextResponse.json(
      {
        status: false,
        users: null,
        message: "Erro interno no servidor"
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { idUser, name, email, role, newPassword, color } = await req.json();

    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { status: false, user: [], message: "Não encontramos a sessão do usuario" },
        { status: 401 }
      );
    }

    if (session.user.role != "admin") {
      return NextResponse.json(
        { status: false, user: null, message: "Você não tem acesso de adminstirador" },
        { status: 403 }
      );
    }

    const user = session.user;

    const users = await updateUser(idUser, name, email, role, color);

    if (newPassword) {
      updatePassWordUser(users.id, newPassword, req);
    }

    return NextResponse.json({
      status: true,
      user,
      message: "Sucesso ao atualizar dados do usuario"
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { status: false, user: null, message: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, password, role, color } = await req.json();

    const session = await auth.api.getSession({
      headers: req.headers,
    });


    if (!session || !session.user) {
      return NextResponse.json(
        { status: false, user: null, message: "Não encontramos a sessão do usuário" },
        { status: 401 }
      );
    }

    if (session.user.role != "admin") {
      return NextResponse.json(
        { status: false, user: null, message: "Você não tem acesso de adminstirador" },
        { status: 403 }
      );
    }

    const verificarSeExisteUser = await getUserWithEmail(email);

    if (verificarSeExisteUser) {
      return NextResponse.json({
        status: false,
        user: null,
        message: "Usário ja existe"
      });
    }

    const user = await createUser(
      name,
      email,
      password,
      role,
      color
    );

    return NextResponse.json({
      status: user ? true : false,
      user,
      message: "Sucesso na criação do usuario"
    });
  } catch (e: any) {
    console.error(e);

    return NextResponse.json(
      {
        status: false,
        user: null,
        message: "Erro interno no servidor"
      },
      { status: 500 }
    );
  }
}


