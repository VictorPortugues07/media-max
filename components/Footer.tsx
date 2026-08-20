import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200/80 bg-white pt-14 pb-8 sm:pt-16 sm:pb-10">
      {/* Container Principal */}
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-3">
            <Link href="/" className="inline-block transition-opacity hover:opacity-80">
              <Logo className="h-6 sm:h-7 w-auto" />
            </Link>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              A plataforma de mídia indoor inteligente que conecta marcas locais ao público certo no momento certo.
            </p>
          </div>

          <div className="flex flex-wrap gap-10 sm:gap-14 text-xs sm:text-sm">
            <div className="space-y-3">
              <p className="font-semibold text-slate-900 text-xs tracking-wider uppercase">Plataforma</p>
              <ul className="space-y-2 text-slate-600">
                <li>
                  <Link href="/sobre" className="transition-colors hover:text-slate-900">
                    Sobre o projeto
                  </Link>
                </li>
                <li>
                  <Link href="/cadastro/ponto" className="transition-colors hover:text-slate-900">
                    Tenho uma TV
                  </Link>
                </li>
                <li>
                  <Link href="/cadastro/anunciante" className="transition-colors hover:text-slate-900">
                    Quero anunciar
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="font-semibold text-slate-900 text-xs tracking-wider uppercase">Contato</p>
              <ul className="space-y-2 text-slate-600">
                <li>
                  <a
                    href="https://wa.me/554888796514"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 transition-colors hover:text-emerald-600 font-medium"
                  >
                    <span>(48) 8879-6514</span>
                  </a>
                </li>
                <li className="text-slate-400 text-xs">
                  Fase de validação • Sem custo
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Linha separadora e direitos */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Media Max. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Rede em expansão
          </p>
        </div>

        {/* Efeito sutil de marca d'água no fundo similar à referência do vídeo */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute -bottom-10 left-1/2 -translate-x-1/2 text-center text-[10vw] font-black text-slate-900/[0.02] tracking-tighter uppercase whitespace-nowrap"
        >
          MEDIA MAX
        </div>
      </div>
    </footer>
  );
}