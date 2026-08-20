import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: { type?: "ponto" | "anunciante"; id?: number | string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const { type, id } = body;
  if (!type || id === undefined || id === null) {
    return NextResponse.json({ error: "Parâmetros 'type' e 'id' são obrigatórios" }, { status: 400 });
  }

  const numericId = typeof id === "number" ? id : parseInt(String(id), 10);
  if (isNaN(numericId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    if (type === "ponto") {
      await prisma.pontoMidia.delete({ where: { id: numericId } });
    } else if (type === "anunciante") {
      await prisma.anunciante.delete({ where: { id: numericId } });
    } else {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro ao deletar item:", err);
    return NextResponse.json({ error: "Erro ao excluir o registro" }, { status: 500 });
  }
}
