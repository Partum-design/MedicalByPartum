"use client";

import Link from "next/link";
import { useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Banknote, CreditCard, Plus, ShieldCheck } from "lucide-react";
import { PanelShell } from "@/components/shell/PanelShell";
import { SavedCard } from "@/components/marketing/SavedCard";
import { useDemoStore } from "@/lib/demo-store";

const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

// Nodo Paciente: método de pago guardado + historial de cobros de sus citas.
export default function PagosPage() {
  const store = useDemoStore();
  const { listo, citas, sesion } = store;

  const mias = useMemo(
    () =>
      citas
        .filter((c) => c.paciente_id === "pac-1" && c.estado !== "cancelada")
        .sort((a, b) => b.inicio.localeCompare(a.inicio)),
    [citas]
  );

  if (!listo) return null;

  if (!sesion || sesion.rol !== "paciente") {
    return <SinSesion />;
  }

  return (
    <PanelShell sesion={sesion} activo="Pagos" onLogout={store.logout}>
      <header className="anim-in mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Pagos</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-muted)" }}>
          Tu método de pago guardado y el historial de cobros de tus citas.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tarjeta guardada */}
        <section className="anim-in anim-d1 lg:col-span-1">
          <div className="rounded-3xl bg-ink-950 p-8">
            <SavedCard nombre={sesion.nombre} toast={false} trust={false} />
          </div>
          <p className="mt-4 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center text-xs" style={{ color: "var(--ink-muted)" }}>
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-accent-500" />
            <span>Guardada de forma segura vía</span>
            <span className="font-semibold text-ink-900 dark:text-white">Stripe</span>
            <span aria-hidden>·</span>
            <span className="font-semibold text-ink-900 dark:text-white">Mercado Pago</span>
          </p>
          <button className="card-hover mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-dashed border-brand-500/40 px-5 py-2.5 text-sm font-medium text-brand-600">
            <Plus className="h-4 w-4" /> Agregar otro método
          </button>
        </section>

        {/* Historial de cobros */}
        <section className="anim-in anim-d2 space-y-3 lg:col-span-2">
          <h2 className="font-semibold">Historial de cobros</h2>
          {mias.length === 0 && (
            <div
              className="rounded-2xl border border-dashed border-brand-500/30 p-8 text-center text-sm"
              style={{ background: "var(--card)", color: "var(--ink-muted)" }}
            >
              Aún no tienes cobros registrados.
            </div>
          )}
          {mias.map((c) => (
            <article
              key={c.id}
              className="card-hover flex items-center gap-4 rounded-2xl p-4 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10"
              style={{ background: "var(--card)" }}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  c.metodo_pago === "tarjeta" ? "bg-brand-50 text-brand-600" : "bg-pastel-durazno text-orange-700"
                }`}
              >
                {c.metodo_pago === "tarjeta" ? <CreditCard className="h-4.5 w-4.5" /> : <Banknote className="h-4.5 w-4.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{c.medico_nombre}</p>
                <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
                  {format(new Date(c.inicio), "d 'de' MMMM, yyyy", { locale: es })} ·{" "}
                  {c.metodo_pago === "tarjeta" ? "Tarjeta ····5521" : "Efectivo en clínica"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-num font-semibold">{mxn.format(c.precio)}</p>
                <span
                  className={`text-[11px] font-medium ${
                    c.estado_pago === "pagado" ? "text-emerald-600" : "text-orange-600"
                  }`}
                >
                  {c.estado_pago === "pagado" ? "Pagado" : "Pendiente"}
                </span>
              </div>
            </article>
          ))}
        </section>
      </div>
    </PanelShell>
  );
}

function SinSesion() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="anim-in text-lg font-semibold">Inicia sesión para ver tus pagos</p>
      <Link
        href="/login"
        className="anim-in anim-d1 rounded-full bg-gradient-to-r from-brand-600 to-accent-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md"
      >
        Entrar a la demo
      </Link>
    </main>
  );
}
