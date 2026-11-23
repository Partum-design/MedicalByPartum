"use client";

import { FileHeart } from "lucide-react";
import { useClinica } from "@/lib/store";
import { diaLargo, hora, PageHead, Vacio } from "@/components/ui";

export default function MiExpediente() {
  const c = useClinica();
  const yo = c.pacientes.find((p) => p.id === c.sesion?.id);
  return (
    <>
      <PageHead titulo="Mi expediente" sub="Diagnósticos, signos vitales y recetas de cada consulta." />
      {yo && (
        <div className="card card-pad anim-in grid gap-3 sm:grid-cols-4" style={{ marginBottom: 16 }}>
          {[["Tipo de sangre", yo.tipo_sangre || "—"], ["Alergias", yo.alergias || "Ninguna registrada"], ["Nacimiento", yo.fecha_nacimiento || "—"], ["Antecedentes", yo.antecedentes || "—"]].map(([k, v]) => (
            <div key={k}><div className="label">{k}</div><div style={{ color: "var(--navy)", fontSize: 14.5 }}>{v}</div></div>
          ))}
        </div>
      )}
      {c.fichas.length === 0 && <div className="card"><Vacio icono={<FileHeart />} titulo="Aún no hay consultas registradas" /></div>}
      <div className="grid gap-3">
        {c.fichas.map((n) => (
          <article key={n.id} className="card card-pad anim-in">
            <div className="flex flex-wrap justify-between gap-2">
              <b style={{ fontWeight: 600, color: "var(--navy)" }}>{n.servicio}</b>
              <span style={{ fontSize: 13, color: "var(--muted)", textTransform: "capitalize" }}>{diaLargo(n.creado_en)} · {hora(n.creado_en)} · {n.medico_nombre}</span>
            </div>
            {n.signos && (
              <div className="flex flex-wrap gap-2" style={{ marginTop: 10 }}>
                {n.signos.peso_kg ? <span className="chip">Peso {n.signos.peso_kg} kg</span> : null}
                {n.signos.talla_cm ? <span className="chip">Talla {n.signos.talla_cm} cm</span> : null}
                {n.signos.temperatura_c ? <span className="chip">Temp. {n.signos.temperatura_c.toFixed(1)} °C</span> : null}
                {n.signos.presion ? <span className="chip">TA {n.signos.presion}</span> : null}
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-3" style={{ marginTop: 12, fontSize: 14 }}>
              <div><div className="label">Motivo</div>{n.motivo || "—"}</div>
              <div><div className="label">Diagnóstico</div>{n.diagnostico || "—"}</div>
              <div><div className="label">Indicaciones y receta</div>{[n.tratamiento, n.receta].filter(Boolean).join(" · ") || "—"}</div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
