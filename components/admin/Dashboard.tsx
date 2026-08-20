"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PontoMidiaModel } from "@/app/generated/prisma/models/PontoMidia";
import type { AnuncianteModel } from "@/app/generated/prisma/models/Anunciante";

interface DashboardProps {
  pontos: PontoMidiaModel[];
  anunciantes: AnuncianteModel[];
  counts: {
    totalPontos: number;
    totalAnunciantes: number;
    intencaoSimPontos: number;
    intencaoSimAnunciantes: number;
  };
}

type Tab = "pontos" | "anunciantes";

function fmtDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function cleanPhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export function Dashboard({ pontos, anunciantes, counts }: DashboardProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pontos");
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [cidade, setCidade] = useState("");
  const [intencao, setIntencao] = useState("");
  const [contato, setContato] = useState("");
  const [valor, setValor] = useState("");

  // Estado para visualização detalhada em Modal
  const [selectedPonto, setSelectedPonto] = useState<PontoMidiaModel | null>(null);
  const [selectedAnunciante, setSelectedAnunciante] = useState<AnuncianteModel | null>(null);

  // Estado para exclusão
  const [deleteTarget, setDeleteTarget] = useState<{ type: Tab; id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Totais computados dinâmicos
  const totalTvsCalculadas = useMemo(() => {
    return pontos.reduce((acc, p) => acc + (p.possuiTv ? (p.quantidadeTvs || 1) : 0), 0);
  }, [pontos]);

  const taxaContatoPontos = useMemo(() => {
    if (pontos.length === 0) return 0;
    const sim = pontos.filter((p) => p.aceitaContato).length;
    return Math.round((sim / pontos.length) * 100);
  }, [pontos]);

  const taxaContatoAnunciantes = useMemo(() => {
    if (anunciantes.length === 0) return 0;
    const sim = anunciantes.filter((a) => a.aceitaContato).length;
    return Math.round((sim / anunciantes.length) * 100);
  }, [anunciantes]);

  const cidades = useMemo(() => {
    const set = new Set<string>();
    pontos.forEach((p) => { if (p.cidade) set.add(p.cidade); });
    anunciantes.forEach((a) => { if (a.cidade) set.add(a.cidade); });
    return [...set].sort();
  }, [pontos, anunciantes]);

  const categorias = useMemo(() => {
    const set = new Set<string>();
    pontos.forEach((p) => { if (p.categoria) set.add(p.categoria); });
    anunciantes.forEach((a) => { if (a.categoria) set.add(a.categoria); });
    return [...set].sort();
  }, [pontos, anunciantes]);

  const filteredPontos = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pontos.filter((p) => {
      if (q) {
        const haystack = `${p.nomeEmpresa} ${p.responsavel} ${p.whatsapp} ${p.bairro} ${p.cidade} ${p.categoria}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (categoria && p.categoria !== categoria) return false;
      if (cidade && p.cidade !== cidade) return false;
      if (intencao && p.intencaoReal !== intencao) return false;
      if (contato === "sim" && !p.aceitaContato) return false;
      if (contato === "nao" && p.aceitaContato) return false;
      if (valor && p.valorDesejado !== valor) return false;
      return true;
    });
  }, [pontos, search, categoria, cidade, intencao, contato, valor]);

  const filteredAnunciantes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return anunciantes.filter((a) => {
      if (q) {
        const haystack = `${a.nomeEmpresa} ${a.responsavel} ${a.whatsapp} ${a.bairro} ${a.cidade} ${a.categoria} ${a.oQueAnunciar}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (categoria && a.categoria !== categoria) return false;
      if (cidade && a.cidade !== cidade) return false;
      if (intencao && a.intencaoReal !== intencao) return false;
      if (contato === "sim" && !a.aceitaContato) return false;
      if (contato === "nao" && a.aceitaContato) return false;
      if (valor && a.valorInvestimento !== valor) return false;
      return true;
    });
  }, [anunciantes, search, categoria, cidade, intencao, contato, valor]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch("/api/admin/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: deleteTarget.type === "pontos" ? "ponto" : "anunciante",
          id: deleteTarget.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Erro ao deletar registro");
      }

      setDeleteTarget(null);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Não foi possível excluir";
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const exportCsv = () => {
    const rows = tab === "pontos" ? filteredPontos : filteredAnunciantes;
    if (rows.length === 0) return;
    const keys =
      tab === "pontos"
        ? Object.keys(pontos[0] ?? {}).filter((k) => k !== "id")
        : Object.keys(anunciantes[0] ?? {}).filter((k) => k !== "id");
    const escape = (v: unknown) => {
      const s = Array.isArray(v) ? v.join("; ") : String(v ?? "");
      return `"${s.replace(/"/g, '""')}"`;
    };
    const header = keys.join(";");
    const body = rows
      .map((r) => keys.map((k) => escape((r as Record<string, unknown>)[k])).join(";"))
      .join("\n");
    const blob = new Blob([`\uFEFF${header}\n${body}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `media-max-${tab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const clearFilters = () => {
    setSearch("");
    setCategoria("");
    setCidade("");
    setIntencao("");
    setContato("");
    setValor("");
  };

  const hasActiveFilters = Boolean(search || categoria || cidade || intencao || contato || valor);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5 sm:pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Painel de Controle
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-slate-900 font-heading">
            Visão Geral da Rede
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
            Acompanhe a adesão em tempo real de estabelecimentos e anunciantes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="flex-1 sm:flex-initial justify-center flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
          >
            <svg className="h-4 w-4 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={logout}
            className="flex-1 sm:flex-initial justify-center flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 px-3.5 py-2 text-xs font-semibold text-red-600 shadow-sm transition-all hover:bg-red-100"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Dinâmicos */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pontos de Mídia
            </span>
            <span className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
              {counts.totalPontos}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500">locais</span>
          </div>
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-2 text-[10px] sm:text-[11px] text-slate-500 gap-0.5">
            <span>Interesse: <strong className="text-blue-600">{counts.intencaoSimPontos}</strong></span>
            <span>TVs: <strong className="text-slate-800">{totalTvsCalculadas}</strong></span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
              Anunciantes
            </span>
            <span className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </span>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-heading">
              {counts.totalAnunciantes}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500">marcas</span>
          </div>
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-2 text-[10px] sm:text-[11px] text-slate-500 gap-0.5">
            <span>Interesse: <strong className="text-indigo-600">{counts.intencaoSimAnunciantes}</strong></span>
            <span>Cidades: <strong className="text-slate-800">{cidades.length}</strong></span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
              Qualificação
            </span>
            <span className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 font-heading">
              {counts.totalPontos + counts.totalAnunciantes > 0
                ? Math.round(((counts.intencaoSimPontos + counts.intencaoSimAnunciantes) / (counts.totalPontos + counts.totalAnunciantes)) * 100)
                : 0}%
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500">alta intenção</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] sm:text-[11px] text-slate-500">
            <span>{counts.intencaoSimPontos + counts.intencaoSimAnunciantes} leads quentes</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
              Autorizou Contato
            </span>
            <span className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </span>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-3xl font-bold tracking-tight text-teal-600 font-heading">
              {taxaContatoPontos}% / {taxaContatoAnunciantes}%
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] sm:text-[11px] text-slate-500">
            <span>Pontos / Anunciantes</span>
          </div>
        </div>
      </div>

      {/* Main Content Box */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 overflow-hidden">
        {/* Tabs de Seleção */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 p-4 sm:px-6">
          <div className="inline-flex w-full sm:w-auto rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setTab("pontos")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs font-semibold transition-all ${
                tab === "pontos"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Pontos de Mídia</span>
              <span className={`rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] ${tab === "pontos" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"}`}>
                {filteredPontos.length}
              </span>
            </button>
            <button
              onClick={() => setTab("anunciantes")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs font-semibold transition-all ${
                tab === "anunciantes"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <span>Anunciantes</span>
              <span className={`rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] ${tab === "anunciantes" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"}`}>
                {filteredAnunciantes.length}
              </span>
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center sm:justify-start gap-1"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Limpar filtros</span>
            </button>
          )}
        </div>

        {/* Filtros em Grid Responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 p-3.5 sm:p-4 border-b border-slate-100 bg-slate-50/40">
          <div className="sm:col-span-2 relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por empresa, whats, bairro…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 pl-9 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <svg className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Categoria: todas</option>
            {categorias.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Cidade: todas</option>
            {cidades.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={intencao}
            onChange={(e) => setIntencao(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Intenção: todas</option>
            <option value="Sim, tenho interesse real">Sim, interesse real</option>
            <option value="Talvez, quero entender melhor">Talvez</option>
            <option value="Não, só por curiosidade">Não</option>
          </select>

          <select
            value={contato}
            onChange={(e) => setContato(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Contato: todos</option>
            <option value="sim">Autorizou contato</option>
            <option value="nao">Não autorizou</option>
          </select>
        </div>

        {/* 1. VISUALIZAÇÃO MOBILE (Cards compactos e legíveis para telas < 640px) */}
        <div className="block sm:hidden divide-y divide-slate-100">
          {tab === "pontos" ? (
            filteredPontos.length > 0 ? (
              filteredPontos.map((p) => {
                const rawPhone = cleanPhone(p.whatsapp);
                const isSim = p.intencaoReal === "Sim, tenho interesse real";
                const isTalvez = p.intencaoReal === "Talvez, quero entender melhor";

                return (
                  <div key={p.id} className="p-4 space-y-3 hover:bg-blue-50/20 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                          {p.categoria}
                        </span>
                        <h3 className="font-semibold text-slate-900 text-sm">{p.nomeEmpresa}</h3>
                        <p className="text-xs text-slate-500">{p.bairro} — {p.cidade}/{p.uf}</p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${
                          isSim
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : isTalvez
                              ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span className={`h-1 w-1 rounded-full ${isSim ? "bg-emerald-500" : isTalvez ? "bg-amber-500" : "bg-slate-400"}`} />
                        {isSim ? "Sim" : isTalvez ? "Talvez" : "Não"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] rounded-xl bg-slate-50 p-2.5">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Responsável</span>
                        <span className="font-medium text-slate-800">{p.responsavel}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">TVs / Fluxo</span>
                        <span className="font-medium text-slate-800">
                          {p.possuiTv ? `${p.quantidadeTvs || 1} TV(s)` : "Sem TV"} • {p.fluxoDiarioEstimado}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <a
                        href={`https://wa.me/55${rawPhone}?text=Ol%C3%A1%20${encodeURIComponent(p.responsavel)}%2C%20tudo%20bem%3F%20Falamos%20da%20Media%20Max.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-100 transition-colors"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                        </svg>
                        <span>WhatsApp</span>
                      </a>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedPonto(p)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          Detalhes
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: "pontos", id: p.id, name: p.nomeEmpresa })}
                          className="rounded-lg border border-red-200 bg-red-50/60 p-1.5 text-red-600 hover:bg-red-100 transition-colors"
                          title="Excluir cadastro"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Nenhum ponto de mídia encontrado.
              </div>
            )
          ) : filteredAnunciantes.length > 0 ? (
            filteredAnunciantes.map((a) => {
              const rawPhone = cleanPhone(a.whatsapp);
              const isSim = a.intencaoReal === "Sim, tenho interesse real";
              const isTalvez = a.intencaoReal === "Talvez, quero entender melhor";

              return (
                <div key={a.id} className="p-4 space-y-3 hover:bg-blue-50/20 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
                        {a.categoria}
                      </span>
                      <h3 className="font-semibold text-slate-900 text-sm">{a.nomeEmpresa}</h3>
                      <p className="text-xs text-slate-500">{a.bairro} — {a.cidade}/{a.uf}</p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${
                        isSim
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          : isTalvez
                            ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <span className={`h-1 w-1 rounded-full ${isSim ? "bg-emerald-500" : isTalvez ? "bg-amber-500" : "bg-slate-400"}`} />
                      {isSim ? "Sim" : isTalvez ? "Talvez" : "Não"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] rounded-xl bg-slate-50 p-2.5">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Responsável</span>
                      <span className="font-medium text-slate-800">{a.responsavel}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Investimento</span>
                      <span className="font-medium text-slate-800">{a.valorInvestimento}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <a
                      href={`https://wa.me/55${rawPhone}?text=Ol%C3%A1%20${encodeURIComponent(a.responsavel)}%2C%20tudo%20bem%3F%20Falamos%20da%20Media%20Max.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-100 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                      </svg>
                      <span>WhatsApp</span>
                    </a>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedAnunciante(a)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        Detalhes
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: "anunciantes", id: a.id, name: a.nomeEmpresa })}
                        className="rounded-lg border border-red-200 bg-red-50/60 p-1.5 text-red-600 hover:bg-red-100 transition-colors"
                        title="Excluir cadastro"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              Nenhum anunciante encontrado.
            </div>
          )}
        </div>

        {/* 2. VISUALIZAÇÃO DESKTOP / TABLET (Tabela com scroll horizontal preservado) */}
        <div className="hidden sm:block overflow-x-auto">
          {tab === "pontos" ? (
            <table className="w-full min-w-[920px] text-left text-xs">
              <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Empresa & Local</th>
                  <th className="px-4 py-3">Contato Direto</th>
                  <th className="px-4 py-3">TVs & Fluxo</th>
                  <th className="px-4 py-3">Público / Tempo</th>
                  <th className="px-4 py-3">Valor Desejado</th>
                  <th className="px-4 py-3">Intenção</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPontos.map((p) => {
                  const rawPhone = cleanPhone(p.whatsapp);
                  const isSim = p.intencaoReal === "Sim, tenho interesse real";
                  const isTalvez = p.intencaoReal === "Talvez, quero entender melhor";

                  return (
                    <tr key={p.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{p.nomeEmpresa}</div>
                        <div className="text-[11px] text-slate-500">
                          {p.categoria} • {p.bairro}, {p.cidade}/{p.uf}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">{p.responsavel}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <a
                            href={`https://wa.me/55${rawPhone}?text=Ol%C3%A1%20${encodeURIComponent(p.responsavel)}%2C%20tudo%20bem%3F%20Falamos%20da%20Media%20Max.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]"
                            title="Abrir WhatsApp"
                          >
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                            </svg>
                            <span>{p.whatsapp}</span>
                          </a>
                          {p.aceitaContato ? (
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-medium">Aceita falar</span>
                          ) : (
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded">Não</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">
                          {p.possuiTv ? `${p.quantidadeTvs || 1} TV(s) instalada(s)` : "Sem TV (Quer instalar)"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Fluxo: {p.fluxoDiarioEstimado}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-slate-800">{p.tempoPermanencia}</div>
                        <div className="text-[11px] text-slate-500">
                          {p.generoPublico} • {p.faixaEtariaPublico.slice(0, 2).join(", ")}
                          {p.faixaEtariaPublico.length > 2 ? "…" : ""}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-800">{p.valorDesejado}</span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            isSim
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : isTalvez
                                ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isSim ? "bg-emerald-500" : isTalvez ? "bg-amber-500" : "bg-slate-400"}`} />
                          {p.intencaoReal}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPonto(p)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            Ver detalhes
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ type: "pontos", id: p.id, name: p.nomeEmpresa })}
                            className="rounded-lg border border-red-200 bg-red-50/60 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100 transition-colors"
                            title="Excluir cadastro"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredPontos.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                      Nenhum ponto de mídia encontrado com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[920px] text-left text-xs">
              <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Empresa & Segmento</th>
                  <th className="px-4 py-3">Contato</th>
                  <th className="px-4 py-3">Objetivo do Anúncio</th>
                  <th className="px-4 py-3">Alcance / Região</th>
                  <th className="px-4 py-3">Investimento</th>
                  <th className="px-4 py-3">Intenção</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAnunciantes.map((a) => {
                  const rawPhone = cleanPhone(a.whatsapp);
                  const isSim = a.intencaoReal === "Sim, tenho interesse real";
                  const isTalvez = a.intencaoReal === "Talvez, quero entender melhor";

                  return (
                    <tr key={a.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{a.nomeEmpresa}</div>
                        <div className="text-[11px] text-slate-500">
                          {a.categoria} • {a.bairro}, {a.cidade}/{a.uf}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">{a.responsavel}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <a
                            href={`https://wa.me/55${rawPhone}?text=Ol%C3%A1%20${encodeURIComponent(a.responsavel)}%2C%20tudo%20bem%3F%20Falamos%20da%20Media%20Max.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]"
                            title="Abrir WhatsApp"
                          >
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                            </svg>
                            <span>{a.whatsapp}</span>
                          </a>
                          {a.aceitaContato ? (
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-medium">Aceita falar</span>
                          ) : (
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded">Não</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">{a.oQueAnunciar}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">
                          {a.descricaoAnuncio}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="text-slate-800">{a.preferenciaLocalizacao}</div>
                        <div className="text-[11px] text-slate-500">
                          {a.distanciaMaxima ? `Até ${a.distanciaMaxima}` : "Sem restrição"}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-800">{a.valorInvestimento}</span>
                        <div className="text-[10px] text-slate-500">
                          {a.jaInvestePublicidade ? "Já investe em mídia" : "Novo anunciante"}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            isSim
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : isTalvez
                                ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isSim ? "bg-emerald-500" : isTalvez ? "bg-amber-500" : "bg-slate-400"}`} />
                          {a.intencaoReal}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedAnunciante(a)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            Ver detalhes
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ type: "anunciantes", id: a.id, name: a.nomeEmpresa })}
                            className="rounded-lg border border-red-200 bg-red-50/60 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100 transition-colors"
                            title="Excluir cadastro"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredAnunciantes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                      Nenhum anunciante encontrado com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de Detalhes Ponto */}
      {selectedPonto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-2xl space-y-5 sm:space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
              <div>
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                  Ponto de Mídia #{selectedPonto.id}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
                  {selectedPonto.nomeEmpresa}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Cadastrado em {fmtDate(selectedPonto.criadoEm)}
                </p>
              </div>
              <button
                onClick={() => setSelectedPonto(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-2">
                <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Contato & Local</h4>
                <p><strong className="text-slate-700">Responsável:</strong> {selectedPonto.responsavel}</p>
                <p>
                  <strong className="text-slate-700">WhatsApp:</strong>{" "}
                  <a
                    href={`https://wa.me/55${cleanPhone(selectedPonto.whatsapp)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 font-semibold underline"
                  >
                    {selectedPonto.whatsapp}
                  </a>
                </p>
                <p><strong className="text-slate-700">Instagram/Site:</strong> {selectedPonto.instagramSite || "—"}</p>
                <p><strong className="text-slate-700">Endereço:</strong> {selectedPonto.rua}, {selectedPonto.numero} {selectedPonto.complemento ? `(${selectedPonto.complemento})` : ""}</p>
                <p><strong className="text-slate-700">Bairro/Cidade:</strong> {selectedPonto.bairro} — {selectedPonto.cidade}/{selectedPonto.uf}</p>
                <p><strong className="text-slate-700">CEP:</strong> {selectedPonto.cep}</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-2">
                <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Infraestrutura & Público</h4>
                <p><strong className="text-slate-700">Categoria:</strong> {selectedPonto.categoria}</p>
                <p><strong className="text-slate-700">Possui TV:</strong> {selectedPonto.possuiTv ? `Sim (${selectedPonto.quantidadeTvs} TV(s))` : "Não possui"}</p>
                <p><strong className="text-slate-700">Onde fica:</strong> {selectedPonto.localInstalacao || "—"}</p>
                <p><strong className="text-slate-700">Fluxo Diário:</strong> {selectedPonto.fluxoDiarioEstimado}</p>
                <p><strong className="text-slate-700">Tempo de Permanência:</strong> {selectedPonto.tempoPermanencia}</p>
                <p><strong className="text-slate-700">Público:</strong> {selectedPonto.generoPublico} ({selectedPonto.faixaEtariaPublico.join(", ")})</p>
                <p><strong className="text-slate-700">Horários de Pico:</strong> {selectedPonto.horariosPico || "—"}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-2 text-xs">
              <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Descrição do Espaço</h4>
              <p className="text-slate-700 leading-relaxed">{selectedPonto.descricao}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <span className="text-[10px] sm:text-[11px] text-slate-500 block">Valor Desejado</span>
                <strong className="text-slate-900 text-xs sm:text-sm">{selectedPonto.valorDesejado}</strong>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <span className="text-[10px] sm:text-[11px] text-slate-500 block">Intenção Real</span>
                <strong className="text-slate-900 text-xs sm:text-sm">{selectedPonto.intencaoReal}</strong>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <span className="text-[10px] sm:text-[11px] text-slate-500 block">Autoriza Contato</span>
                <strong className="text-slate-900 text-xs sm:text-sm">{selectedPonto.aceitaContato ? "Sim" : "Não"}</strong>
              </div>
            </div>

            {selectedPonto.categoriasRecusadas?.length > 0 && (
              <div className="text-xs text-slate-600">
                <strong>Categorias recusadas para anúncio:</strong> {selectedPonto.categoriasRecusadas.join(", ")}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPonto(null)}
                className="w-full sm:w-auto rounded-full bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes Anunciante */}
      {selectedAnunciante && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="w-full max-w-2xl rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-2xl space-y-5 sm:space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
              <div>
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                  Anunciante #{selectedAnunciante.id}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading">
                  {selectedAnunciante.nomeEmpresa}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  Cadastrado em {fmtDate(selectedAnunciante.criadoEm)}
                </p>
              </div>
              <button
                onClick={() => setSelectedAnunciante(null)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-2">
                <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Contato & Local</h4>
                <p><strong className="text-slate-700">Responsável:</strong> {selectedAnunciante.responsavel}</p>
                <p>
                  <strong className="text-slate-700">WhatsApp:</strong>{" "}
                  <a
                    href={`https://wa.me/55${cleanPhone(selectedAnunciante.whatsapp)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 font-semibold underline"
                  >
                    {selectedAnunciante.whatsapp}
                  </a>
                </p>
                <p><strong className="text-slate-700">Instagram/Site:</strong> {selectedAnunciante.instagramSite || "—"}</p>
                <p><strong className="text-slate-700">Endereço:</strong> {selectedAnunciante.rua}, {selectedAnunciante.numero} {selectedAnunciante.complemento ? `(${selectedAnunciante.complemento})` : ""}</p>
                <p><strong className="text-slate-700">Bairro/Cidade:</strong> {selectedAnunciante.bairro} — {selectedAnunciante.cidade}/{selectedAnunciante.uf}</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-2">
                <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Campanha & Segmentação</h4>
                <p><strong className="text-slate-700">Categoria:</strong> {selectedAnunciante.categoria}</p>
                <p><strong className="text-slate-700">O que quer divulgar:</strong> {selectedAnunciante.oQueAnunciar}</p>
                <p><strong className="text-slate-700">Preferência de Local:</strong> {selectedAnunciante.preferenciaLocalizacao}</p>
                <p><strong className="text-slate-700">Distância Máxima:</strong> {selectedAnunciante.distanciaMaxima || "—"}</p>
                <p><strong className="text-slate-700">Bairros:</strong> {selectedAnunciante.bairrosEspecificos || "—"}</p>
                <p><strong className="text-slate-700">Público Alvo:</strong> {selectedAnunciante.generoAlvo} ({selectedAnunciante.faixaEtariaAlvo.join(", ")})</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-2 text-xs">
              <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">Descrição do Anúncio</h4>
              <p className="text-slate-700 leading-relaxed">{selectedAnunciante.descricaoAnuncio}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <span className="text-[10px] sm:text-[11px] text-slate-500 block">Investimento Planejado</span>
                <strong className="text-slate-900 text-xs sm:text-sm">{selectedAnunciante.valorInvestimento}</strong>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <span className="text-[10px] sm:text-[11px] text-slate-500 block">Intenção Real</span>
                <strong className="text-slate-900 text-xs sm:text-sm">{selectedAnunciante.intencaoReal}</strong>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <span className="text-[10px] sm:text-[11px] text-slate-500 block">Já investe em mídia</span>
                <strong className="text-slate-900 text-xs sm:text-sm">{selectedAnunciante.jaInvestePublicidade ? "Sim" : "Não"}</strong>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAnunciante(null)}
                className="w-full sm:w-auto rounded-full bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              Confirmar exclusão
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Tem certeza que deseja excluir o cadastro de <strong className="text-slate-900">{deleteTarget.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            {deleteError && (
              <p className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-600">
                {deleteError}
              </p>
            )}
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteError(null);
                }}
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? "Excluindo..." : "Sim, excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
