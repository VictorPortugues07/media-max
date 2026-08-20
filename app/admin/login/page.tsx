import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Login Administrativo — Media Max",
  description: "Acesso restrito à gestão da rede Media Max.",
};

export default async function AdminLoginPage() {
  if (await getSession()) redirect("/admin");

  return (
    <main className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl shadow-slate-900/5">
          {/* Luz de fundo decorativa */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-8 flex flex-col items-center text-center">
              <Link href="/" className="transition-opacity hover:opacity-85 mb-4">
                <Logo className="h-8 w-auto" />
              </Link>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/70 px-3 py-1 text-[11px] font-semibold text-blue-700 mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                Painel Administrativo
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
                Acesse sua conta
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                Digite suas credenciais para visualizar métricas e cadastros.
              </p>
            </div>

            <AdminLoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}