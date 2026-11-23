"use client";

import { CheckCircle2, TrendingDown, TrendingUp, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ZONA_HORARIA } from "@/lib/datos/disponibilidad";
import type { Cita, EstadoCita } from "@/lib/datos/modelo";

// --- Formatos ---------------------------------------------------------------

export const moneda = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
export const numero = new Intl.NumberFormat("es-MX");
export const pct = (v: number) => `${Math.round(v * 100)} %`;

const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("es-MX", { timeZone: ZONA_HORARIA, ...o });
const fHora = fmt({ hour: "2-digit", minute: "2-digit", hour12: false });
const fDia = fmt({ weekday: "long", day: "numeric", month: "long" });
const fCorta = fmt({ weekday: "short", day: "numeric", month: "short" });
const fFecha = fmt({ day: "numeric", month: "short", year: "numeric" });
const fClave = fmt({ year: "numeric", month: "2-digit", day: "2-digit" });

export const hora = (iso: string | number | Date) => fHora.format(new Date(iso));
export const diaLargo = (iso: string | number | Date) => fDia.format(new Date(iso));
export const diaCorto = (iso: string | number | Date) => fCorta.format(new Date(iso)).replace(/\./g, "");
export const fecha = (iso: string | number | Date) => fFecha.format(new Date(iso)).replace(/\./g, "");
/** "2026-11-23" en la zona de la clínica: para agrupar por día. */
export const claveDia = (iso: string | number | Date) => {
  const p = Object.fromEntries(fClave.formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
};

export function edad(nacimiento?: string) {
  if (!nacimiento) return "";
  const meses = Math.floor((Date.now() - new Date(nacimiento).getTime()) / (30.44 * 86_400_000));
  if (meses < 1) return "Recién nacido";
  if (meses < 24) return `${meses} ${meses === 1 ? "mes" : "meses"}`;
  return `${Math.floor(meses / 12)} años`;
}

export function hace(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return `hace ${d} ${d === 1 ? "día" : "días"}`;
}

export function inicialesDe(nombre: string) {
  return nombre
    .replace(/^(Dra?|Enf|Lic)\.\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

// --- Piezas ------------------------------------------------------------------

export function Avatar({ nombre, color, size = "", className = "" }: { nombre: string; color?: string; size?: "" | "is-sm" | "is-lg" | "is-xl"; className?: string }) {
  return (
    <span className={`avatar ${size} ${className}`} style={color ? { background: `linear-gradient(135deg, ${color}, color-mix(in srgb, ${color} 70%, #0b1a38))` } : undefined} aria-hidden>
      {inicialesDe(nombre)}
    </span>
  );
}

const ESTILO_ESTADO: Record<EstadoCita, string> = {
  confirmada: "chip-teal",
  asistida: "chip-ok",
  no_asistio: "chip-warn",
  cancelada: "chip-danger",
};
const TEXTO_ESTADO: Record<EstadoCita, string> = {
  confirmada: "Agendada",
  asistida: "Atendida",
  no_asistio: "No asistió",
  cancelada: "Cancelada",
};

export function EstadoChip({ estado }: { estado: EstadoCita }) {
  return (
    <span className={`chip ${ESTILO_ESTADO[estado]}`}>
      <span className="dot" />
      {TEXTO_ESTADO[estado]}
    </span>
  );
}

export function PagoChip({ cita }: { cita: Pick<Cita, "estado_pago" | "metodo_pago" | "estado"> }) {
  if (cita.estado === "cancelada") return null;
  return cita.estado_pago === "pagado" ? (
    <span className="chip chip-mint">Pagado · {cita.metodo_pago === "tarjeta" ? "tarjeta" : "efectivo"}</span>
  ) : (
    <span className="chip">Por cobrar</span>
  );
}

export function PageHead({ titulo, sub, children }: { titulo: string; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div className="page-head anim-in">
      <div>
        <h1>{titulo}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Kpi({
  label,
  valor,
  icono,
  nota,
  delta,
  destacado,
}: {
  label: string;
  valor: ReactNode;
  icono?: ReactNode;
  nota?: ReactNode;
  delta?: number | null;
  destacado?: boolean;
}) {
  return (
    <div className={`kpi anim-in ${destacado ? "is-feature" : ""}`}>
      <div className="kpi-label">
        {icono && <span className={`icon-tile is-sm ${destacado ? "" : "is-soft"}`} style={destacado ? { background: "rgba(255,255,255,.18)", boxShadow: "none" } : undefined}>{icono}</span>}
        {label}
      </div>
      <div className="kpi-value tnum">{valor}</div>
      {(nota || (delta !== undefined && delta !== null)) && (
        <div className="kpi-note flex flex-wrap items-center gap-2">
          {delta !== undefined && delta !== null && Number.isFinite(delta) && (
            <span className={`delta ${delta >= 0 ? "up" : "down"}`}>
              {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {delta >= 0 ? "+" : ""}
              {Math.round(delta * 100)} %
            </span>
          )}
          {nota}
        </div>
      )}
    </div>
  );
}

export function Vacio({ icono, titulo, children }: { icono?: ReactNode; titulo: string; children?: ReactNode }) {
  return (
    <div className="empty">
      {icono && <span className="icon-tile is-soft">{icono}</span>}
      <b style={{ color: "var(--navy)", fontWeight: 600 }}>{titulo}</b>
      {children && <div style={{ fontSize: 14, maxWidth: 380 }}>{children}</div>}
    </div>
  );
}

export function Switch({ valor, onChange, etiqueta, disabled }: { valor: boolean; onChange: (v: boolean) => void; etiqueta: string; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={valor} aria-label={etiqueta} className="switch" disabled={disabled} onClick={() => onChange(!valor)} />
  );
}

export function Segmented<T extends string>({ valor, opciones, onChange }: { valor: T; opciones: { id: T; label: ReactNode }[]; onChange: (v: T) => void }) {
  return (
    <div className="segmented" role="tablist">
      {opciones.map((o) => (
        <button key={o.id} type="button" role="tab" aria-selected={o.id === valor} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Modal({
  abierto,
  onClose,
  titulo,
  sub,
  children,
  pie,
  grande,
}: {
  abierto: boolean;
  onClose: () => void;
  titulo: ReactNode;
  sub?: ReactNode;
  children: ReactNode;
  pie?: ReactNode;
  grande?: boolean;
}) {
  useEffect(() => {
    if (!abierto) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
    };
  }, [abierto, onClose]);
  if (!abierto) return null;
  return (
    <div className="modal-fondo" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${grande ? "is-lg" : ""}`} role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <h2>{titulo}</h2>
            {sub && <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>{sub}</p>}
          </div>
          <button type="button" className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {pie && <div className="modal-foot">{pie}</div>}
      </div>
    </div>
  );
}

/** Aviso breve en la parte baja de la pantalla. */
export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const t = useRef<number | null>(null);
  const mostrar = useCallback((m: string) => {
    setMsg(m);
    if (t.current) window.clearTimeout(t.current);
    t.current = window.setTimeout(() => setMsg(null), 2800);
  }, []);
  const nodo = msg ? (
    <div className="toast" role="status">
      <CheckCircle2 />
      {msg}
    </div>
  ) : null;
  return { mostrar, nodo };
}

/** Aparición suave al entrar en pantalla. */
export function Reveal({ children, className = "", delay = 0, as: Tag = "div" }: { children: ReactNode; className?: string; delay?: number; as?: "div" | "section" | "li" | "article" }) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/** Número que cuenta hasta su valor al aparecer. */
export function Contador({ valor, formato = (n: number) => numero.format(Math.round(n)) }: { valor: number; formato?: (n: number) => string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const inicio = performance.now();
    const paso = (t: number) => {
      const p = Math.min(1, (t - inicio) / 900);
      setN(valor * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [valor]);
  return <>{formato(n)}</>;
}

export function Cargando() {
  return (
    <div className="grid place-items-center" style={{ minHeight: "50vh" }}>
      <div className="pre-barra" style={{ opacity: 1, animation: "none" }}>
        <span />
      </div>
    </div>
  );
}
