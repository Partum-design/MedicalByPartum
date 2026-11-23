"use client";

import Link from "next/link";
import { CalendarPlus, Check, Syringe } from "lucide-react";
import { useClinica } from "@/lib/store";
import { ESQUEMA_VACUNACION } from "@/lib/datos/modelo";
import { edad, fecha, PageHead } from "@/components/ui";

export default function Vacunas() {
  const c = useClinica();
  const yo = c.pacientes.find((p) => p.id === c.sesion?.id);
  const meses = yo?.fecha_nacimiento ? (Date.now() - new Date(yo.fecha_nacimiento).getTime()) / (30.44 * 86_400_000) : 999;
  const tiene = (v: string, d: string) => c.vacunas.find((a) => a.vacuna === v && a.dosis === d);
  const pendientes = ESQUEMA_VACUNACION.filter((v) => v.meses <= meses + 1 && !tiene(v.vacuna, v.dosis));
  return (
    <>
      <PageHead titulo="Cartilla de vacunación" sub={yo ? `${yo.nombre} · ${edad(yo.fecha_nacimiento) || "edad sin registrar"}` : ""}>
        {pendientes.length > 0 && <Link href="/reservar?servicio=srv-vacuna-1anio" className="btn btn-grad btn-sm"><CalendarPlus /> Agendar vacuna</Link>}
      </PageHead>
      {pendientes.length > 0 && (
        <div className="card anim-in" style={{ padding: 18, marginBottom: 16, background: "var(--warn-50)", borderColor: "#f8dfb5" }}>
          <b style={{ fontWeight: 600, color: "#8a520c" }}>Le toca: </b>
          <span style={{ color: "#8a520c" }}>{pendientes.map((v) => `${v.vacuna} (${v.dosis})`).join(", ")}</span>
        </div>
      )}
      <div className="card card-pad anim-in">
        <div style={{ position: "relative", paddingLeft: 30 }}>
          <div style={{ position: "absolute", left: 10, top: 8, bottom: 8, width: 2, background: "var(--line)" }} />
          {ESQUEMA_VACUNACION.map((v) => {
            const a = tiene(v.vacuna, v.dosis);
            const toca = !a && v.meses <= meses + 1;
            return (
              <div key={v.vacuna + v.dosis} className="flex flex-wrap items-center gap-3" style={{ position: "relative", padding: "10px 0" }}>
                <span style={{ position: "absolute", left: -28, width: 20, height: 20, borderRadius: 20, display: "grid", placeItems: "center", background: a ? "var(--teal)" : toca ? "var(--warn)" : "#fff", border: a || toca ? "none" : "2px solid var(--line)", color: "#fff" }}>{a ? <Check size={12} /> : toca ? <Syringe size={11} /> : null}</span>
                <span style={{ width: 80, fontSize: 13, color: "var(--muted)" }}>{v.edad}</span>
                <b style={{ fontWeight: 500, color: "var(--navy)", flex: 1 }}>{v.vacuna} <span style={{ color: "var(--muted)", fontWeight: 400 }}>· {v.dosis}</span></b>
                {a ? <span className="chip chip-ok">{fecha(a.fecha)} · lote {a.lote}</span> : toca ? <span className="chip chip-warn">Pendiente</span> : <span className="chip">Próxima</span>}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
