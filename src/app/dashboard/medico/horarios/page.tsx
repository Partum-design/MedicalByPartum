"use client";

import Link from "next/link";
import { CalendarClock, Stethoscope } from "lucide-react";
import { PanelShell } from "@/components/shell/PanelShell";
import { DIAS_SEMANA, useDemoStore } from "@/lib/demo-store";

// Nodo Médico: disponibilidad semanal. Los bloques activos son los que
// alimentan los horarios que ve el paciente al agendar (en la demo, la
// franja 9–13h de FlujoReserva; en producción, esta tabla sería la fuente).
export default function HorariosPage() {
  const store = useDemoStore();
  const { listo, sesion } = store;

  if (!listo) return null;

  if (!sesion || sesion.rol !== "medico") {
    return <SinSesion />;
  }

  const horario = store.horarioDeMedico(sesion.id);

  return (
    <PanelShell sesion={sesion} activo="Horarios" onLogout={store.logout}>
      <header className="anim-in mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Horarios</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-muted)" }}>
          Define tu disponibilidad semanal. Los pacientes solo verán horarios dentro de estos
          bloques.
        </p>
      </header>

      <section className="anim-in anim-d1 overflow-hidden rounded-3xl shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10" style={{ background: "var(--card)" }}>
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {DIAS_SEMANA.map((dia, i) => {
            const bloque = horario[dia.id];
            return (
              <div
                key={dia.id}
                className={`anim-in anim-d${Math.min(i + 1, 6)} flex flex-wrap items-center gap-4 p-4 transition-opacity ${
                  bloque.activo ? "" : "opacity-50"
                }`}
              >
                <label className="flex w-36 shrink-0 items-center gap-4">
                  <button
                    role="switch"
                    aria-checked={bloque.activo}
                    onClick={() => store.guardarHorarioDia(sesion.id, dia.id, { activo: !bloque.activo })}
                    className={`relative h-6 w-11 shrink-0 rounded-full ring-1 ring-inset transition-colors ${
                      bloque.activo
                        ? "bg-gradient-to-r from-brand-600 to-accent-500 ring-transparent"
                        : "bg-slate-300 ring-slate-300 dark:bg-white/15 dark:ring-white/15"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ring-1 ring-black/5 transition-transform ${
                        bloque.activo ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                  <span className="font-medium">{dia.label}</span>
                </label>

                {bloque.activo ? (
                  <div className="flex items-center gap-2 text-sm">
                    <input
                      type="time"
                      value={bloque.inicio}
                      onChange={(e) => store.guardarHorarioDia(sesion.id, dia.id, { inicio: e.target.value })}
                      className="rounded-lg border border-slate-300/70 bg-transparent px-3 py-1.5 outline-none focus:border-accent-500 dark:border-white/15"
                    />
                    <span style={{ color: "var(--ink-muted)" }}>a</span>
                    <input
                      type="time"
                      value={bloque.fin}
                      onChange={(e) => store.guardarHorarioDia(sesion.id, dia.id, { fin: e.target.value })}
                      className="rounded-lg border border-slate-300/70 bg-transparent px-3 py-1.5 outline-none focus:border-accent-500 dark:border-white/15"
                    />
                  </div>
                ) : (
                  <span className="text-sm" style={{ color: "var(--ink-muted)" }}>
                    No disponible
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <p className="anim-in anim-d2 mx-auto mt-6 flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10" style={{ background: "var(--card)", color: "var(--ink-muted)" }}>
        <CalendarClock className="h-4 w-4 text-accent-500" />
        Los cambios se guardan al instante y persisten en este navegador.
      </p>
    </PanelShell>
  );
}

function SinSesion() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <Stethoscope className="h-8 w-8 text-accent-500" />
      <p className="anim-in text-lg font-semibold">Inicia sesión como médico para ver este panel</p>
      <Link
        href="/login"
        className="anim-in anim-d1 rounded-full bg-gradient-to-r from-brand-600 to-accent-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md"
      >
        Entrar a la demo
      </Link>
    </main>
  );
}
