import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre — Media Max",
  description:
    "Entenda o que a Media Max resolve, como funciona a conexão entre pontos de mídia e anunciantes, e por que esta é uma fase de validação sem custo.",
};

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <p className="font-display mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
        Sobre o projeto
      </p>
      <h1 className="font-display text-4xl font-bold text-zinc-900 sm:text-5xl">
        Conecta marcas. <span className="text-brand-gradient">Amplifica resultados.</span>
      </h1>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="font-display text-2xl font-bold text-zinc-900">A oportunidade</h2>
          <p className="mt-3 leading-relaxed text-zinc-600">
            Todos os dias, academias, barbearias, clínicas e restaurantes mantêm TVs ligadas em
            recepções e áreas de espera. Essas telas passam horas exibindo conteúdo repetido, sem
            gerar retorno nenhum. No outro lado, empresas gastam com anúncios que alcançam pessoas
            do outro lado da cidade — ou do país — enquanto o cliente ideal está ali, esperando
            atendimento a poucos metros delas.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-zinc-900">A solução</h2>
          <p className="mt-3 leading-relaxed text-zinc-600">
            A Media Max conecta os dois lados. Estabelecimentos com TVs transformam telas
            subutilizadas em espaço publicitário remunerado. Anunciantes alcançam clientes da
            região, no momento em que estão parados, olhando para uma tela. Uma rede de mídia
            indoor construída de baixo para cima: bairro por bairro, estabelecimento por
            estabelecimento.
          </p>
        </section>

        <section className="rounded-2xl border border-edge bg-surface p-6">
          <h2 className="font-display text-xl font-bold text-zinc-900">Na prática</h2>
          <p className="mt-3 leading-relaxed text-zinc-600">
            Imagine uma academia de bairro com duas TVs na sala de musculação. Na outra quadra,
            uma barbearia quer atrair clientes que frequentam a academia. A Media Max conecta as
            duas: a barbearia anuncia na tela da academia, o público da academia conhece o serviço
            da barbearia, e a academia recebe por cada campanha exibida. Todos ganham — o
            estabelecimento, o anunciante e o público, que recebe conteúdo útil enquanto espera.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-zinc-900">
            Esta é uma fase de validação
          </h2>
          <p className="mt-3 leading-relaxed text-zinc-600">
            Antes de colocar a plataforma no ar, queremos confirmar que existe interesse real dos
            dois lados do mercado. Por isso, o cadastro agora é apenas um registro de interesse:{" "}
            <strong className="text-zinc-900">não gera cobrança, não gera compromisso e não obriga a nada</strong>.
            Ele serve para medir a demanda na sua região e priorizar onde a Media Max vai
            começar a operar.
          </p>
        </section>

        <div className="flex flex-col items-center gap-3 rounded-2xl border border-edge bg-surface p-8 text-center sm:flex-row sm:justify-center">
          <Link
            href="/cadastro/ponto"
            className="bg-brand-gradient rounded-full px-7 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Tenho uma TV
          </Link>
          <Link
            href="/cadastro/anunciante"
            className="rounded-full border border-zinc-300 px-7 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-900"
          >
            Quero anunciar
          </Link>
        </div>
      </div>
    </div>
  );
}