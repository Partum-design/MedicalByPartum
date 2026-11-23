"use client";

import Link from "next/link";
import { Gift } from "lucide-react";
import { useClinica } from "@/lib/store";
import { calcularLealtad } from "@/lib/datos/modelo";
import { PageHead, Vacio } from "@/components/ui";
import { Isotipo } from "@/components/marca/Logo";
import { QrCita } from "@/components/citas/QrCita";

export default function Tarjeta() {
  const c = useClinica();
  const cfg = c.recompensasConfig;
  const t = c.tarjetas[0];
  if (!cfg.activa || !t) return <div className="card"><Vacio icono={<Gift />} titulo="El programa de lealtad no está disponible"><Link href="/cuenta" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }}>Volver</Link></Vacio></div>;
  const l = calcularLealtad(c.citas, t.paciente_id, cfg.citas_requeridas, t.sellos_extra);
  const disp = Math.max(0, l.recompensasGanadas - (c.canjes[t.paciente_id] ?? 0));
  return (
    <>
      <PageHead titulo="Mi tarjeta" sub={`Cada ${cfg.citas_requeridas} consultas atendidas ganas ${cfg.valor_descuento}% de descuento.`} />
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]" style={{ maxWidth: 900 }}>
        <div className="credencial anim-in" style={{ padding: 28 }}>
          <div className="flex items-center justify-between"><span style={{ background: "#fff", borderRadius: 10, padding: "4px 8px", display: "inline-flex" }}><Isotipo alto={18} /></span><span style={{ fontSize: 13, opacity: 0.85 }}>{t.numero}</span></div>
          <div style={{ fontSize: 22, fontWeight: 600, marginTop: 30 }}>{c.sesion?.nombre}</div>
          <div className="flex flex-wrap gap-2" style={{ marginTop: 14 }}>
            {Array.from({ length: l.requerido }, (_, i) => <span key={i} style={{ width: 34, height: 34, borderRadius: 34, display: "grid", placeItems: "center", background: i < l.progreso ? "#fff" : "rgba(255,255,255,.2)", color: "var(--teal)", fontWeight: 700 }}>{i < l.progreso ? "✚" : ""}</span>)}
          </div>
          <p style={{ marginTop: 14, opacity: 0.9 }}>{disp > 0 ? `Tienes ${disp} descuento(s) de ${cfg.valor_descuento}% listos.` : `Te faltan ${l.faltan} consulta(s) para tu descuento.`}</p>
        </div>
        <div className="card card-pad anim-in grid place-items-center gap-2" style={{ textAlign: "center" }}>
          <QrCita id={t.numero} size={170} />
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Muéstrala en recepción para sumar sellos.</p>
        </div>
      </div>
    </>
  );
}
