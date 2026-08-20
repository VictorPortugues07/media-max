import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

const pontoSchema = z.object({
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
  descricao: z.string().min(5),
  possuiTv: z.boolean(),
  quantidadeTvs: z.number().int().positive().optional().nullable(),
  localInstalacao: z.string().optional().or(z.literal("")),
  fluxoDiarioEstimado: z.string().min(1),
  tempoPermanencia: z.string().min(1),
  faixaEtariaPublico: z.array(z.string()).min(1),
  generoPublico: z.string().min(1),
  horariosPico: z.string().optional().or(z.literal("")),
  valorDesejado: z.string().min(1),
  categoriasRecusadas: z.array(z.string()),
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

  const parsed = pontoSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Dados inválidos", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  try {
    const ponto = await prisma.pontoMidia.create({
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
        descricao: data.descricao,
        possuiTv: data.possuiTv,
        quantidadeTvs: data.quantidadeTvs ?? null,
        localInstalacao: data.localInstalacao || null,
        fluxoDiarioEstimado: data.fluxoDiarioEstimado,
        tempoPermanencia: data.tempoPermanencia,
        faixaEtariaPublico: data.faixaEtariaPublico,
        generoPublico: data.generoPublico,
        horariosPico: data.horariosPico || null,
        valorDesejado: data.valorDesejado,
        categoriasRecusadas: data.categoriasRecusadas,
        intencaoReal: data.intencaoReal,
        aceitaContato: data.aceitaContato,
      },
    });
    return Response.json({ ok: true, cidade: ponto.cidade }, { status: 201 });
  } catch (err) {
    console.error("Erro ao cadastrar ponto:", err);
    return Response.json({ error: "Erro ao salvar o cadastro" }, { status: 500 });
  }
}