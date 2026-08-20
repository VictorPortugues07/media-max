import type { Metadata } from "next";
import { AnuncianteForm } from "@/components/forms/AnuncianteForm";

export const metadata: Metadata = {
  title: "Quero anunciar — Media Max",
  description:
    "Cadastre sua empresa e anuncie nas telas dos estabelecimentos da sua região. Sem custo, sem compromisso.",
};

export default function CadastroAnunciantePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="font-display mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
        Cadastro — anunciante
      </p>
      <h1 className="font-display text-3xl font-bold text-zinc-900 sm:text-4xl">
        Anuncie nas telas dos estabelecimentos
      </h1>
      <p className="mt-3 text-zinc-600">
        Leva menos de 2 minutos. Sem custo, sem compromisso — você só registra seu interesse nesta
        fase de validação.
      </p>

      <div className="mt-10 rounded-2xl border border-edge bg-card p-6 sm:p-8">
        <AnuncianteForm />
      </div>
    </div>
  );
}