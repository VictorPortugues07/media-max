import type { Metadata } from "next";
import { PontoForm } from "@/components/forms/PontoForm";

export const metadata: Metadata = {
  title: "Tenho uma TV — Media Max",
  description:
    "Cadastre seu estabelecimento e transforme sua TV em uma renda extra. Sem custo, sem compromisso.",
};

export default function CadastroPontoPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="font-display mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
        Cadastro — quem tem TV
      </p>
      <h1 className="font-display text-3xl font-bold text-zinc-900 sm:text-4xl">
        Transforme sua TV em renda extra
      </h1>
      <p className="mt-3 text-zinc-600">
        Leva menos de 2 minutos. Sem custo, sem compromisso — você só registra seu interesse nesta
        fase de validação.
      </p>

      <div className="mt-10 rounded-2xl border border-edge bg-card p-6 sm:p-8">
        <PontoForm />
      </div>
    </div>
  );
}