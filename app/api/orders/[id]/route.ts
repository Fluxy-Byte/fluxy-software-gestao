import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { updateListService } from "@/lib/database/listServices";
import { updateOrder, deleteOrder } from "@/lib/database/order";

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

    await deleteOrder(id);

    return NextResponse.json({
      status: true,
      message: "Sucesso ao deletar pedido",
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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { statusOrder, payment, items } = await req.json();

    const order = await updateOrder(id, statusOrder, payment);

    if (items && items.length > 0) {
      await Promise.all(items.map(async (item: { id: string, value?: number, discount?: number, quantity?: number }) => {
        const { id: itemId, ...data } = item;
        await updateListService(itemId, data);
      }));
    }

    return NextResponse.json(
      {
        status: order ? true : false,
        order,
        message: "Sucesso ao atualizar pedido",
      },
      { status: 200 }
    );
    
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
