import "server-only";
import { prisma } from "@/lib/prisma";

export interface Stats {
  totalPontos: number;
  totalAnunciantes: number;
  intencaoSimPontos: number;
  intencaoSimAnunciantes: number;
  ultimosCadastros: Array<{
    tipo: "ponto" | "anunciante";
    nomeEmpresa: string;
    categoria: string;
    cidade: string;
  }>;
}

export async function getStats(): Promise<Stats> {
  const [totalPontos, totalAnunciantes, intencaoSimPontos, intencaoSimAnunciantes, pontos, anunciantes] =
    await Promise.all([
      prisma.pontoMidia.count(),
      prisma.anunciante.count(),
      prisma.pontoMidia.count({ where: { intencaoReal: "Sim, tenho interesse real" } }),
      prisma.anunciante.count({ where: { intencaoReal: "Sim, tenho interesse real" } }),
      prisma.pontoMidia.findMany({
        select: { nomeEmpresa: true, categoria: true, cidade: true },
        orderBy: { criadoEm: "desc" },
        take: 3,
      }),
      prisma.anunciante.findMany({
        select: { nomeEmpresa: true, categoria: true, cidade: true },
        orderBy: { criadoEm: "desc" },
        take: 3,
      }),
    ]);

  const ultimosCadastros = [
    ...pontos.map((p) => ({ ...p, tipo: "ponto" as const })),
    ...anunciantes.map((a) => ({ ...a, tipo: "anunciante" as const })),
  ];

  return {
    totalPontos,
    totalAnunciantes,
    intencaoSimPontos,
    intencaoSimAnunciantes,
    ultimosCadastros,
  };
}