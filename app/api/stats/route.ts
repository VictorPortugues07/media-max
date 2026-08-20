import { getStats } from "@/lib/stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getStats();
    return Response.json(stats);
  } catch (err) {
    console.error("Erro ao buscar stats:", err);
    return Response.json({ error: "Erro ao buscar estatísticas" }, { status: 500 });
  }
}