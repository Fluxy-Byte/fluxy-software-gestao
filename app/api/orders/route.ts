import { NextResponse } from "next/server";
import { getOrders, createOrder } from "@/lib/database/order";
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

    const orders = await getOrders();

    return NextResponse.json({
      status: true,
      orders,
      message: "Sucesso na coleta de pedidos"
    });
  } catch (e: any) {
    console.error(e);

    return NextResponse.json(
      {
        status: false,
        orders: null,
        message: "Erro interno no servidor"
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const {userId, clientId, items} = await req.json();

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

    const order = await createOrder(userId, clientId, items);


    return NextResponse.json({
      status: order ? true : false,
      order,
      message: "Sucesso na criação do pedido"
    });
  } catch (e: any) {
    console.error(e);

    return NextResponse.json(
      {
        status: false,
        order: null,
        message: "Erro interno no servidor"
      },
      { status: 500 }
    );
  }
}


