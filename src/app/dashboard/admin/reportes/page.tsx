"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download } from "lucide-react";
import { useClinica } from "@/lib/store";
import { enZona } from "@/lib/datos/disponibilidad";
import { resumirCitas, resumirMedicos } from "@/lib/datos/modelo";
import { Avatar, diaCorto, Kpi, moneda, PageHead, pct, Segmented } from "@/components/ui";

const COL = ["#009D9D", "#04BFAD", "#55D9A8", "#2C506D", "#7C5CFA", "#F08A4B", "#9fb0bd"];
const tip = { borderRadius: 14, border: "1px solid #e2ebef", fontSize: 13 };

export default function Reportes() {
  const c = useClinica();
  const [dias, setDias] = useState<"30" | "60">("60");
  const desde = Date.now() - Number(dias) * 86_400_000;
  const r = useMemo(() => {
    const citas = c.citas.filter((x) => new Date(x.inicio).getTime() >= desde && new Date(x.inicio).getTime() <= Date.now());
    const total = resumirCitas(citas);
    const semanas: { semana: string; Atendidas: number; Faltas: number; Canceladas: number }[] = [];
    for (let i = Math.floor(Number(dias) / 7) - 1; i >= 0; i--) {
      const a = Date.now() - (i + 1) * 7 * 86_400_000;
      const b = Date.now() - i * 7 * 86_400_000;
      const s = citas.filter((x) => { const t = new Date(x.inicio).getTime(); return t >= a && t < b; });
      semanas.push({ semana: diaCorto(a), Atendidas: s.filter((x) => x.estado === "asistida").length, Faltas: s.filter((x) => x.estado === "no_asistio").length, Canceladas: s.filter((x) => x.estado === "cancelada").length });
    }
    const porCat = new Map<string, number>();
    for (const x of citas) if (x.estado === "asistida") {
      const cat = c.servicios.find((s) => s.id === x.servicio_id)?.categoria ?? "Otros";
      porCat.set(cat, (porCat.get(cat) ?? 0) + x.precio);
    }
    const canal = [{ name: "En línea", value: citas.filter((x) => x.creada_por === "paciente").length }, { name: "Recepción", value: citas.filter((x) => x.creada_por !== "paciente").length }];
    const modalidad = ["presencial", "telemedicina", "domicilio"].map((m) => ({ name: m === "presencial" ? "Consultorio" : m === "telemedicina" ? "Telemedicina" : "Domicilio", value: citas.filter((x) => x.modalidad === m).length }));
    const calor: number[][] = Array.from({ length: 6 }, () => Array(13).fill(0));
    const idx = { lun: 0, mar: 1, mie: 2, jue: 3, vie: 4, sab: 5, dom: -1 } as const;
    for (const x of citas) {
      if (x.estado === "cancelada") continue;
      const z = enZona(new Date(x.inicio).getTime());
      const d = idx[z.diaSemana];
      const h = Math.floor(z.minutos / 60) - 8;
      if (d >= 0 && h >= 0 && h < 13) calor[d][h]++;
    }
    return { total, semanas, porCat: [...porCat.entries()].map(([name, value]) => ({ name, value })), canal, modalidad, calor, medicos: resumirMedicos(citas, c.medicos) };
  }, [c.citas, c.servicios, c.medicos, desde, dias]);
  const max = Math.max(1, ...r.calor.flat());

  const exportar = () => {
    const filas = [["Especialista", "Atendidas", "Faltas", "Asistencia", "Ingresos", "Honorarios"], ...r.medicos.map((m) => [m.nombre, m.atendidas, m.faltas, pct(m.asistencia), m.ingresos, m.comisiones])];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + filas.map((f) => f.join(",")).join("\n")], { type: "text/csv" }));
    a.download = "reporte-especialistas.csv";
    a.click();
  };

  return (
    <>
      <PageHead titulo="Reportes" sub="Cómo se mueve la clínica: demanda, asistencia, ingresos y horas pico.">
        <Segmented valor={dias} onChange={setDias} opciones={[{ id: "30", label: "30 días" }, { id: "60", label: "60 días" }]} />
        <button type="button" className="btn btn-ghost btn-sm" onClick={exportar}><Download /> CSV</button>
      </PageHead>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi destacado label="Ingresos" valor={moneda.format(r.total.ingresos)} nota={`${r.total.atendidas} consultas`} />
        <Kpi label="Ticket medio" valor={moneda.format(r.total.ticketMedio)} />
        <Kpi label="Asistencia" valor={pct(r.total.asistencia)} nota={`${r.total.faltas} faltas`} />
        <Kpi label="Pacientes atendidos" valor={r.total.pacientes} nota="únicos en el periodo" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]" style={{ marginTop: 16 }}>
        <div className="card card-pad anim-in">
          <div className="card-title"><div><h2>Citas por semana</h2><p>Atendidas, faltas y cancelaciones</p></div></div>
          <div style={{ height: 270 }}>
            <ResponsiveContainer>
              <BarChart data={r.semanas} margin={{ left: -20 }}>
                <CartesianGrid vertical={false} stroke="#eef3f5" />
                <XAxis dataKey="semana" tick={{ fontSize: 11, fill: "#8a9bab" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#8a9bab" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tip} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Atendidas" stackId="a" fill="#04BFAD" />
                <Bar dataKey="Faltas" stackId="a" fill="#F2A33A" />
                <Bar dataKey="Canceladas" stackId="a" fill="#E2445C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card card-pad anim-in">
          <div className="card-title"><div><h2>Ingresos por área</h2></div></div>
          <div style={{ height: 270 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={r.porCat} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3} stroke="none">
                  {r.porCat.map((_, i) => <Cell key={i} fill={COL[i % COL.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => moneda.format(Number(v))} contentStyle={tip} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]" style={{ marginTop: 16 }}>
        <div className="card card-pad anim-in">
          <div className="card-title"><div><h2>Horas pico</h2><p>Citas por día y hora</p></div></div>
          <div className="table-wrap">
            <div style={{ display: "grid", gridTemplateColumns: "40px repeat(13, minmax(30px,1fr))", gap: 4, minWidth: 480 }}>
              <span />
              {Array.from({ length: 13 }, (_, h) => <span key={h} style={{ fontSize: 10.5, color: "var(--soft)", textAlign: "center" }}>{h + 8}</span>)}
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d, i) => (
                <div key={d} style={{ display: "contents" }}>
                  <span style={{ fontSize: 12, color: "var(--muted)", alignSelf: "center" }}>{d}</span>
                  {r.calor[i].map((v, h) => (
                    <span key={h} title={`${v} citas`} style={{ height: 30, borderRadius: 8, background: v ? `color-mix(in srgb, #009D9D ${Math.round(12 + (v / max) * 88)}%, #fff)` : "var(--bg-2)" }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          {[["Canal de reserva", r.canal], ["Modalidad", r.modalidad]].map(([t, data]) => (
            <div key={t as string} className="card card-pad anim-in">
              <div className="card-title"><div><h3>{t as string}</h3></div></div>
              {(data as { name: string; value: number }[]).map((x, i) => {
                const tot = (data as { value: number }[]).reduce((a, y) => a + y.value, 0) || 1;
                return (
                  <div key={x.name} style={{ marginBottom: 10 }}>
                    <div className="flex justify-between" style={{ fontSize: 13.5, marginBottom: 4 }}><span>{x.name}</span><b style={{ fontWeight: 500 }}>{pct(x.value / tot)}</b></div>
                    <div className="progress"><span style={{ width: `${(x.value / tot) * 100}%`, background: COL[i] }} /></div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="card anim-in" style={{ marginTop: 16, overflow: "hidden" }}>
        <div className="card-title" style={{ padding: "20px 20px 0" }}><div><h2>Desempeño por especialista</h2></div></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Especialista</th><th>Atendidas</th><th>Faltas</th><th>Asistencia</th><th style={{ textAlign: "right" }}>Ingresos</th><th style={{ textAlign: "right" }}>Honorarios</th></tr></thead>
            <tbody>
              {r.medicos.map((m) => (
                <tr key={m.id}>
                  <td><span className="flex items-center gap-2"><Avatar nombre={m.nombre} size="is-sm" color={c.medicos.find((x) => x.id === m.id)?.color} />{m.nombre}</span></td>
                  <td className="tnum">{m.atendidas}</td>
                  <td className="tnum">{m.faltas}</td>
                  <td>{pct(m.asistencia)}</td>
                  <td className="tnum" style={{ textAlign: "right" }}>{moneda.format(m.ingresos)}</td>
                  <td className="tnum" style={{ textAlign: "right" }}>{moneda.format(m.comisiones)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
