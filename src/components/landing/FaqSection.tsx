"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const PREGUNTAS = [
  {
    q: "¿Puedo cobrar las consultas en efectivo además de con tarjeta?",
    a: "Sí. El paciente elige el método al agendar: tarjeta vía Stripe o efectivo en clínica. Las citas en efectivo quedan marcadas como \"pendientes\" hasta que recepción o el médico confirman el cobro desde su panel.",
  },
  {
    q: "¿Necesito tarjeta de crédito para probar la demo?",
    a: "No. La demo interactiva corre con datos locales en tu navegador — no se conecta a Stripe ni a una base de datos real, así que puedes explorar los tres roles (paciente, médico, administrador) sin ningún costo ni registro.",
  },
  {
    q: "¿Qué pasa si un paciente no completa el pago?",
    a: "El horario se bloquea por 10 minutos mientras se confirma el pago o el método elegido. Si no se completa, el sistema lo libera automáticamente para que otro paciente pueda tomarlo — así se evitan los huecos fantasma en la agenda.",
  },
  {
    q: "¿Puedo cambiar de plan más adelante?",
    a: "Sí, puedes subir o bajar de plan cuando quieras; el cambio aplica en el siguiente ciclo de facturación y no perdemos tu historial de pacientes, citas ni tu programa de lealtad.",
  },
  {
    q: "¿La plataforma sirve para clínicas con varios consultorios?",
    a: "Sí, el plan Clínica soporta múltiples sucursales y médicos ilimitados, con roles y permisos separados por sucursal para tu equipo administrativo.",
  },
];

// FAQ tipo acordeón; una sola pregunta abierta a la vez para mantenerlo limpio.
export function FaqSection() {
  const [abierta, setAbierta] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-3xl px-6 pb-20">
      <div className="anim-in mx-auto mb-8 max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight">Preguntas frecuentes</h2>
      </div>
      <div className="space-y-3">
        {PREGUNTAS.map((item, i) => {
          const abierto = abierta === i;
          return (
            <div
              key={item.q}
              className="anim-in overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10"
              style={{ background: "var(--card)", animationDelay: `${i * 0.05}s` }}
            >
              <button
                onClick={() => setAbierta(abierto ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium"
              >
                {item.q}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform duration-300 ${abierto ? "rotate-180 text-accent-500" : ""}`}
                  style={!abierto ? { color: "var(--ink-muted)" } : undefined}
                />
              </button>
              <div
                className="grid transition-all duration-300 ease-out"
                style={{ gridTemplateRows: abierto ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
