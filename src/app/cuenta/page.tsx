"use client";

import Link from "next/link";
import { useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarPlus, Gift, MapPin, Sparkles, Video } from "lucide-react";
import { PanelShell, KpiPastel } from "@/components/shell/PanelShell";
import { calcularLealtad, useDemoStore } from "@/lib/demo-store";

const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

// Nodo Paciente: su cuenta con citas, historial y programa de recompensas.
export default function CuentaPage() {
  const store = useDemoStore();
  const { listo, citas, sesion } = store;

  const mias = useMemo(
    () => citas.filter((c) => c.paciente_id === "pac-1"),
    [citas]
  );
  const ahora = Date.now();
  const proximas = mias
    .filter((c) => c.estado === "confirmada" && new Date(c.fin).getTime() >= ahora)
    .sort((a, b) => a.inicio.localeCompare(b.inicio));
  const historial = mias
    .filter((c) => c.estado !== "confirmada" || new Date(c.fin).getTime() < ahora)
    .sort((a, b) => b.inicio.localeCompare(a.inicio));
  const lealtad = calcularLealtad(citas, "pac-1");

  if (!listo) return null;

  if (!sesion || sesion.rol !== "paciente") {
    return <SinSesion />;
  }

  return (
    <PanelShell sesion={sesion} activo="Mi cuenta" onLogout={store.logout}>
      <header className="anim-in mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hola, {sesion.nombre.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-sm capitalize" style={{ color: "var(--ink-muted)" }}>
            {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
        <Link
          href="/reservar"
          className="card-hover flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-accent-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md"
        >
          <CalendarPlus className="h-4 w-4" /> Agendar nueva cita
        </Link>
      </header>

      {/* KPIs pastel */}
      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <KpiPastel
          tono="azul"
          delay="anim-d1"
          icon={<CalendarPlus className="h-4 w-4" />}
          label="Próximas citas"
          value={String(proximas.length)}
          nota="Confirmadas y pagadas"
        />
        <KpiPastel
          tono="lila"
          delay="anim-d2"
          icon={<Sparkles className="h-4 w-4" />}
          label="Citas asistidas"
          value={String(lealtad.puntos)}
          nota="Acumuladas en tu historial"
        />
        <KpiPastel
          tono="menta"
          delay="anim-d3"
          icon={<Gift className="h-4 w-4" />}
          label="Recompensas ganadas"
          value={String(lealtad.recompensasGanadas)}
          nota={`Te faltan ${lealtad.faltan} citas para la siguiente`}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Próximas citas */}
        <section className="anim-in anim-d2 space-y-3 lg:col-span-2">
          <h2 className="font-semibold">Próximas citas</h2>
          {proximas.length === 0 && (
            <div
              className="rounded-2xl border border-dashed border-brand-500/30 p-8 text-center text-sm"
              style={{ background: "var(--card)", color: "var(--ink-muted)" }}
            >
              No tienes citas próximas.{" "}
              <Link href="/reservar" className="font-medium text-brand-600">
                Agenda una aquí
              </Link>
              .
            </div>
          )}
          {proximas.map((c) => (
            <article
              key={c.id}
              className="card-hover flex items-center gap-4 rounded-2xl p-4 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10"
              style={{ background: "var(--card)" }}
            >
              <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-gradient-to-b from-brand-600 to-accent-600 py-2 text-white">
                <span className="text-[10px] font-medium capitalize opacity-90">
                  {format(new Date(c.inicio), "d MMM", { locale: es })}
                </span>
                <span className="text-sm font-semibold">{format(new Date(c.inicio), "HH:mm")}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{c.medico_nombre}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm" style={{ color: "var(--ink-muted)" }}>
                  {c.modalidad === "telemedicina" ? (
                    <><Video className="h-3.5 w-3.5 text-accent-500" /> Videoconsulta</>
                  ) : (
                    <><MapPin className="h-3.5 w-3.5 text-brand-500" /> Presencial</>
                  )}
                  <span aria-hidden>·</span> {mxn.format(c.precio)}
                </p>
              </div>
              {c.modalidad === "telemedicina" && c.enlace_videollamada && (
                <a
                  href={c.enlace_videollamada}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-accent-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-600"
                >
                  Unirse
                </a>
              )}
              <button
                onClick={() => store.cancelarCita(c.id)}
                className="rounded-full px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                Cancelar
              </button>
            </article>
          ))}

          <h2 className="pt-4 font-semibold">Historial</h2>
          {historial.map((c) => (
            <article
              key={c.id}
              className="flex items-center gap-4 rounded-2xl p-4 opacity-80 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10"
              style={{ background: "var(--card)" }}
            >
              <div className="w-16 shrink-0 text-center">
                <p className="text-xs font-medium capitalize" style={{ color: "var(--ink-muted)" }}>
                  {format(new Date(c.inicio), "d MMM yy", { locale: es })}
                </p>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.medico_nombre}</p>
                <p className="text-xs" style={{ color: "var(--ink-muted)" }}>{c.especialidad}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  c.estado === "asistida"
                    ? "bg-pastel-menta text-emerald-700"
                    : c.estado === "cancelada"
                      ? "bg-red-50 text-red-500 dark:bg-red-950/40"
                      : "bg-slate-100 text-slate-500 dark:bg-white/5"
                }`}
              >
                {c.estado}
              </span>
            </article>
          ))}
        </section>

        {/* Programa de lealtad */}
        <section className="anim-in anim-d3">
          <div className="card-hover rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-accent-500 p-6 text-white shadow-md">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Gift className="h-5 w-5" />
              </span>
              <h2 className="font-semibold">Tu recompensa</h2>
            </div>
            <p className="text-sm text-white/85">
              Cada <strong>5 citas asistidas</strong> desbloqueas un{" "}
              <strong>20% de descuento</strong> en tu siguiente consulta.
            </p>
            {/* Progreso */}
            <div className="mt-5 flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2.5 flex-1 rounded-full transition-colors ${
                    i < lealtad.progreso ? "bg-white" : "bg-white/25"
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-white/80">
              {lealtad.progreso} de 5 citas · te faltan {lealtad.faltan}
            </p>
            {lealtad.recompensasGanadas > 0 && (
              <p className="anim-pop mt-4 rounded-xl bg-white/15 px-4 py-3 text-sm font-medium">
                🎉 Tienes {lealtad.recompensasGanadas}{" "}
                {lealtad.recompensasGanadas === 1 ? "descuento disponible" : "descuentos disponibles"}{" "}
                — se aplicará en tu próxima reserva.
              </p>
            )}
          </div>
        </section>
      </div>
    </PanelShell>
  );
}

function SinSesion() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="anim-in text-lg font-semibold">Inicia sesión para ver tu cuenta</p>
      <Link
        href="/login"
        className="anim-in anim-d1 rounded-full bg-gradient-to-r from-brand-600 to-accent-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md"
      >
        Entrar a la demo
      </Link>
    </main>
  );
}
