"use client";

import { DIAS_SEMANA } from "@/lib/datos/modelo";
import { useClinica } from "@/lib/store";
import { Switch } from "@/components/ui";

/** Horario semanal de un médico: un bloque por día que se enciende o apaga. */
export function EditorHorario({ medicoId }: { medicoId: string }) {
  const c = useClinica();
  const h = c.horarioDeMedico(medicoId);
  const horas = DIAS_SEMANA.reduce((a, d) => {
    const b = h[d.id];
    if (!b.activo) return a;
    const [x, y] = b.inicio.split(":").map(Number);
    const [z, w] = b.fin.split(":").map(Number);
    return a + Math.max(0, z * 60 + w - (x * 60 + y)) / 60;
  }, 0);
  return (
    <div className="grid gap-2">
      {DIAS_SEMANA.map((d) => {
        const b = h[d.id];
        const local = c.clinicaConfig.horario[d.id];
        return (
          <div key={d.id} className="flex flex-wrap items-center gap-3" style={{ padding: "10px 12px", borderRadius: 16, background: b.activo ? "var(--teal-50)" : "var(--bg-2)" }}>
            <Switch valor={b.activo} etiqueta={`Atiende ${d.label}`} onChange={(v) => c.guardarHorarioDia(medicoId, d.id, { activo: v })} />
            <b style={{ width: 92, fontWeight: 500, color: b.activo ? "var(--navy)" : "var(--soft)" }}>{d.label}</b>
            {b.activo ? (
              <div className="flex items-center gap-2">
                <input type="time" step={900} className="input" style={{ width: 120, minHeight: 40 }} value={b.inicio} onChange={(e) => c.guardarHorarioDia(medicoId, d.id, { inicio: e.target.value })} />
                <span style={{ color: "var(--muted)" }}>a</span>
                <input type="time" step={900} className="input" style={{ width: 120, minHeight: 40 }} value={b.fin} onChange={(e) => c.guardarHorarioDia(medicoId, d.id, { fin: e.target.value })} />
              </div>
            ) : (
              <span style={{ color: "var(--soft)", fontSize: 14 }}>No atiende</span>
            )}
            <span className="ml-auto" style={{ fontSize: 12, color: "var(--soft)" }}>{local.activo ? `Clínica ${local.inicio}–${local.fin}` : "Clínica cerrada"}</span>
          </div>
        );
      })}
      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>{horas.toFixed(1).replace(".0", "")} horas de consulta a la semana · La reserva en línea sólo ofrece horas dentro de este horario y del horario de la clínica.</p>
    </div>
  );
}
