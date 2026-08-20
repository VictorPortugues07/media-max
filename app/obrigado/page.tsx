import type { Metadata } from "next";
import Link from "next/link";
import { getStats } from "@/lib/stats";

export const metadata: Metadata = {
  title: "Cadastro recebido — Media Max",
  description: "Você agora faz parte da rede Media Max.",
};

export const dynamic = "force-dynamic";

export default async function ObrigadoPage(props: {
  searchParams: Promise<{ tipo?: string; cidade?: string }>;
}) {
  const { tipo, cidade } = await props.searchParams;
  const stats = await getStats();
  const isPonto = tipo !== "anunciante";
  const cidadeLabel = cidade && cidade !== "undefined" ? cidade : "sua região";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="rounded-2xl border border-edge bg-surface p-8 text-center sm:p-10">
        <div className="bg-brand-gradient mx-auto flex h-16 w-16 items-center justify-center rounded-full">
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-display mt-6 text-3xl font-bold text-zinc-900 sm:text-4xl">
          Cadastro recebido!
        </h1>
        <p className="mt-4 text-zinc-600">
          {isPonto
            ? "Obrigado por demonstrar interesse em fazer parte da rede Media Max."
            : "Obrigado por demonstrar interesse em anunciar com a Media Max."}
        </p>

        <div className="mt-8 rounded-xl border border-brand-500/30 bg-brand-500/10 p-5 text-sm text-zinc-700">
          <p className="font-semibold text-brand-700">Você agora faz parte da rede Media Max</p>
          <p className="mt-2">
            Hoje já temos <strong className="text-zinc-900">{stats.totalPontos} estabelecimentos</strong>{" "}
            com TVs disponíveis e{" "}
            <strong className="text-zinc-900">{stats.totalAnunciantes} anunciantes</strong>{" "}
            interessados em {cidadeLabel}.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <p className="text-sm text-zinc-500">
            {isPonto
              ? "Vamos priorizar as regiões com mais interesse para começar a operar. Se você autorizou, entraremos em contato."
              : "Vamos priorizar as regiões com mais estabelecimentos interessados. Se você autorizou, entraremos em contato."}
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="bg-brand-gradient rounded-full px-7 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Voltar para a página inicial
            </Link>
            <Link
              href={isPonto ? "/cadastro/anunciante" : "/cadastro/ponto"}
              className="rounded-full border border-zinc-300 px-7 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-900"
            >
              {isPonto ? "Também quero anunciar" : "Também tenho uma TV"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}