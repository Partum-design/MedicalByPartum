"use client";

import { useState } from "react";
import { DIAS_SEMANA } from "@/lib/datos/modelo";
import { useClinica } from "@/lib/store";
import { Avatar, PageHead, Switch } from "@/components/ui";
import { EditorHorario } from "@/components/panel/EditorHorario";

export default function Disponibilidad() {
  const c = useClinica();
  const [sel, setSel] = useState<string | null>(null);
  const activo = sel ?? c.medicos[0]?.id;
  const h = c.clinicaConfig.horario;
  return (
    <>
      <PageHead titulo="Disponibilidad" sub="Horario de la clínica y de cada especialista. La reserva en línea respeta ambos." />
      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <div className="card card-pad anim-in">
          <div className="card-title"><div><h2>Horario de la clínica</h2><p>Lo que publica la portada</p></div></div>
          <div className="grid gap-2">
            {DIAS_SEMANA.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center gap-3" style={{ padding: "8px 12px", borderRadius: 14, background: h[d.id].activo ? "var(--teal-50)" : "var(--bg-2)" }}>
                <Switch valor={h[d.id].activo} etiqueta={`Abre ${d.label}`} onChange={(v) => c.actualizarClinicaConfig({ horario: { ...h, [d.id]: { ...h[d.id], activo: v } } })} />
                <b style={{ width: 86, fontWeight: 500 }}>{d.label}</b>
                {h[d.id].activo ? (
                  <span className="flex items-center gap-2">
                    <input type="time" className="input" style={{ width: 112, minHeight: 38 }} value={h[d.id].inicio} onChange={(e) => c.actualizarClinicaConfig({ horario: { ...h, [d.id]: { ...h[d.id], inicio: e.target.value } } })} />
                    <input type="time" className="input" style={{ width: 112, minHeight: 38 }} value={h[d.id].fin} onChange={(e) => c.actualizarClinicaConfig({ horario: { ...h, [d.id]: { ...h[d.id], fin: e.target.value } } })} />
                  </span>
                ) : <span style={{ color: "var(--soft)" }}>Cerrado</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="card card-pad anim-in">
          <div className="card-title"><div><h2>Horario por especialista</h2><p>Elige a quién editar</p></div></div>
          <div className="flex flex-wrap gap-2" style={{ marginBottom: 16 }}>
            {c.medicos.map((m) => (
              <button key={m.id} type="button" onClick={() => setSel(m.id)} className="chip" style={{ height: 38, padding: "0 12px 0 4px", cursor: "pointer", border: `1px solid ${activo === m.id ? m.color : "transparent"}`, background: activo === m.id ? "#fff" : "var(--bg-2)" }}>
                <Avatar nombre={m.nombre} color={m.color} size="is-sm" /> {m.nombre}
              </button>
            ))}
          </div>
          {activo && <EditorHorario medicoId={activo} />}
        </div>
      </div>
    </>
  );
}
