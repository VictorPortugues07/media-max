"use client";

import { Wizard, type FormValues, type Step } from "@/components/forms/Wizard";
import {
  CATEGORIAS,
  CATEGORIAS_RECUSADAS,
  FAIXAS_ETARIAS,
  FLUXO_DIARIO,
  GENEROS,
  INTENCAO_OPCOES,
  LOCAIS_TV,
  PERIODOS,
  TEMPO_PERMANENCIA,
  VALORES_PONTO,
} from "@/lib/options";
import { useRouter } from "next/navigation";

const steps: Step[] = [
  {
    title: "Sobre a empresa",
    subtitle: "Dados de contato para a equipe Media Max falar com você.",
    fields: [
      { id: "nomeEmpresa", type: "text", label: "Nome da empresa", required: true, placeholder: "Ex.: Academia Corpo & Vida", autoComplete: "organization" },
      { id: "responsavel", type: "text", label: "Nome do responsável", required: true, placeholder: "Ex.: Ana Souza", autoComplete: "name" },
      { id: "whatsapp", type: "tel", label: "WhatsApp", required: true, autoComplete: "tel" },
      { id: "instagramSite", type: "text", label: "Instagram e/ou site", optional: true, placeholder: "@suaconta ou https://…" },
    ],
  },
  {
    title: "Localização",
    subtitle: "Digite o CEP e o restante do endereço é preenchido automaticamente.",
    fields: [
      { id: "cep", type: "cep", label: "CEP", required: true },
      { id: "rua", type: "text", label: "Rua", required: true, autoComplete: "address-line1" },
      { id: "numero", type: "text", label: "Número", required: true, half: true, autoComplete: "address-line2" },
      { id: "complemento", type: "text", label: "Complemento", optional: true, half: true, placeholder: "Sala, andar…" },
      { id: "bairro", type: "text", label: "Bairro", required: true, autoComplete: "address-level2" },
      { id: "cidade", type: "text", label: "Cidade", required: true, half: true, autoComplete: "address-level2" },
      { id: "uf", type: "text", label: "UF", required: true, half: true, placeholder: "SP", maxLength: 2 },
    ],
  },
  {
    title: "Seu estabelecimento",
    subtitle: "Conte um pouco sobre o seu negócio.",
    fields: [
      { id: "categoria", type: "select", label: "Categoria do estabelecimento", required: true, options: [...CATEGORIAS], other: true, otherPlaceholder: "Qual categoria?" },
      { id: "descricao", type: "textarea", label: "Descrição curta", required: true, placeholder: "Ex.: Academia com 3 andares, sala de musculação e área de espera…", hint: "Descreva o espaço, o movimento e onde a TV ficaria." },
    ],
  },
  {
    title: "Sobre a TV",
    subtitle: "Onde e quantas telas você tem (ou pretende ter).",
    fields: [
      { id: "possuiTv", type: "radio", label: "Você já possui TV disponível no estabelecimento?", required: true, options: ["Sim", "Não, mas tenho interesse em instalar"] },
      { id: "quantidadeTvs", type: "text", label: "Quantidade de TVs", required: true, placeholder: "Ex.: 2", inputMode: "numeric", visibleIf: { field: "possuiTv", equals: "Sim" } },
      { id: "localInstalacao", type: "multi", label: "Onde as TVs estão instaladas", required: true, options: [...LOCAIS_TV], visibleIf: { field: "possuiTv", equals: "Sim" } },
    ],
  },
  {
    title: "Sobre o público",
    subtitle: "Quem frequenta o seu estabelecimento?",
    fields: [
      { id: "fluxoDiarioEstimado", type: "select", label: "Pessoas por dia (estimativa)", required: true, options: [...FLUXO_DIARIO] },
      { id: "tempoPermanencia", type: "select", label: "Tempo médio de permanência", required: true, options: [...TEMPO_PERMANENCIA] },
      { id: "faixaEtariaPublico", type: "multi", label: "Faixa etária predominante", required: true, options: [...FAIXAS_ETARIAS] },
      { id: "generoPublico", type: "select", label: "Gênero predominante", required: true, options: [...GENEROS] },
      { id: "horariosPico", type: "multi", label: "Horários de maior movimento", optional: true, options: [...PERIODOS] },
    ],
  },
  {
    title: "Interesse comercial",
    subtitle: "Sem compromisso — só para entendermos sua expectativa.",
    fields: [
      { id: "valorDesejado", type: "select", label: "Quanto gostaria de receber por mês pela sua TV?", required: true, options: [...VALORES_PONTO] },
      { id: "categoriasRecusadas", type: "multi", label: "Anunciantes que NÃO aceitaria", required: true, options: [...CATEGORIAS_RECUSADAS], hint: "Selecione todas que se aplicam." },
    ],
  },
  {
    title: "Confirmação de interesse",
    subtitle: "Suas respostas ajudam a validar a rede na sua região.",
    fields: [
      {
        id: "intencaoReal",
        type: "radio",
        label: "Se encontrarmos hoje uma empresa interessada em anunciar no seu estabelecimento, você estaria disposto a disponibilizar sua TV?",
        required: true,
        options: [...INTENCAO_OPCOES],
        highlight: true,
      },
      { id: "aceitaContato", type: "radio", label: "Posso entrar em contato com você quando a Media Max estiver disponível?", required: true, options: ["Sim", "Não"] },
    ],
  },
];

export function PontoForm() {
  const router = useRouter();

  const onSubmit = async (values: FormValues) => {
    const f = values.fields;
    const payload = {
      nomeEmpresa: f.nomeEmpresa,
      responsavel: f.responsavel,
      whatsapp: f.whatsapp,
      instagramSite: f.instagramSite ?? "",
      cep: f.cep,
      rua: f.rua,
      numero: f.numero,
      complemento: f.complemento ?? "",
      bairro: f.bairro,
      cidade: f.cidade,
      uf: f.uf,
      categoria: f.categoria === "Outro" ? f.categoriaOutro : f.categoria,
      descricao: f.descricao,
      possuiTv: f.possuiTv === "Sim",
      quantidadeTvs: f.possuiTv === "Sim" ? Number(f.quantidadeTvs) : null,
      localInstalacao: values.multis.localInstalacao?.join(", ") ?? "",
      fluxoDiarioEstimado: f.fluxoDiarioEstimado,
      tempoPermanencia: f.tempoPermanencia,
      faixaEtariaPublico: values.multis.faixaEtariaPublico ?? [],
      generoPublico: f.generoPublico,
      horariosPico: values.multis.horariosPico?.join(", ") ?? "",
      valorDesejado: f.valorDesejado,
      categoriasRecusadas: values.multis.categoriasRecusadas ?? [],
      intencaoReal: f.intencaoReal,
      aceitaContato: f.aceitaContato === "Sim",
    };

    const res = await fetch("/api/pontos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error ?? "Erro ao cadastrar");
    }
    const data = await res.json();
    localStorage.removeItem("mm_ponto_draft");
    router.push(`/obrigado?tipo=ponto&cidade=${encodeURIComponent(data.cidade)}`);
  };

  return <Wizard steps={steps} storageKey="mm_ponto_draft" submitLabel="Concluir cadastro" onSubmit={onSubmit} />;
}