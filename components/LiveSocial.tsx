"use client";

import { useEffect, useState } from "react";
import type { Stats } from "@/lib/stats";
import { NetworkMap } from "@/components/NetworkMap";

export function LiveSocial({ initial }: { initial: Stats }) {
  const [stats, setStats] = useState(initial);

  useEffect(() => {
    let active = true;
    const tick = async () => {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (active) setStats(data);
        }
      } catch {
        /* keep last values */
      }
    };
    const id = setInterval(tick, 20000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const totalCadastros = stats.totalPontos + stats.totalAnunciantes;

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 sm:p-10 backdrop-blur-sm shadow-sm">
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-1 text-xs font-semibold text-slate-700 mb-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {totalCadastros > 0 ? `${totalCadastros} Pontos Mapeados` : "Mapeamento em Tempo Real"}
            </span>
          </div>

          <h2 className="font-display text-2xl font-bold text-slate-950 sm:text-3xl">
            Rede de Pontos & Parceiros
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Acompanhe o mapa de cadastros e cobertura da rede Media Max na sua região.
          </p>
        </div>

        {/* Mapa Leaflet direto */}
        <div className="mt-8">
          <NetworkMap />
        </div>
      </div>
    </section>
  );
}