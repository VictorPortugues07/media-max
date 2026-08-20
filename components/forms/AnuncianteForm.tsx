"use client";

import { Wizard, type FormValues, type Step } from "@/components/forms/Wizard";
import {
  CATEGORIAS,
  DISTANCIAS,
  FAIXAS_ETARIAS,
  GENEROS_ALVO,
  INTENCAO_OPCOES,
  ONDE_INVESTE,
  O_QUE_ANUNCIAR,
  PREFERENCIA_LOCALIZACAO,
  VALORES_ANUNCIANTE,
} from "@/lib/options";
import { useRouter } from "next/navigation";

const steps: Step[] = [
  {
    title: "Sobre a empresa",
    subtitle: "Dados de contato para a equipe Media Max falar com você.",
    fields: [
      { id: "nomeEmpresa", type: "text", label: "Nome da empresa", required: true, placeholder: "Ex.: Barbearia do Zé", autoComplete: "organization" },
      { id: "responsavel", type: "text", label: "Nome do responsável", required: true, placeholder: "Ex.: José Silva", autoComplete: "name" },
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
    title: "O que você quer anunciar",
    fields: [
      { id: "oQueAnunciar", type: "select", label: "O que deseja divulgar?", required: true, options: [...O_QUE_ANUNCIAR], other: true, otherPlaceholder: "O que seria?" },
      { id: "descricaoAnuncio", type: "textarea", label: "Descreva o que será anunciado", required: true, placeholder: "Ex.: Corte masculino com desconto de 20% para quem vier da academia…" },
    ],
  },
  {
    title: "Onde quer anunciar",
    subtitle: "Qual perfil de estabelecimento faz sentido para o seu anúncio?",
    fields: [
      { id: "preferenciaLocalizacao", type: "radio", label: "Preferência de localização", required: true, options: [...PREFERENCIA_LOCALIZACAO] },
      { id: "distanciaMaxima", type: "select", label: "Distância máxima do seu estabelecimento", required: true, options: [...DISTANCIAS], visibleIf: { field: "preferenciaLocalizacao", equals: "Próximo ao meu estabelecimento" } },
      { id: "bairrosEspecificos", type: "text", label: "Quais bairros?", required: true, placeholder: "Ex.: Centro, Vila Mariana", visibleIf: { field: "preferenciaLocalizacao", equals: "Bairros específicos" } },
      { id: "categoriasEspecificas", type: "multi", label: "Quais categorias de empresas?", required: true, options: [...CATEGORIAS], visibleIf: { field: "preferenciaLocalizacao", equals: "Categorias de empresas específicas" } },
    ],
  },
  {
    title: "Público-alvo",
    subtitle: "Quem você quer alcançar?",
    fields: [
      { id: "faixaEtariaAlvo", type: "multi", label: "Faixa etária desejada", required: true, options: [...FAIXAS_ETARIAS] },
      { id: "generoAlvo", type: "radio", label: "Gênero", required: true, options: [...GENEROS_ALVO] },
    ],
  },
  {
    title: "Investimento",
    subtitle: "Sem compromisso — só para entendermos seu momento.",
    fields: [
      { id: "valorInvestimento", type: "select", label: "Quanto estaria disposto a investir por mês?", required: true, options: [...VALORES_ANUNCIANTE] },
      { id: "jaInvestePublicidade", type: "radio", label: "Você já investe em publicidade hoje?", required: true, options: ["Sim", "Não"] },
      { id: "ondeInveste", type: "multi", label: "Onde investe hoje?", required: true, options: [...ONDE_INVESTE], visibleIf: { field: "jaInvestePublicidade", equals: "Sim" } },
    ],
  },
  {
    title: "Confirmação de interesse",
    subtitle: "Suas respostas ajudam a validar a rede na sua região.",
    fields: [
      {
        id: "intencaoReal",
        type: "radio",
        label: "Se encontrarmos hoje um estabelecimento adequado ao seu público, você estaria disposto a contratar uma campanha?",
        required: true,
        options: [...INTENCAO_OPCOES],
        highlight: true,
      },
      { id: "aceitaContato", type: "radio", label: "Posso entrar em contato com você quando a Media Max estiver disponível?", required: true, options: ["Sim", "Não"] },
    ],
  },
];

export function AnuncianteForm() {
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
      oQueAnunciar: f.oQueAnunciar === "Outro" ? f.oQueAnunciarOutro : f.oQueAnunciar,
      descricaoAnuncio: f.descricaoAnuncio,
      preferenciaLocalizacao: f.preferenciaLocalizacao,
      distanciaMaxima: f.preferenciaLocalizacao === "Próximo ao meu estabelecimento" ? f.distanciaMaxima ?? "" : "",
      bairrosEspecificos: f.preferenciaLocalizacao === "Bairros específicos" ? f.bairrosEspecificos ?? "" : "",
      categoriasEspecificas: f.preferenciaLocalizacao === "Categorias de empresas específicas" ? values.multis.categoriasEspecificas ?? [] : [],
      faixaEtariaAlvo: values.multis.faixaEtariaAlvo ?? [],
      generoAlvo: f.generoAlvo,
      valorInvestimento: f.valorInvestimento,
      jaInvestePublicidade: f.jaInvestePublicidade === "Sim",
      ondeInveste: f.jaInvestePublicidade === "Sim" ? values.multis.ondeInveste ?? [] : [],
      intencaoReal: f.intencaoReal,
      aceitaContato: f.aceitaContato === "Sim",
    };

    const res = await fetch("/api/anunciantes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.error ?? "Erro ao cadastrar");
    }
    const data = await res.json();
    localStorage.removeItem("mm_anunciante_draft");
    router.push(`/obrigado?tipo=anunciante&cidade=${encodeURIComponent(data.cidade)}`);
  };

  return <Wizard steps={steps} storageKey="mm_anunciante_draft" submitLabel="Concluir cadastro" onSubmit={onSubmit} />;
}