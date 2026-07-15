"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format, setHours, setMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle2, Clock, ShieldCheck, Smartphone, Video } from "lucide-react";

type Medico = {
  id: string;
  nombre: string;
  especialidad: string;
  precio_consulta: number;
  duracion_cita_min: number;
  acepta_telemedicina: boolean;
  biografia: string;
};

type Paso = "medico" | "horario" | "otp" | "pago" | "confirmada";

const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

export function FlujoReserva({ medicos, demo }: { medicos: Medico[]; demo: boolean }) {
  const [paso, setPaso] = useState<Paso>("medico");
  const [medico, setMedico] = useState<Medico | null>(null);
  const [slot, setSlot] = useState<Date | null>(null);
  const [telefono, setTelefono] = useState("");
  const [codigo, setCodigo] = useState("");
  const [otpEnviado, setOtpEnviado] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [expiraEn, setExpiraEn] = useState<Date | null>(null);
  const [restante, setRestante] = useState("10:00");

  // Cuenta regresiva del bloqueo del slot (10 minutos)
  useEffect(() => {
    if (!expiraEn) return;
    const t = setInterval(() => {
      const ms = expiraEn.getTime() - Date.now();
      if (ms <= 0) {
        setRestante("00:00");
        clearInterval(t);
        return;
      }
      const m = Math.floor(ms / 60_000);
      const s = Math.floor((ms % 60_000) / 1000);
      setRestante(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(t);
  }, [expiraEn]);

  // Slots de ejemplo: próximos 3 días hábiles, 9:00–13:00
  const slots = useMemo(() => {
    if (!medico) return [];
    const out: Date[] = [];
    for (let d = 1; d <= 3; d++) {
      const dia = addDays(new Date(), d);
      if ([0, 6].includes(dia.getDay())) continue;
      for (let h = 9; h < 13; h++) {
        out.push(setMinutes(setHours(dia, h), 0));
        if (medico.duracion_cita_min <= 30) out.push(setMinutes(setHours(dia, h), 30));
      }
    }
    return out;
  }, [medico]);

  async function enviarOtp() {
    setError("");
    setCargando(true);
    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefono, canal: "whatsapp" }),
    });
    const data = await res.json();
    setCargando(false);
    if (!res.ok) return setError(data.error ?? "Error al enviar el código");
    setOtpEnviado(true);
  }

  async function verificarOtpYReservar() {
    if (!medico || !slot) return;
    setError("");
    setCargando(true);

    const verif = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefono, codigo }),
    });
    const vdata = await verif.json();
    if (!verif.ok) {
      setCargando(false);
      return setError(vdata.error ?? "Código incorrecto");
    }

    const fin = new Date(slot.getTime() + medico.duracion_cita_min * 60_000);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        medico_id: medico.id,
        inicio: slot.toISOString(),
        fin: fin.toISOString(),
        modalidad: "presencial",
      }),
    });
    const data = await res.json();
    setCargando(false);
    if (!res.ok) return setError(data.error ?? "No fue posible reservar");

    setExpiraEn(new Date(data.bloqueo_expira_en));
    setPaso("pago");
  }

  return (
    <div className="space-y-4">
      <Stepper actual={paso} />

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900">
          {error}
        </p>
      )}

      {/* Paso 1: elegir médico */}
      {paso === "medico" && (
        <div className="space-y-3">
          {medicos.map((m) => (
            <button
              key={m.id}
              onClick={() => { setMedico(m); setPaso("horario"); }}
              className="flex w-full items-center gap-4 rounded-2xl p-4 text-left shadow-sm ring-1 ring-slate-900/5 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-accent-500/50 dark:ring-white/10"
              style={{ background: "var(--card)" }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-lg font-semibold text-white">
                {m.nombre.replace(/^Dra?\.\s*/, "").charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{m.nombre}</p>
                <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                  {m.especialidad} · {m.duracion_cita_min} min
                  {m.acepta_telemedicina && (
                    <span className="ml-2 inline-flex items-center gap-1 text-accent-600">
                      <Video className="h-3.5 w-3.5" /> Video
                    </span>
                  )}
                </p>
              </div>
              <span className="font-semibold text-brand-600">{mxn.format(m.precio_consulta)}</span>
            </button>
          ))}
        </div>
      )}

      {/* Paso 2: elegir horario */}
      {paso === "horario" && medico && (
        <div className="rounded-2xl p-5 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10" style={{ background: "var(--card)" }}>
          <p className="mb-4 text-sm">
            Disponibilidad de <span className="font-medium">{medico.nombre}</span>
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((s) => (
              <button
                key={s.toISOString()}
                onClick={() => { setSlot(s); setPaso("otp"); }}
                className="rounded-xl border border-brand-500/25 px-2 py-2.5 text-center text-sm transition-colors hover:border-accent-500 hover:bg-accent-100/50 dark:hover:bg-accent-500/10"
              >
                <span className="block text-[11px] capitalize" style={{ color: "var(--ink-muted)" }}>
                  {format(s, "EEE d MMM", { locale: es })}
                </span>
                <span className="font-medium">{format(s, "HH:mm")}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Paso 3: verificación OTP */}
      {paso === "otp" && (
        <div className="rounded-2xl p-6 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10" style={{ background: "var(--card)" }}>
          <div className="mb-4 flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-accent-500" />
            <h2 className="font-semibold">Verifica tu teléfono</h2>
          </div>
          <p className="mb-4 text-sm" style={{ color: "var(--ink-muted)" }}>
            Para proteger la agenda contra bots, confirma tu número por WhatsApp o SMS.
            {demo && " (Demo: cualquier número válido; código 000000)"}
          </p>
          <div className="space-y-3">
            <input
              type="tel"
              placeholder="+52 1 55 1234 5678"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value.replace(/[^+\d]/g, ""))}
              className="w-full rounded-xl border border-slate-300/70 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-accent-500 dark:border-white/15"
            />
            {otpEnviado && (
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Código de 6 dígitos"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-xl border border-slate-300/70 bg-transparent px-4 py-2.5 text-sm tracking-[0.4em] outline-none focus:border-accent-500 dark:border-white/15"
              />
            )}
            <button
              disabled={cargando || (otpEnviado ? codigo.length !== 6 : telefono.length < 11)}
              onClick={otpEnviado ? verificarOtpYReservar : enviarOtp}
              className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 py-2.5 font-medium text-white transition-opacity disabled:opacity-40"
            >
              {cargando ? "Procesando…" : otpEnviado ? "Verificar y apartar horario" : "Enviar código"}
            </button>
          </div>
        </div>
      )}

      {/* Paso 4: pago con slot bloqueado */}
      {paso === "pago" && medico && slot && (
        <div className="rounded-2xl p-6 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10" style={{ background: "var(--card)" }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Confirma tu pago</h2>
            <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
              <Clock className="h-4 w-4" /> {restante}
            </span>
          </div>
          <dl className="mb-5 space-y-2 text-sm">
            <Fila k="Especialista" v={medico.nombre} />
            <Fila k="Fecha" v={format(slot, "EEEE d 'de' MMMM, HH:mm 'h'", { locale: es })} />
            <Fila k="Total" v={mxn.format(medico.precio_consulta)} destacado />
          </dl>
          <p className="mb-4 flex items-start gap-2 text-xs" style={{ color: "var(--ink-muted)" }}>
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
            Tu horario está apartado por 10 minutos. Si el pago no se completa, se libera
            automáticamente para otros pacientes.
          </p>
          <button
            onClick={() => setPaso("confirmada")}
            className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-accent-500 py-2.5 font-medium text-white"
          >
            {demo ? "Simular pago con Stripe" : "Pagar con Stripe"}
          </button>
        </div>
      )}

      {/* Paso 5: confirmación */}
      {paso === "confirmada" && medico && slot && (
        <div className="rounded-2xl p-8 text-center shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10" style={{ background: "var(--card)" }}>
          <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-accent-500" />
          <h2 className="text-lg font-semibold">¡Cita confirmada!</h2>
          <p className="mt-1 text-sm capitalize" style={{ color: "var(--ink-muted)" }}>
            {medico.nombre} · {format(slot, "EEEE d 'de' MMMM, HH:mm 'h'", { locale: es })}
          </p>
          <p className="mx-auto mt-4 w-fit rounded-full bg-brand-50 px-4 py-1.5 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-100">
            🎁 Programa de lealtad: 1 de 5 citas — a 4 citas de tu recompensa
          </p>
        </div>
      )}
    </div>
  );
}

function Stepper({ actual }: { actual: Paso }) {
  const pasos: { id: Paso; label: string }[] = [
    { id: "medico", label: "Especialista" },
    { id: "horario", label: "Horario" },
    { id: "otp", label: "Verificación" },
    { id: "pago", label: "Pago" },
  ];
  const idx = pasos.findIndex((p) => p.id === actual);
  const activo = actual === "confirmada" ? pasos.length : idx;
  return (
    <ol className="flex items-center gap-2">
      {pasos.map((p, i) => (
        <li key={p.id} className="flex flex-1 flex-col gap-1.5">
          <span
            className={`h-1.5 rounded-full transition-colors ${
              i <= activo ? "bg-gradient-to-r from-brand-500 to-accent-500" : "bg-slate-200 dark:bg-white/10"
            }`}
          />
          <span className="text-[11px] font-medium" style={{ color: i <= activo ? undefined : "var(--ink-muted)" }}>
            {p.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Fila({ k, v, destacado }: { k: string; v: string; destacado?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt style={{ color: "var(--ink-muted)" }}>{k}</dt>
      <dd className={destacado ? "font-semibold text-brand-600" : "font-medium"}>{v}</dd>
    </div>
  );
}
