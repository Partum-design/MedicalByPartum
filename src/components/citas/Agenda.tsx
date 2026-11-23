"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Video, Home } from "lucide-react";
import { useClinica } from "@/lib/store";
import { enZona, instante } from "@/lib/datos/disponibilidad";
import type { Cita, EventoGoogle, Medico } from "@/lib/datos/modelo";
import { Avatar, claveDia, diaCorto, diaLargo, EstadoChip, hora, moneda, PagoChip, Segmented, useToast } from "@/components/ui";
import { DetalleCita, NuevaCita } from "@/components/citas/CitaModales";

const H_INI = 7;
const H_FIN = 21;
const ALTO = 96; // px por hora

const sumarDias = (clave: string, n: number) => {
  const [a, m, d] = clave.split("-").map(Number);
  return claveDia(instante(a, m, d, 12 * 60) + n * 86_400_000);
};
const minutosDe = (iso: string) => enZona(new Date(iso).getTime()).minutos;

type Vista = "dia" | "semana" | "lista";

export function Agenda({ medicos, vistaInicial = "dia", soloLectura = false }: { medicos: Medico[]; vistaInicial?: Vista; soloLectura?: boolean }) {
  const c = useClinica();
  const toast = useToast();
  const [vista, setVista] = useState<Vista>(vistaInicial);
  const [dia, setDia] = useState(() => claveDia(Date.now()));
  const [abierta, setAbierta] = useState<Cita | null>(null);
  const [nueva, setNueva] = useState<{ medico_id?: string; fecha?: string; hora?: string } | null>(null);
  const [filtro, setFiltro] = useState<string>("todos");
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setAhora(Date.now()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const visibles = filtro === "todos" ? medicos : medicos.filter((m) => m.id === filtro);
  const ids = new Set(visibles.map((m) => m.id));
  const semana = useMemo(() => {
    const [a, m, d] = dia.split("-").map(Number);
    const z = enZona(instante(a, m, d, 12 * 60));
    const idx = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"].indexOf(z.diaSemana);
    return Array.from({ length: 6 }, (_, i) => sumarDias(dia, i - idx));
  }, [dia]);

  const citasDe = (clave: string, medicoId?: string) =>
    c.citas.filter((x) => claveDia(x.inicio) === clave && (medicoId ? x.medico_id === medicoId : ids.has(x.medico_id)) && x.estado !== "cancelada");
  const eventosDe = (clave: string, medicoId: string) =>
    c.eventosGoogle.filter((e) => e.origen === "personal" && e.medico_id === medicoId && claveDia(e.inicio) === clave);

  const columnas: { id: string; titulo: React.ReactNode; clave: string; medico: Medico }[] =
    vista === "semana"
      ? semana.map((k) => ({ id: k, clave: k, medico: visibles[0], titulo: <span style={{ textTransform: "capitalize" }}>{diaCorto(instante(+k.slice(0, 4), +k.slice(5, 7), +k.slice(8), 720))}</span> }))
      : visibles.map((m) => ({
          id: m.id,
          clave: dia,
          medico: m,
          titulo: (
            <span className="flex items-center gap-2">
              <Avatar nombre={m.nombre} color={m.color} size="is-sm" />
              <span style={{ textAlign: "left", lineHeight: 1.2 }}>
                <b style={{ fontWeight: 600, fontSize: 13 }}>{m.nombre}</b>
                <br />
                <span style={{ fontSize: 11.5, color: "var(--muted)" }}>{citasDe(dia, m.id).length} citas</span>
              </span>
            </span>
          ),
        }));

  const hoyClave = claveDia(ahora);
  const minAhora = enZona(ahora).minutos;
  const lista = useMemo(
    () =>
      c.citas
        .filter((x) => ids.has(x.medico_id) && (vista !== "lista" || semana.includes(claveDia(x.inicio))))
        .sort((a, b) => a.inicio.localeCompare(b.inicio)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [c.citas, filtro, semana, vista, medicos]
  );

  const mover = (n: number) => setDia((d) => sumarDias(d, vista === "dia" ? n : n * 7));

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div className="flex flex-wrap items-center gap-2" style={{ padding: 16, borderBottom: "1px solid var(--line-2)" }}>
        <div className="flex items-center gap-1">
          <button type="button" className="btn btn-ghost btn-icon" onClick={() => mover(-1)} aria-label="Anterior">
            <ChevronLeft size={18} />
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDia(claveDia(Date.now()))}>
            Hoy
          </button>
          <button type="button" className="btn btn-ghost btn-icon" onClick={() => mover(1)} aria-label="Siguiente">
            <ChevronRight size={18} />
          </button>
        </div>
        <div style={{ fontWeight: 600, color: "var(--navy)", textTransform: "capitalize", fontSize: 16 }}>
          {vista === "dia" ? diaLargo(instante(+dia.slice(0, 4), +dia.slice(5, 7), +dia.slice(8), 720)) : `Semana del ${diaCorto(instante(+semana[0].slice(0, 4), +semana[0].slice(5, 7), +semana[0].slice(8), 720))}`}
        </div>
        <input type="date" className="input" style={{ width: 160, minHeight: 38 }} value={dia} onChange={(e) => e.target.value && setDia(e.target.value)} aria-label="Ir a fecha" />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {medicos.length > 1 && (
            <select className="input" style={{ width: "auto", minHeight: 38 }} value={filtro} onChange={(e) => { setFiltro(e.target.value); if (e.target.value === "todos" && vista === "semana") setVista("dia"); }}>
              <option value="todos">Todo el equipo</option>
              {medicos.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          )}
          <Segmented
            valor={vista}
            onChange={(v) => { if (v === "semana" && visibles.length > 1) setFiltro(medicos[0].id); setVista(v); }}
            opciones={[{ id: "dia", label: "Día" }, { id: "semana", label: "Semana" }, { id: "lista", label: "Lista" }]}
          />
          {!soloLectura && (
            <button type="button" className="btn btn-grad btn-sm" onClick={() => setNueva({ fecha: dia, medico_id: filtro !== "todos" ? filtro : undefined })}>
              <Plus /> Nueva cita
            </button>
          )}
        </div>
      </div>

      {vista !== "lista" ? (
        <div className="table-wrap">
          <div style={{ display: "grid", gridTemplateColumns: `56px repeat(${columnas.length}, minmax(160px, 1fr))`, minWidth: 56 + columnas.length * 160 }}>
            <div style={{ position: "sticky", top: 0, background: "#fff", zIndex: 4, borderBottom: "1px solid var(--line-2)" }} />
            {columnas.map((col) => (
              <div key={col.id} style={{ padding: "12px 10px", borderBottom: "1px solid var(--line-2)", borderLeft: "1px solid var(--line-2)", background: col.clave === hoyClave && vista === "semana" ? "var(--teal-50)" : "#fff", color: "var(--navy)", fontSize: 13.5, fontWeight: 500 }}>
                {col.titulo}
              </div>
            ))}
            <div>
              {Array.from({ length: H_FIN - H_INI }, (_, i) => (
                <div key={i} className="agenda-hora">{String(H_INI + i).padStart(2, "0")}:00</div>
              ))}
            </div>
            {columnas.map((col) => {
              const horario = c.horarioDeMedico(col.medico.id);
              const z = enZona(instante(+col.clave.slice(0, 4), +col.clave.slice(5, 7), +col.clave.slice(8), 720));
              const b = horario[z.diaSemana];
              const [ha, ma] = b.inicio.split(":").map(Number);
              const [hb, mb] = b.fin.split(":").map(Number);
              return (
                <div
                  key={col.id}
                  className="agenda-col"
                  style={{ height: (H_FIN - H_INI) * ALTO, background: b.activo ? undefined : "repeating-linear-gradient(135deg, #f7fafb 0 8px, #f1f5f7 8px 16px)" }}
                  onDoubleClick={(e) => {
                    if (soloLectura) return;
                    const y = e.clientY - (e.currentTarget as HTMLElement).getBoundingClientRect().top;
                    const min = Math.floor(((y / ALTO) * 60) / 15) * 15 + H_INI * 60;
                    setNueva({ medico_id: col.medico.id, fecha: col.clave, hora: `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}` });
                  }}
                >
                  {Array.from({ length: H_FIN - H_INI }, (_, i) => <div key={i} className="agenda-linea" />)}
                  {b.activo && (
                    <div style={{ position: "absolute", left: 0, right: 0, top: ((ha * 60 + ma - H_INI * 60) / 60) * ALTO, height: (((hb * 60 + mb) - (ha * 60 + ma)) / 60) * ALTO, background: `color-mix(in srgb, ${col.medico.color} 4%, transparent)`, pointerEvents: "none" }} />
                  )}
                  {eventosDe(col.clave, col.medico.id).map((e: EventoGoogle) => (
                    <div key={e.id} className="agenda-cita" style={{ top: ((minutosDe(e.inicio) - H_INI * 60) / 60) * ALTO, height: Math.max(26, ((new Date(e.fin).getTime() - new Date(e.inicio).getTime()) / 3_600_000) * ALTO - 3), background: "repeating-linear-gradient(135deg,#eef1f4 0 6px,#e6eaee 6px 12px)", color: "#5f6368", cursor: "default" }} title="Evento personal de Google Calendar">
                      <b style={{ fontWeight: 600 }}>{e.titulo}</b>
                      <div style={{ fontSize: 11 }}>Google Calendar · {hora(e.inicio)}</div>
                    </div>
                  ))}
                  {citasDe(col.clave, col.medico.id).map((x) => {
                    const top = ((minutosDe(x.inicio) - H_INI * 60) / 60) * ALTO;
                    const alto = Math.max(20, ((new Date(x.fin).getTime() - new Date(x.inicio).getTime()) / 3_600_000) * ALTO - 3);
                    const color = x.estado === "asistida" ? "#18a874" : x.estado === "no_asistio" ? "#f2a33a" : col.medico.color;
                    return (
                      <button
                        key={x.id}
                        type="button"
                        className="agenda-cita"
                        style={{ top, height: alto, color, background: `color-mix(in srgb, ${color} 11%, #fff)` }}
                        onClick={() => setAbierta(x)}
                      >
                        <b style={{ fontWeight: 600, color: "var(--navy)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: alto < 30 ? 11 : 12 }} className="flex items-center gap-1">
                          {x.modalidad === "telemedicina" && <Video size={11} />}
                          {x.modalidad === "domicilio" && <Home size={11} />}
                          {hora(x.inicio)} · {x.paciente_nombre}
                        </b>
                        {alto > 40 && <div style={{ color: "var(--muted)", fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.servicio_nombre}</div>}
                      </button>
                    );
                  })}
                  {col.clave === hoyClave && minAhora > H_INI * 60 && minAhora < H_FIN * 60 && (
                    <div className="agenda-ahora" style={{ top: ((minAhora - H_INI * 60) / 60) * ALTO }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Paciente</th>
                <th>Servicio</th>
                <th>Especialista</th>
                <th>Estado</th>
                <th>Pago</th>
                <th style={{ textAlign: "right" }}>Precio</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((x) => (
                <tr key={x.id} onClick={() => setAbierta(x)} style={{ cursor: "pointer" }}>
                  <td className="tnum" style={{ whiteSpace: "nowrap" }}>
                    <b style={{ fontWeight: 500, textTransform: "capitalize" }}>{diaCorto(x.inicio)}</b> <span style={{ color: "var(--muted)" }}>{hora(x.inicio)}</span>
                  </td>
                  <td style={{ fontWeight: 500, color: "var(--navy)" }}>{x.paciente_nombre}</td>
                  <td>{x.servicio_nombre}</td>
                  <td>{x.medico_nombre}</td>
                  <td><EstadoChip estado={x.estado} /></td>
                  <td><PagoChip cita={x} /></td>
                  <td className="tnum" style={{ textAlign: "right" }}>{moneda.format(x.precio)}</td>
                </tr>
              ))}
              {lista.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: 30 }}>Sin citas esta semana.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {!soloLectura && vista !== "lista" && (
        <p style={{ padding: "10px 16px", fontSize: 12.5, color: "var(--soft)", borderTop: "1px solid var(--line-2)" }}>
          Doble clic en un hueco para agendar ahí · Las franjas grises son eventos personales de Google Calendar y bloquean la reserva en línea.
        </p>
      )}
      {abierta && <DetalleCita cita={abierta} onClose={() => setAbierta(null)} onToast={toast.mostrar} />}
      {nueva && <NuevaCita abierto onClose={() => setNueva(null)} inicial={nueva} onCreada={() => toast.mostrar("Cita agendada")} />}
      {toast.nodo}
    </div>
  );
}
