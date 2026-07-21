"use client";

import { useRef } from "react";
import { Activity, CheckCircle2, ShieldCheck, Wifi } from "lucide-react";

// Elemento firma de la landing (y de "Mi cuenta › Pagos"): la tarjeta
// guardada del paciente, el método de pago que sostiene todo el modelo de
// "pago anticipado" del producto. Se inclina en 3D siguiendo el puntero; en
// móvil flota con una animación suave. Los procesadores se muestran como
// texto informativo, no como logotipos oficiales.
export function SavedCard({
  nombre = "Mariana Gutiérrez",
  toast = true,
  trust = true,
}: {
  nombre?: string;
  toast?: boolean;
  trust?: boolean;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const el = sceneRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(px - 0.5) * 16}deg`);
    el.style.setProperty("--ry", `${(0.5 - py) * -14}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  }

  function onLeave() {
    const el = sceneRef.current;
    if (!el) return;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
  }

  return (
    <div className="relative mx-auto w-full max-w-sm">
      {/* resplandor ambiental */}
      <div
        className="absolute -inset-10 -z-10 rounded-[3rem] opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 30% 20%, rgb(0 255 179 / 0.35), transparent 60%), radial-gradient(circle at 80% 80%, rgb(15 135 181 / 0.45), transparent 55%)",
        }}
        aria-hidden
      />

      {/* toast flotante detrás */}
      {toast && (
        <div
          className="anim-pop anim-d3 absolute -right-3 -top-6 z-0 flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-3 text-xs font-medium text-ink-900 shadow-xl sm:-right-8"
          role="status"
        >
          <CheckCircle2 className="h-4 w-4 text-accent-500" />
          Pago confirmado · horario asegurado
        </div>
      )}

      <div
        ref={sceneRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="card-3d-scene relative z-10"
      >
        <div className="card-3d animate-float rounded-[1.75rem] p-6 shadow-2xl shadow-black/40">
          <div
            className="relative overflow-hidden rounded-[1.75rem] p-6 text-white"
            style={{
              background:
                "linear-gradient(135deg, #213A58 0%, #0C6478 46%, #15919B 72%, #46DFB1 100%)",
            }}
          >
            <div className="card-shine pointer-events-none absolute inset-0" aria-hidden />
            <Activity
              className="pointer-events-none absolute -bottom-6 -right-6 h-32 w-32 text-white/10"
              strokeWidth={1.25}
              aria-hidden
            />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="font-display text-sm font-bold tracking-tight">Medical OS</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">by Partum</p>
              </div>
              <Wifi className="h-5 w-5 rotate-90 text-white/70" aria-hidden />
            </div>

            <div className="relative mt-8 h-7 w-10 rounded-md bg-gradient-to-br from-mint-raw/80 to-white/40" aria-hidden />

            <div className="font-num relative mt-4 flex items-center gap-2.5 text-base text-white/95 sm:text-lg">
              <span className="tracking-[0.2em]">••••</span>
              <span className="tracking-[0.2em]">••••</span>
              <span className="tracking-[0.2em]">••••</span>
              <span className="tracking-[0.12em]">5521</span>
            </div>

            <div className="relative mt-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-white/55">Titular</p>
                <p className="text-sm font-medium">{nombre}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide text-white/55">Vence</p>
                <p className="font-num text-sm">09/29</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {trust && (
        <p className="mt-6 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center text-xs text-white/55">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-accent-400" />
          <span>Guardada de forma segura vía</span>
          <span className="font-semibold text-white/90">Stripe</span>
          <span aria-hidden>·</span>
          <span className="font-semibold text-white/90">Mercado Pago</span>
        </p>
      )}
    </div>
  );
}
