import type { Metadata } from "next";
import { Dashboard } from "@/components/admin/Dashboard";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard — Media Max",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await getSession())) redirect("/admin/login");

  const [pontos, anunciantes] = await Promise.all([
    prisma.pontoMidia.findMany({ orderBy: { criadoEm: "desc" } }),
    prisma.anunciante.findMany({ orderBy: { criadoEm: "desc" } }),
  ]);

  const counts = {
    totalPontos: pontos.length,
    totalAnunciantes: anunciantes.length,
    intencaoSimPontos: pontos.filter((p) => p.intencaoReal === "Sim, tenho interesse real").length,
    intencaoSimAnunciantes: anunciantes.filter((a) => a.intencaoReal === "Sim, tenho interesse real")
      .length,
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <Dashboard pontos={pontos} anunciantes={anunciantes} counts={counts} />
    </div>
  );
}