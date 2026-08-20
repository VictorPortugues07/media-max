"use client";

import { useState } from "react";
import Link from "next/link";
import { LiveSocial } from "@/components/LiveSocial";
import type { Stats } from "@/lib/stats";

interface HomePageClientProps {
  initialStats: Stats;
}

export function HomePageClient({ initialStats }: HomePageClientProps) {
  const [profile, setProfile] = useState<"ponto" | "anunciante">("ponto");
  const [openCollapse, setOpenCollapse] = useState<number | null>(0);

  const collapseData = {
    ponto: {
      tag: "Para Estabelecimentos",
      title: "Como funciona para quem tem TV no estabelecimento",
      desc: "Transforme o tempo de espera dos seus clientes em uma fonte extra de renda mensal sem custo operacional.",
      ctaText: "Cadastrar minha TV gratuitamente",
      ctaHref: "/cadastro/ponto",
      items: [
        {
          title: "Como minha TV passa a gerar renda?",
          content:
            "Sua TV passa a exibir uma grade intercalada com anúncios de empresas e serviços locais da sua região. Você recebe mensalmente pela disponibilidade da sua tela.",
        },
        {
          title: "Quais são os requisitos para a TV do meu espaço?",
          content:
            "Basta ter uma TV em funcionamento em local visível aos clientes e conexão com internet Wi-Fi no estabelecimento. Não precisa adquirir novos equipamentos.",
        },
        {
          title: "Eu tenho controle sobre o que é exibido?",
          content:
            "Sim. Todos os anúncios passam por moderação rigorosa para garantir conteúdo profissional, seguro e adequado ao ambiente do seu comércio.",
        },
        {
          title: "Como é feita a instalação e exibição?",
          content:
            "O processo é simples e compatível com as telas convencionais. O sistema roda automaticamente durante o horário de funcionamento do seu negócio.",
        },
      ],
      stepsTitle: "Como funciona para o seu estabelecimento",
      stepsDesc: "Três passos simples para transformar sua tela em fonte de receita.",
      steps: [
        {
          n: "01",
          title: "Cadastre seu Ponto",
          desc: "Informe dados básicos do seu negócio e a quantidade de TVs já ligadas no seu espaço.",
          icon: (
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100/80 mb-4">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4" />
              </svg>
            </div>
          ),
        },
        {
          n: "02",
          title: "Ativação da Grade",
          desc: "Conectamos anunciantes da sua região com conteúdos adequados e seguros para o seu público.",
          icon: (
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100/80 mb-4">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          ),
        },
        {
          n: "03",
          title: "Exibição & Repasses",
          desc: "As campanhas rodam automaticamente na sua tela e você recebe sua remuneração mensal.",
          icon: (
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100/80 mb-4">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          ),
        },
      ],
    },
    anunciante: {
      tag: "Para Anunciantes",
      title: "Como funciona para quem quer anunciar",
      desc: "Coloque sua marca em evidência nos pontos comerciais mais movimentados e estratégicos da sua cidade.",
      ctaText: "Cadastrar como anunciante",
      ctaHref: "/cadastro/anunciante",
      items: [
        {
          title: "Onde meus anúncios serão exibidos?",
          content:
            "Em TVs instaladas em estabelecimentos parceiros com grande circulação, como academias, restaurantes, salões, clínicas e cafés.",
        },
        {
          title: "Posso escolher a região e os bairros?",
          content:
            "Sim. Você define exatamente quais regiões ou tipos de comércio fazem mais sentido para o perfil do seu público-alvo.",
        },
        {
          title: "Quais formatos de anúncio são aceitos?",
          content:
            "Você pode veicular imagens estáticas ou pequenos vídeos promocionais em alta definição, com chamadas diretas e QR Code.",
        },
        {
          title: "Como funciona a contratação nesta fase?",
          content:
            "O cadastro agora é um registro de interesse sem custos ou compromisso, permitindo que você garanta prioridade nas melhores localizações de exibição.",
        },
      ],
      stepsTitle: "Como funciona para a sua marca",
      stepsDesc: "Três passos rápidos para colocar sua empresa em destaque no seu bairro.",
      steps: [
        {
          n: "01",
          title: "Defina sua Região",
          desc: "Selecione os bairros e perfis de estabelecimentos onde seu público-alvo frequenta.",
          icon: (
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100/80 mb-4">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          ),
        },
        {
          n: "02",
          title: "Envie seu Anúncio",
          desc: "Suba sua imagem ou vídeo promocional com oferta clara e contatos diretos.",
          icon: (
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100/80 mb-4">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          ),
        },
        {
          n: "03",
          title: "Impacte & Venda",
          desc: "Sua marca passa a ser vista diariamente com alto tempo de atenção e retenção.",
          icon: (
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100/80 mb-4">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          ),
        },
      ],
    },
  };

  const current = collapseData[profile];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Principal Elegante e Focado */}
      <section className="relative pt-8 sm:pt-14 pb-4 overflow-hidden">
        {/* Glow de fundo suave */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center overflow-hidden"
        >
          <div className="h-[420px] w-[700px] flex-none rounded-full bg-gradient-to-tr from-blue-400/20 via-sky-300/15 to-transparent blur-3xl opacity-70 animate-pulse-glow" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          {/* Título Principal Claro e Direto */}
          <h1 className="font-display mx-auto max-w-2xl text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl leading-[1.15]">
            Conectamos <span className="text-brand-gradient">telas locais</span> a marcas que querem se destacar
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-slate-600 leading-relaxed">
            Selecione seu perfil abaixo para entender como a plataforma funciona para o seu objetivo:
          </p>

          {/* Seletor de Perfil por Botões Interativos com Cor da Marca */}
          <div className="mt-8 inline-flex items-center rounded-full border border-slate-200/80 bg-white/90 p-1.5 shadow-sm backdrop-blur-md">
            <button
              onClick={() => {
                setProfile("ponto");
                setOpenCollapse(0);
              }}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 ${
                profile === "ponto"
                  ? "bg-brand-gradient text-white shadow-md shadow-blue-500/25"
                  : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/50"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 21h8m-4-4v4" />
              </svg>
              <span>Tenho uma TV</span>
            </button>

            <button
              onClick={() => {
                setProfile("anunciante");
                setOpenCollapse(0);
              }}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 ${
                profile === "anunciante"
                  ? "bg-brand-gradient text-white shadow-md shadow-blue-500/25"
                  : "text-slate-600 hover:text-blue-600 hover:bg-blue-50/50"
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <span>Quero anunciar</span>
            </button>
          </div>
        </div>
      </section>

      {/* Seção Dinâmica de Collapses / Informações do Perfil Selecionado */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 sm:p-10 shadow-sm backdrop-blur-sm transition-all duration-300">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 mb-3">
              {current.tag}
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-950">
              {current.title}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              {current.desc}
            </p>
          </div>

          {/* Itens do Collapse */}
          <div className="space-y-3">
            {current.items.map((item, idx) => {
              const isOpen = openCollapse === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenCollapse(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left transition-colors hover:bg-slate-50/70"
                  >
                    <span className="font-display text-sm sm:text-base font-semibold text-slate-900 pr-4">
                      {item.title}
                    </span>
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-transform duration-200 ${
                        isOpen ? "rotate-180 bg-blue-50 text-blue-600" : ""
                      }`}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 pt-1 sm:px-5 border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Botão de Ação Direto Correspondente */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center justify-center text-center">
            <Link
              href={current.ctaHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-brand-gradient px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:opacity-95 hover:shadow-blue-500/35 hover:-translate-y-0.5"
            >
              <span>{current.ctaText}</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <p className="mt-3 text-xs text-slate-400">
              Sem custo • Sem fidelidade • Cadastro em menos de 2 minutos
            </p>
          </div>
        </div>
      </section>

      {/* Seção Como Funciona Dinâmica por Perfil */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Etapas
          </p>
          <h2 className="font-display mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
            {current.stepsTitle}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            {current.stepsDesc}
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {current.steps.map((step) => (
            <div
              key={step.n}
              className="relative flex flex-col items-center rounded-3xl border border-slate-200/80 bg-white p-7 text-center shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-md"
            >
              {step.icon}
              <span className="font-mono text-xs font-bold text-blue-600 tracking-wider">
                PASSO {step.n}
              </span>
              <h3 className="font-display mt-2 text-base font-bold text-slate-950">
                {step.title}
              </h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Mapa de Rede em Expansão */}
      <LiveSocial initial={initialStats} />

      {/* Vantagens Claras */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-8 sm:p-12 backdrop-blur-sm shadow-sm">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Diferenciais
            </p>
            <h2 className="font-display mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
              Por que participar da rede Media Max
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Uma solução pensada para valorizar o comércio local e potencializar marcas parceiras.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-6">
              <h3 className="font-display text-base font-bold text-slate-900">
                Para quem tem Estabelecimento
              </h3>
              <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Renda extra mensal sem necessidade de investimento.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Controle total sobre o tipo de anúncio exibido.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Configuração simples que não atrapalha sua rotina.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-6">
              <h3 className="font-display text-base font-bold text-slate-900">
                Para quem quer Anunciar
              </h3>
              <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Presença física em locais com grande circulação.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Atenção qualificada enquanto os clientes aguardam.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Segmentação precisa por bairros e perfil de público.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Chamada Final Minimalista */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-6">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-center text-white sm:px-12 sm:py-16 shadow-xl shadow-slate-950/10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl"
          />

          <h2 className="font-display relative mx-auto max-w-xl text-2xl font-bold sm:text-4xl">
            Pronto para fazer parte da rede?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-xs sm:text-sm text-slate-300">
            Cadastre sua TV ou reserve espaço para a sua marca sem custos iniciais.
          </p>

          <div className="relative mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/cadastro/ponto"
              className="w-full sm:w-auto rounded-full bg-white px-7 py-3.5 text-xs sm:text-sm font-semibold text-slate-950 shadow-md transition-all duration-300 hover:bg-slate-100 hover:scale-105"
            >
              Tenho uma TV
            </Link>
            <Link
              href="/cadastro/anunciante"
              className="w-full sm:w-auto rounded-full border border-slate-700 bg-slate-900/80 px-7 py-3.5 text-xs sm:text-sm font-semibold text-white transition-all duration-300 hover:bg-slate-800 hover:border-slate-500"
            >
              Quero Anunciar
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
