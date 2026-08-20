import { prisma } from "@/lib/prisma";
import { geocodeAddress, mapLimit } from "@/lib/geocode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Ponto {
  nomeEmpresa: string;
  categoria: string;
  bairro: string;
  cidade: string;
  lat: number;
  lng: number;
}

export async function GET() {
  try {
    const [pontos, anunciantes] = await Promise.all([
      prisma.pontoMidia.findMany({
        select: {
          nomeEmpresa: true,
          categoria: true,
          bairro: true,
          cidade: true,
          rua: true,
          numero: true,
          uf: true,
        },
      }),
      prisma.anunciante.findMany({
        select: {
          nomeEmpresa: true,
          categoria: true,
          bairro: true,
          cidade: true,
          rua: true,
          numero: true,
          uf: true,
        },
      }),
    ]);

    const [geoPontos, geoAnunciantes] = await Promise.all([
      mapLimit(pontos, 4, async (p) => ({
        ...p,
        geo: await geocodeAddress(p),
      })),
      mapLimit(anunciantes, 4, async (a) => ({
        ...a,
        geo: await geocodeAddress(a),
      })),
    ]);

    const toPoint = (p: (typeof geoPontos)[number]): Ponto | null =>
      p.geo
        ? {
            nomeEmpresa: p.nomeEmpresa,
            categoria: p.categoria,
            bairro: p.bairro,
            cidade: p.cidade,
            lat: p.geo.lat,
            lng: p.geo.lng,
          }
        : null;

    return Response.json({
      pontos: geoPontos.map(toPoint).filter((p): p is Ponto => p !== null),
      anunciantes: geoAnunciantes.map(toPoint).filter((p): p is Ponto => p !== null),
    });
  } catch (err) {
    console.error("Erro ao buscar pontos do mapa:", err);
    return Response.json({ error: "Erro ao buscar pontos do mapa" }, { status: 500 });
  }
}