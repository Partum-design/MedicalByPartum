"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Save, Stethoscope, Video } from "lucide-react";
import { PanelShell } from "@/components/shell/PanelShell";
import { useDemoStore } from "@/lib/demo-store";

const DURACIONES = [15, 20, 30, 45, 60];

// Nodo Médico: datos del perfil que ve el paciente al elegir especialista
// (nombre, especialidad, precio, duración, telemedicina, biografía).
export default function ConfiguracionMedicoPage() {
  const store = useDemoStore();
  const { listo, sesion, medicos } = store;
  const medico = medicos.find((m) => m.id === sesion?.id) ?? null;

  const [form, setForm] = useState({
    especialidad: "",
    precio_consulta: 0,
    duracion_cita_min: 30,
    acepta_telemedicina: true,
    biografia: "",
  });
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    if (medico) {
      setForm({
        especialidad: medico.especialidad,
        precio_consulta: medico.precio_consulta,
        duracion_cita_min: medico.duracion_cita_min,
        acepta_telemedicina: medico.acepta_telemedicina,
        biografia: medico.biografia,
      });
    }
  }, [medico?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!listo) return null;

  if (!sesion || sesion.rol !== "medico" || !medico) {
    return <SinSesion />;
  }

  function guardar() {
    store.actualizarMedico(sesion!.id, form);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  }

  return (
    <PanelShell sesion={sesion} activo="Configuración" onLogout={store.logout}>
      <header className="anim-in mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-muted)" }}>
          Así te ven los pacientes al elegir especialista en el flujo de reserva.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="anim-in anim-d1 space-y-4 rounded-3xl p-6 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10 lg:col-span-2" style={{ background: "var(--card)" }}>
          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--ink-muted)" }}>
              Especialidad
            </label>
            <input
              value={form.especialidad}
              onChange={(e) => setForm((f) => ({ ...f, especialidad: e.target.value }))}
              className="w-full rounded-xl border border-slate-300/70 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-accent-500 dark:border-white/15"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--ink-muted)" }}>
                Precio de consulta (MXN)
              </label>
              <input
                type="number"
                min={0}
                value={form.precio_consulta}
                onChange={(e) => setForm((f) => ({ ...f, precio_consulta: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-300/70 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-accent-500 dark:border-white/15"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--ink-muted)" }}>
                Duración de la cita
              </label>
              <select
                value={form.duracion_cita_min}
                onChange={(e) => setForm((f) => ({ ...f, duracion_cita_min: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-300/70 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-accent-500 dark:border-white/15"
              >
                {DURACIONES.map((d) => (
                  <option key={d} value={d}>
                    {d} minutos
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--ink-muted)" }}>
              Biografía
            </label>
            <textarea
              value={form.biografia}
              onChange={(e) => setForm((f) => ({ ...f, biografia: e.target.value }))}
              rows={4}
              className="w-full rounded-xl border border-slate-300/70 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-accent-500 dark:border-white/15"
            />
          </div>

          <button
            onClick={() => setForm((f) => ({ ...f, acepta_telemedicina: !f.acepta_telemedicina }))}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
              form.acepta_telemedicina
                ? "border-accent-500 bg-accent-100/50 text-accent-600 dark:bg-accent-500/10"
                : "border-slate-200 dark:border-white/10"
            }`}
          >
            <span className="flex items-center gap-2">
              <Video className="h-4 w-4" /> Ofrezco videoconsultas
            </span>
            <span
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                form.acepta_telemedicina ? "bg-gradient-to-r from-brand-600 to-accent-500" : "bg-slate-200 dark:bg-white/10"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  form.acepta_telemedicina ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </span>
          </button>

          <button
            onClick={guardar}
            className="card-hover flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 px-5 py-2.5 text-sm font-semibold text-white"
          >
            {guardado ? (
              <>
                <Check className="h-4 w-4" /> Guardado
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Guardar cambios
              </>
            )}
          </button>
        </section>

        {/* Vista previa como la ve el paciente */}
        <section className="anim-in anim-d2">
          <p className="mb-2 text-xs font-medium" style={{ color: "var(--ink-muted)" }}>
            Vista previa
          </p>
          <div className="flex items-center gap-4 rounded-2xl p-4 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10" style={{ background: "var(--card)" }}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-lg font-semibold text-white">
              {sesion.nombre.replace(/^Dra?\.\s*/, "").charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{sesion.nombre}</p>
              <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                {form.especialidad} · {form.duracion_cita_min} min
                {form.acepta_telemedicina && (
                  <span className="ml-2 inline-flex items-center gap-1 text-accent-600">
                    <Video className="h-3.5 w-3.5" /> Video
                  </span>
                )}
              </p>
            </div>
            <span className="font-semibold text-brand-600">
              {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(form.precio_consulta)}
            </span>
          </div>
        </section>
      </div>
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
