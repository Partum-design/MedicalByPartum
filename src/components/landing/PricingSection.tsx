"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Sparkles } from "lucide-react";

const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

type Plan = {
  id: string;
  nombre: string;
  descripcion: string;
  precioMensual: number;
  destacado?: boolean;
  features: string[];
};

const PLANES: Plan[] = [
  {
    id: "esencial",
    nombre: "Esencial",
    descripcion: "Para el consultorio de un solo médico que quiere dejar de agendar por teléfono.",
    precioMensual: 990,
    features: [
      "1 médico activo",
      "Agenda en línea con bloqueo anti-scalping",
      "Pago con tarjeta (Stripe) y efectivo en clínica",
      "Verificación de pacientes por WhatsApp/SMS",
      "Recordatorios automáticos de cita",
    ],
  },
  {
    id: "profesional",
    nombre: "Profesional",
    descripcion: "Para clínicas con varios especialistas que quieren fidelizar pacientes.",
    precioMensual: 1990,
    destacado: true,
    features: [
      "Hasta 5 médicos activos",
      "Todo lo del plan Esencial",
      "Telemedicina con videollamada automática",
      "Programa de lealtad configurable",
      "Panel de administrador con reportes",
      "Sincronización con Google/Outlook Calendar",
    ],
  },
  {
    id: "clinica",
    nombre: "Clínica",
    descripcion: "Para clínicas multi-sucursal con necesidades a la medida.",
    precioMensual: 3990,
    features: [
      "Médicos y sucursales ilimitados",
      "Todo lo del plan Profesional",
      "Roles y permisos por sucursal",
      "Soporte prioritario y onboarding dedicado",
      "Acceso a API para integraciones propias",
    ],
  },
];

// Sección de precios: mensual/anual con 20% de descuento en anual.
// CTA lleva a la demo interactiva (/login) — no hay checkout real, es una demo.
export function PricingSection() {
  const [anual, setAnual] = useState(false);

  return (
    <section id="precios" className="mx-auto max-w-6xl px-6 pb-20">
      <div className="anim-in mx-auto mb-8 max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight">Planes simples, sin sorpresas</h2>
        <p className="mt-2 text-sm" style={{ color: "var(--ink-muted)" }}>
          Cancela cuando quieras. Todos los planes incluyen pago con tarjeta y en efectivo desde
          el día uno.
        </p>

        <div className="mt-6 inline-flex items-center gap-1 rounded-full p-1 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10" style={{ background: "var(--card)" }}>
          <button
            onClick={() => setAnual(false)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              !anual ? "bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-sm" : ""
            }`}
            style={anual ? { color: "var(--ink-muted)" } : undefined}
          >
            Mensual
          </button>
          <button
            onClick={() => setAnual(true)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              anual ? "bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-sm" : ""
            }`}
            style={!anual ? { color: "var(--ink-muted)" } : undefined}
          >
            Anual <span className="text-xs opacity-90">· ahorra 20%</span>
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {PLANES.map((plan, i) => {
          const precio = anual ? Math.round(plan.precioMensual * 0.8) : plan.precioMensual;
          return (
            <div
              key={plan.id}
              className={`anim-in anim-d${i + 1} card-hover relative flex flex-col rounded-3xl p-6 shadow-sm ring-1 ${
                plan.destacado
                  ? "bg-gradient-to-b from-brand-700 via-brand-600 to-accent-600 text-white ring-transparent shadow-lg"
                  : "ring-slate-900/5 dark:ring-white/10"
              }`}
              style={plan.destacado ? undefined : { background: "var(--card)" }}
            >
              {plan.destacado && (
                <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 shadow-md">
                  <Sparkles className="h-3.5 w-3.5" /> Más elegido
                </span>
              )}
              <h3 className="font-semibold">{plan.nombre}</h3>
              <p
                className={`mt-1.5 text-sm leading-relaxed ${plan.destacado ? "text-white/85" : ""}`}
                style={plan.destacado ? undefined : { color: "var(--ink-muted)" }}
              >
                {plan.descripcion}
              </p>
              <p className="mt-5 flex items-baseline gap-1">
                <span className="text-3xl font-bold tabular-nums tracking-tight">{mxn.format(precio)}</span>
                <span className={`text-sm ${plan.destacado ? "text-white/75" : ""}`} style={plan.destacado ? undefined : { color: "var(--ink-muted)" }}>
                  /mes {anual && "· facturado anual"}
                </span>
              </p>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${plan.destacado ? "text-white" : "text-accent-500"}`} />
                    <span className={plan.destacado ? "text-white/90" : ""}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className={`card-hover mt-6 rounded-full px-5 py-2.5 text-center text-sm font-semibold shadow-sm transition-colors ${
                  plan.destacado
                    ? "bg-white text-brand-700"
                    : "bg-gradient-to-r from-brand-600 to-accent-500 text-white"
                }`}
              >
                Probar la demo
              </Link>
            </div>
          );
        })}
      </div>

      <p className="anim-in anim-d4 mx-auto mt-6 max-w-xl text-center text-xs" style={{ color: "var(--ink-muted)" }}>
        Precios de referencia en pesos mexicanos (MXN), antes de IVA. Esta demo no procesa pagos
        reales de suscripción.
      </p>
    </section>
  );
}
