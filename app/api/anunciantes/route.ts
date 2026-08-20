import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const anuncianteSchema = z.object({
  nomeEmpresa: z.string().min(2),
  responsavel: z.string().min(2),
  whatsapp: z.string().min(10),
  instagramSite: z.string().optional().or(z.literal("")),
  cep: z.string().min(8),
  rua: z.string().min(2),
  numero: z.string().min(1),
  complemento: z.string().optional().or(z.literal("")),
  bairro: z.string().min(2),
  cidade: z.string().min(2),
  uf: z.string().length(2),
  categoria: z.string().min(2),
  oQueAnunciar: z.string().min(1),
  descricaoAnuncio: z.string().min(5),
  preferenciaLocalizacao: z.string().min(1),
  distanciaMaxima: z.string().optional().or(z.literal("")),
  bairrosEspecificos: z.string().optional().or(z.literal("")),
  categoriasEspecificas: z.array(z.string()),
  faixaEtariaAlvo: z.array(z.string()).min(1),
  generoAlvo: z.string().min(1),
  valorInvestimento: z.string().min(1),
  jaInvestePublicidade: z.boolean(),
  ondeInveste: z.array(z.string()),
  intencaoReal: z.string().min(1),
  aceitaContato: z.boolean(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const parsed = anuncianteSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Dados inválidos", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  try {
    const anunciante = await prisma.anunciante.create({
      data: {
        nomeEmpresa: data.nomeEmpresa,
        responsavel: data.responsavel,
        whatsapp: data.whatsapp,
        instagramSite: data.instagramSite || null,
        cep: data.cep,
        rua: data.rua,
        numero: data.numero,
        complemento: data.complemento || null,
        bairro: data.bairro,
        cidade: data.cidade,
        uf: data.uf,
        categoria: data.categoria,
        oQueAnunciar: data.oQueAnunciar,
        descricaoAnuncio: data.descricaoAnuncio,
        preferenciaLocalizacao: data.preferenciaLocalizacao,
        distanciaMaxima: data.distanciaMaxima || null,
        bairrosEspecificos: data.bairrosEspecificos || null,
        categoriasEspecificas: data.categoriasEspecificas,
        faixaEtariaAlvo: data.faixaEtariaAlvo,
        generoAlvo: data.generoAlvo,
        valorInvestimento: data.valorInvestimento,
        jaInvestePublicidade: data.jaInvestePublicidade,
        ondeInveste: data.ondeInveste,
        intencaoReal: data.intencaoReal,
        aceitaContato: data.aceitaContato,
      },
    });
    return Response.json({ ok: true, cidade: anunciante.cidade }, { status: 201 });
  } catch (err) {
    console.error("Erro ao cadastrar anunciante:", err);
    return Response.json({ error: "Erro ao salvar o cadastro" }, { status: 500 });
  }
}