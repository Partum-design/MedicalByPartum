"use client";

import { useRef, useState } from "react";
import { Activity, Check, CheckCircle2, RotateCcw, ShieldCheck, Wifi } from "lucide-react";
import { MastercardMark, VisaMark } from "@/components/payments/BrandMarks";

type SavedCardProps = {
  nombre?: string;
  toast?: boolean;
  trust?: boolean;
  brand?: "visa" | "mastercard";
  last4?: string;
  active?: boolean;
  onSelect?: () => void;
};

export function SavedCard({
  nombre = "Mariana Gutiérrez",
  toast = true,
  trust = true,
  brand = "visa",
  last4 = "5521",
  active = false,
  onSelect,
}: SavedCardProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState(false);

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const el = sceneRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(px - 0.5) * 12}deg`);
    el.style.setProperty("--ry", `${(0.5 - py) * -10}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  }

  function resetTilt() {
    const el = sceneRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  const cardMark = brand === "visa"
    ? <VisaMark className="h-7 w-auto text-white" />
    : <MastercardMark compact className="h-8 w-auto text-white" />;

  return (
    <div className={`saved-card-wrap relative mx-auto w-full max-w-sm ${active ? "is-active" : ""}`}>
      <div className="saved-card-glow" aria-hidden />

      {toast && (
        <div className="anim-pop anim-d3 saved-card-toast" role="status">
          <CheckCircle2 /> Pago confirmado · horario asegurado
        </div>
      )}

      <div ref={sceneRef} onPointerMove={onMove} onPointerLeave={resetTilt} className="card-3d-scene relative z-10">
        <div className="card-3d">
          <div className={`saved-card-flipper ${flipped ? "is-flipped" : ""}`}>
            <div className="saved-card-face saved-card-front">
              <div className="card-shine pointer-events-none absolute inset-0" aria-hidden />
              <Activity className="saved-card-watermark" strokeWidth={1.25} aria-hidden />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="font-display text-sm font-bold tracking-tight">Barber OS</p>
                  <p className="text-[9px] uppercase tracking-[0.22em] text-white/60">by Partum</p>
                </div>
                <Wifi className="h-5 w-5 rotate-90 text-white/75" aria-hidden />
              </div>
              <div className="saved-card-chip" aria-hidden><i /><i /><i /></div>
              <div className="font-num relative mt-5 flex items-center gap-2 text-base text-white sm:text-lg">
                <span className="tracking-[0.18em]">••••</span><span className="tracking-[0.18em]">••••</span>
                <span className="tracking-[0.18em]">••••</span><span className="tracking-[0.1em]">{last4}</span>
              </div>
              <div className="relative mt-5 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-wide text-white/55">Titular</p>
                  <p className="truncate text-sm font-medium">{nombre}</p>
                </div>
                <div className="flex shrink-0 items-end gap-4">
                  <div className="text-right"><p className="text-[9px] uppercase tracking-wide text-white/55">Vence</p><p className="font-num text-sm">09/29</p></div>
                  {cardMark}
                </div>
              </div>
            </div>

            <div className="saved-card-face saved-card-back">
              <div className="saved-card-strip" />
              <div className="mt-5 px-1">
                <p className="text-[9px] uppercase tracking-[0.16em] text-white/50">Firma autorizada</p>
                <div className="saved-card-signature"><span>{nombre}</span><b>482</b></div>
                <div className="mt-5 flex items-end justify-between">
                  <div><p className="text-[9px] uppercase tracking-[0.16em] text-white/50">Método protegido</p><p className="mt-1 text-xs text-white/75">Tokenizado · datos cifrados</p></div>
                  {cardMark}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="saved-card-actions">
        {onSelect && (
          <button type="button" onClick={onSelect} className={active ? "is-selected" : ""} aria-pressed={active}>
            {active ? <><Check /> Activa</> : "Usar esta tarjeta"}
          </button>
        )}
        <button type="button" onClick={() => setFlipped((value) => !value)} aria-pressed={flipped}>
          <RotateCcw /> {flipped ? "Ver frente" : "Girar tarjeta"}
        </button>
      </div>

      {trust && (
        <p className="mt-5 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center text-xs text-white/55">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-accent-400" />
          Método tokenizado; Barber OS no almacena el número completo.
        </p>
      )}
    </div>
  );
}
