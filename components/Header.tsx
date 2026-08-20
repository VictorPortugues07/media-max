"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";

const links = [
  { href: "/", label: "Início" },
  { href: "/sobre", label: "Sobre" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 pt-3 pb-2 sm:pt-4 sm:pb-3 px-4 pointer-events-none">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between rounded-full border border-slate-200/80 bg-white/85 px-4 sm:px-6 shadow-sm shadow-slate-900/5 backdrop-blur-md pointer-events-auto transition-all">
        {/* Logo */}
        <Link
          href="/"
          aria-label="Media Max — página inicial"
          className="flex items-center shrink-0 transition-opacity hover:opacity-80"
        >
          <Logo className="h-6 sm:h-7 w-auto" />
        </Link>

        {/* Navegação única com indicação visual da aba ativa com cor da marca */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs font-medium">
          {links.map((l) => {
            const isActive =
              l.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(l.href);

            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-4 py-1.5 transition-all duration-200 ${
                  isActive
                    ? "bg-brand-gradient text-white font-semibold shadow-sm shadow-blue-500/25"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/70"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}