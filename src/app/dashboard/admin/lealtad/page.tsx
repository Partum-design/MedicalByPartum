"use client";

import { useMemo, useState } from "react";
import { Ban, Gift, Minus, Plus, Power, Sparkles } from "lucide-react";
import { useClinica } from "@/lib/store";
import { calcularLealtad } from "@/lib/datos/modelo";
import { Avatar, Kpi, PageHead, Switch, useToast } from "@/components/ui";
import { Isotipo } from "@/components/marca/Logo";

/**
 * Programa de lealtad. Queda en el sistema pero APAGADO por defecto: con el
 * interruptor en off no aparece en la portada ni en la cuenta del paciente,
 * aunque las tarjetas y sellos se siguen calculando por si se enciende.
 */
export default function Lealtad() {
  const c = useClinica();
  const toast = useToast();
  const cfg = c.recompensasConfig;
  const [busca, setBusca] = useState("");
  const filas = useMemo(
    () =>
      c.tarjetas
        .map((t) => {
          const p = c.pacientes.find((x) => x.id === t.paciente_id);
          const l = calcularLealtad(c.citas, t.paciente_id, cfg.citas_requeridas, t.sellos_extra);
          return { t, p, l, disponibles: Math.max(0, l.recompensasGanadas - (c.canjes[t.paciente_id] ?? 0)) };
        })
        .filter((f) => f.p && (!busca || f.p.nombre.toLowerCase().includes(busca.toLowerCase()) || f.t.numero.includes(busca.toUpperCase())))
        .sort((a, b) => b.l.puntos - a.l.puntos),
    [c.tarjetas, c.pacientes, c.citas, c.canjes, cfg.citas_requeridas, busca]
  );

  return (
    <>
      <PageHead titulo="Programa de lealtad" sub="Sellos por consulta atendida y descuento al completar la tarjeta." />
      <div className="card anim-in" style={{ padding: 22, marginBottom: 16, background: cfg.activa ? "var(--teal-50)" : "#fff", borderColor: cfg.activa ? "var(--teal-100)" : undefined }}>
        <div className="flex flex-wrap items-center gap-4">
          <span className="icon-tile" style={{ background: cfg.activa ? undefined : "#cfd9de", boxShadow: "none" }}><Power /></span>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div className="flex items-center gap-2">
              <b style={{ fontWeight: 600, color: "var(--navy)", fontSize: 17 }}>Programa {cfg.activa ? "encendido" : "apagado"}</b>
              <span className={`chip ${cfg.activa ? "chip-ok" : ""}`}><span className="dot" />{cfg.activa ? "Visible para pacientes" : "Oculto para pacientes"}</span>
            </div>
            <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 2 }}>
              {cfg.activa ? "Los pacientes ven su tarjeta en su cuenta y la portada anuncia el programa." : "El programa está en el sistema pero no se muestra. Los sellos se siguen contando por si lo enciendes después."}
            </p>
          </div>
          <Switch valor={cfg.activa} etiqueta="Encender programa de lealtad" onChange={(v) => { c.actualizarRecompensasConfig({ activa: v }); toast.mostrar(v ? "Programa de lealtad encendido" : "Programa de lealtad apagado"); }} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="grid content-start gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Kpi label="Tarjetas emitidas" icono={<Gift />} valor={c.tarjetas.length} />
            <Kpi label="Recompensas por canjear" icono={<Sparkles />} valor={filas.reduce((a, f) => a + f.disponibles, 0)} />
            <Kpi label="Canjeadas" valor={Object.values(c.canjes).reduce((a, n) => a + n, 0)} />
          </div>
          <div className="card anim-in" style={{ overflow: "hidden", opacity: cfg.activa ? 1 : 0.75 }}>
            <div style={{ padding: 16, borderBottom: "1px solid var(--line-2)" }}>
              <input className="input input-search" style={{ maxWidth: 340 }} placeholder="Buscar por nombre o número" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Paciente</th><th>Tarjeta</th><th>Sellos</th><th>Disponibles</th><th></th></tr></thead>
                <tbody>
                  {filas.slice(0, 40).map(({ t, p, l, disponibles }) => (
                    <tr key={t.id} style={{ opacity: t.estado === "suspendida" ? 0.5 : 1 }}>
                      <td><span className="flex items-center gap-2"><Avatar nombre={p!.nombre} size="is-sm" />{p!.nombre}</span></td>
                      <td className="tnum" style={{ color: "var(--muted)" }}>{t.numero}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: l.requerido }, (_, i) => <span key={i} style={{ width: 14, height: 14, borderRadius: 14, background: i < l.progreso ? "var(--teal)" : "var(--line)" }} />)}
                          <span style={{ fontSize: 12, color: "var(--soft)", marginLeft: 6 }}>{l.puntos} total</span>
                        </div>
                      </td>
                      <td>{disponibles > 0 ? <span className="chip chip-mint">{disponibles} × {cfg.valor_descuento}%</span> : "—"}</td>
                      <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                        <button type="button" className="btn btn-ghost btn-icon" aria-label="Quitar sello" onClick={() => c.ajustarSellos(t.id, -1)}><Minus size={14} /></button>
                        <button type="button" className="btn btn-ghost btn-icon" aria-label="Poner sello" onClick={() => c.ajustarSellos(t.id, 1)}><Plus size={14} /></button>
                        {disponibles > 0 && <button type="button" className="btn btn-soft btn-sm" onClick={() => c.canjearRecompensa(t.paciente_id).ok && toast.mostrar("Recompensa canjeada")}>Canjear</button>}
                        <button type="button" className="btn btn-ghost btn-icon" aria-label="Suspender" onClick={() => c.cambiarEstadoTarjeta(t.id, t.estado === "activa" ? "suspendida" : "activa")}><Ban size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="grid content-start gap-4">
          <div className="credencial anim-in" style={{ filter: cfg.activa ? undefined : "grayscale(.7)" }}>
            <div className="flex items-center justify-between">
              <span style={{ background: "#fff", borderRadius: 10, padding: "4px 8px", display: "inline-flex" }}><Isotipo alto={18} /></span>
              <span style={{ fontSize: 12, opacity: 0.8 }}>Tarjeta {c.clinicaConfig.nombre}</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, marginTop: 26 }}>Lucía Ramírez</div>
            <div className="flex gap-2" style={{ marginTop: 12 }}>
              {Array.from({ length: cfg.citas_requeridas }, (_, i) => <span key={i} style={{ width: 26, height: 26, borderRadius: 26, background: i < 3 ? "#fff" : "rgba(255,255,255,.22)", display: "grid", placeItems: "center", color: "var(--teal)", fontSize: 13 }}>{i < 3 ? "✚" : ""}</span>)}
            </div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 12 }}>Al completar: {cfg.valor_descuento}% en tu siguiente consulta</div>
          </div>
          <div className="card card-pad anim-in grid gap-3">
            <h3 style={{ fontSize: 16 }}>Reglas</h3>
            <label className="field"><span>Consultas para completar la tarjeta</span><input className="input" type="number" min={2} max={20} value={cfg.citas_requeridas} onChange={(e) => c.actualizarRecompensasConfig({ citas_requeridas: Math.max(2, Number(e.target.value)) })} /></label>
            <label className="field"><span>Descuento de la recompensa (%)</span><input className="input" type="number" min={5} max={100} value={cfg.valor_descuento} onChange={(e) => c.actualizarRecompensasConfig({ valor_descuento: Math.max(1, Number(e.target.value)) })} /></label>
            <p style={{ fontSize: 12.5, color: "var(--soft)" }}>Cada cita marcada como atendida suma un sello automáticamente. Google Wallet se activa con la cuenta de emisor de la clínica.</p>
          </div>
        </div>
      </div>
      {toast.nodo}
    </>
  );
}
