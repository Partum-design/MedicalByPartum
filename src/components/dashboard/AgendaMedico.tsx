"use client";

import { useMemo, useState } from "react";
import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, Video, MapPin, Banknote, Users } from "lucide-react";

export type CitaAgenda = {
  id: string;
  inicio: string;
  fin: string;
  modalidad: "presencial" | "telemedicina";
  estado: "confirmada" | "asistida";
  precio: number;
  enlace_videollamada: string | null;
  paciente: { nombre: string; apellidos: string | null; avatar_url: string | null } | null;
};

const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

export function AgendaMedico({ citas }: { citas: CitaAgenda[] }) {
  const [vista, setVista] = useState<"hoy" | "semana">("hoy");

  const visibles = useMemo(
    () => (vista === "hoy" ? citas.filter((c) => isToday(new Date(c.inicio))) : citas),
    [citas, vista]
  );

  const stats = useMemo(() => {
    const deHoy = citas.filter((c) => isToday(new Date(c.inicio)));
    return {
      hoy: deHoy.length,
      tele: deHoy.filter((c) => c.modalidad === "telemedicina").length,
      ingresos: deHoy.reduce((sum, c) => sum + Number(c.precio), 0),
    };
  }, [citas]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      {/* Encabezado */}
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mi agenda</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-muted)" }}>
            {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex rounded-full bg-brand-100 p-1 dark:bg-brand-900/40">
          {(["hoy", "semana"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVista(v)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-all ${
                vista === v
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-brand-700 hover:text-brand-900 dark:text-brand-100"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </header>

      {/* Tarjetas de resumen */}
      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Citas de hoy"
          value={String(stats.hoy)}
          tone="brand"
        />
        <StatCard
          icon={<Video className="h-5 w-5" />}
          label="Telemedicina"
          value={String(stats.tele)}
          tone="accent"
        />
        <StatCard
          icon={<Banknote className="h-5 w-5" />}
          label="Ingresos del día"
          value={mxn.format(stats.ingresos)}
          tone="brand"
        />
      </section>

      {/* Lista de citas */}
      <section className="space-y-3">
        {visibles.length === 0 && (
          <div
            className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-brand-500/30 py-14 text-center"
            style={{ background: "var(--card)" }}
          >
            <CalendarDays className="h-8 w-8 text-accent-500" />
            <p className="font-medium">Sin citas {vista === "hoy" ? "para hoy" : "esta semana"}</p>
            <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
              Los nuevos pacientes aparecerán aquí en tiempo real.
            </p>
          </div>
        )}

        {visibles.map((cita) => {
          const nombre = cita.paciente
            ? `${cita.paciente.nombre} ${cita.paciente.apellidos ?? ""}`.trim()
            : "Paciente";
          return (
            <article
              key={cita.id}
              className="group flex items-center gap-4 rounded-2xl p-4 shadow-sm ring-1 ring-slate-900/5 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-accent-500/40 dark:ring-white/10"
              style={{ background: "var(--card)" }}
            >
              {/* Hora */}
              <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-gradient-to-b from-brand-600 to-accent-600 py-2 text-white">
                <span className="text-sm font-semibold">
                  {format(new Date(cita.inicio), "HH:mm")}
                </span>
                <span className="text-[10px] opacity-80">
                  {format(new Date(cita.fin), "HH:mm")}
                </span>
              </div>

              {/* Paciente */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{nombre}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm" style={{ color: "var(--ink-muted)" }}>
                  {cita.modalidad === "telemedicina" ? (
                    <>
                      <Video className="h-3.5 w-3.5 text-accent-500" /> Videoconsulta
                    </>
                  ) : (
                    <>
                      <MapPin className="h-3.5 w-3.5 text-brand-500" /> Presencial
                    </>
                  )}
                  <span aria-hidden>·</span>
                  {mxn.format(Number(cita.precio))}
                </p>
              </div>

              {/* Acción */}
              {cita.modalidad === "telemedicina" && cita.enlace_videollamada ? (
                <a
                  href={cita.enlace_videollamada}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-accent-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-600"
                >
                  Unirse
                </a>
              ) : (
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-100">
                  {cita.estado}
                </span>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "brand" | "accent";
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl p-4 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10"
      style={{ background: "var(--card)" }}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${
          tone === "brand"
            ? "bg-gradient-to-br from-brand-500 to-brand-700"
            : "bg-gradient-to-br from-accent-400 to-accent-600"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs" style={{ color: "var(--ink-muted)" }}>{label}</p>
        <p className="text-lg font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}
