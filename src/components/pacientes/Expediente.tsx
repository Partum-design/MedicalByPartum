"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, ArrowLeft, CalendarPlus, Check, Droplet, FilePlus2, Phone, Printer, Syringe, Trash2, UserRound } from "lucide-react";
import { useClinica } from "@/lib/store";
import { ESQUEMA_VACUNACION, resumirPacientes, type Ficha, type SignosVitales } from "@/lib/datos/modelo";
import { Avatar, diaCorto, edad, EstadoChip, fecha, hora, moneda, Segmented, useToast, Vacio } from "@/components/ui";
import { NuevaCita } from "@/components/citas/CitaModales";

type Tab = "consultas" | "nota" | "vacunas" | "citas" | "datos";

export function Expediente({ pacienteId, citaId, onVolver }: { pacienteId: string; citaId?: string | null; onVolver?: () => void }) {
  const c = useClinica();
  const toast = useToast();
  const p = c.pacientes.find((x) => x.id === pacienteId);
  const [tab, setTab] = useState<Tab>(citaId ? "nota" : "consultas");
  const [agendar, setAgendar] = useState(false);
  const notas = c.fichas.filter((f) => f.paciente_id === pacienteId).sort((a, b) => b.creado_en.localeCompare(a.creado_en));
  const vacunas = c.vacunas.filter((v) => v.paciente_id === pacienteId);
  const citas = c.citas.filter((x) => x.paciente_id === pacienteId).sort((a, b) => b.inicio.localeCompare(a.inicio));
  const resumen = useMemo(() => resumirPacientes(c.citas).find((r) => r.id === pacienteId), [c.citas, pacienteId]);

  if (!p) return <Vacio icono={<UserRound />} titulo="Paciente no encontrado" />;
  const meses = p.fecha_nacimiento ? (Date.now() - new Date(p.fecha_nacimiento).getTime()) / (30.44 * 86_400_000) : 999;
  const pediatrico = meses < 15 * 12;
  const alergia = p.alergias && p.alergias !== "Ninguna conocida" ? p.alergias : null;

  return (
    <div className="anim-in">
      {onVolver && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={onVolver} style={{ marginBottom: 14 }}>
          <ArrowLeft /> Todos los pacientes
        </button>
      )}
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="band" style={{ borderRadius: 0, padding: "26px 24px" }}>
          <div className="flex flex-wrap items-center gap-4">
            <Avatar nombre={p.nombre} size="is-xl" color="#0b6f75" />
            <div style={{ flex: 1, minWidth: 220 }}>
              <h1 style={{ fontSize: 26 }}>{p.nombre}</h1>
              <div style={{ opacity: 0.88, marginTop: 4, fontSize: 14.5 }}>
                {[edad(p.fecha_nacimiento), p.sexo === "F" ? "Femenino" : p.sexo === "M" ? "Masculino" : "", p.fecha_nacimiento && `Nac. ${fecha(p.fecha_nacimiento + "T12:00:00")}`].filter(Boolean).join(" · ")}
              </div>
              <div className="flex flex-wrap gap-2" style={{ marginTop: 10 }}>
                {p.tipo_sangre && <span className="chip" style={{ background: "rgba(255,255,255,.18)", color: "#fff" }}><Droplet /> {p.tipo_sangre}</span>}
                {p.telefono && <span className="chip" style={{ background: "rgba(255,255,255,.18)", color: "#fff" }}><Phone /> {p.telefono}</span>}
                {p.tutor && <span className="chip" style={{ background: "rgba(255,255,255,.18)", color: "#fff" }}><UserRound /> {p.tutor}</span>}
                {alergia && <span className="chip" style={{ background: "#fff", color: "#c02842" }}><AlertTriangle /> Alergia: {alergia}</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn btn-white btn-sm" onClick={() => setAgendar(true)}><CalendarPlus /> Agendar</button>
              <button type="button" className="btn btn-outline-white btn-sm" onClick={() => setTab("nota")}><FilePlus2 /> Nueva nota</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" style={{ marginTop: 20 }}>
            {[
              ["Consultas", resumen?.visitas ?? 0],
              ["Última visita", resumen?.ultimaVisita ? diaCorto(resumen.ultimaVisita) : "—"],
              ["Próxima cita", resumen?.proximaCita ? diaCorto(resumen.proximaCita) : "—"],
              ["Vacunas aplicadas", vacunas.length],
            ].map(([k, v]) => (
              <div key={k} style={{ background: "rgba(255,255,255,.14)", borderRadius: 16, padding: "10px 14px" }}>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{k}</div>
                <div style={{ fontSize: 18, fontWeight: 600, textTransform: "capitalize" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line-2)", overflowX: "auto" }}>
          <Segmented
            valor={tab}
            onChange={setTab}
            opciones={[
              { id: "consultas", label: `Consultas (${notas.length})` },
              { id: "nota", label: "Nueva nota" },
              { id: "vacunas", label: "Vacunación" },
              { id: "citas", label: `Citas (${citas.length})` },
              { id: "datos", label: "Datos" },
            ]}
          />
        </div>
        <div style={{ padding: 20 }}>
          {tab === "consultas" && <Consultas notas={notas} pediatrico={pediatrico} />}
          {tab === "nota" && <NuevaNota pacienteId={p.id} pacienteNombre={p.nombre} citaId={citaId} pediatrico={pediatrico} onGuardada={() => { toast.mostrar("Nota guardada en el expediente"); setTab("consultas"); }} />}
          {tab === "vacunas" && <Cartilla pacienteId={p.id} meses={meses} onToast={toast.mostrar} />}
          {tab === "citas" && (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Fecha</th><th>Servicio</th><th>Especialista</th><th>Estado</th><th style={{ textAlign: "right" }}>Precio</th></tr></thead>
                <tbody>
                  {citas.map((x) => (
                    <tr key={x.id}>
                      <td style={{ textTransform: "capitalize", whiteSpace: "nowrap" }}>{diaCorto(x.inicio)} · {hora(x.inicio)}</td>
                      <td>{x.servicio_nombre}</td>
                      <td>{x.medico_nombre}</td>
                      <td><EstadoChip estado={x.estado} /></td>
                      <td className="tnum" style={{ textAlign: "right" }}>{moneda.format(x.precio)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === "datos" && <DatosPaciente pacienteId={p.id} onToast={toast.mostrar} />}
        </div>
      </div>
      {agendar && <NuevaCita abierto onClose={() => setAgendar(false)} inicial={{ paciente_id: p.id }} onCreada={() => toast.mostrar("Cita agendada")} />}
      {toast.nodo}
    </div>
  );
}

function Consultas({ notas, pediatrico }: { notas: Ficha[]; pediatrico: boolean }) {
  const serie = notas
    .filter((n) => n.signos?.peso_kg)
    .map((n) => ({ fecha: diaCorto(n.creado_en), peso: n.signos!.peso_kg, talla: n.signos!.talla_cm }))
    .reverse();
  if (notas.length === 0) return <Vacio icono={<FilePlus2 />} titulo="Sin notas todavía">Registra la primera consulta en «Nueva nota».</Vacio>;
  return (
    <div className="grid gap-4">
      {serie.length > 1 && (
        <div className="card card-pad" style={{ background: "var(--bg-2)", border: "none" }}>
          <div className="card-title"><div><h3>{pediatrico ? "Curva de crecimiento" : "Evolución de peso"}</h3><p>Peso (kg){pediatrico ? " y talla (cm)" : ""} por consulta</p></div></div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={serie} margin={{ left: -18, right: 8 }}>
                <CartesianGrid vertical={false} stroke="#e2ebef" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "#8a9bab" }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="p" tick={{ fontSize: 11, fill: "#8a9bab" }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                {pediatrico && <YAxis yAxisId="t" orientation="right" tick={{ fontSize: 11, fill: "#8a9bab" }} tickLine={false} axisLine={false} domain={["auto", "auto"]} />}
                <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #e2ebef", fontSize: 13 }} />
                <Line yAxisId="p" type="monotone" dataKey="peso" name="Peso (kg)" stroke="#009D9D" strokeWidth={2.5} dot={{ r: 4 }} />
                {pediatrico && <Line yAxisId="t" type="monotone" dataKey="talla" name="Talla (cm)" stroke="#55D9A8" strokeWidth={2.5} dot={{ r: 4 }} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {notas.map((n) => (
        <article key={n.id} className="card card-pad">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div style={{ fontWeight: 600, color: "var(--navy)" }}>{n.servicio || "Consulta"}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", textTransform: "capitalize" }}>{diaCorto(n.creado_en)} · {hora(n.creado_en)} · {n.medico_nombre}</div>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => imprimirReceta(n)}><Printer /> Receta</button>
          </div>
          {n.signos && (
            <div className="flex flex-wrap gap-2" style={{ marginTop: 12 }}>
              {n.signos.peso_kg ? <span className="chip">Peso {n.signos.peso_kg} kg</span> : null}
              {n.signos.talla_cm ? <span className="chip">Talla {n.signos.talla_cm} cm</span> : null}
              {n.signos.temperatura_c ? <span className="chip">Temp. {n.signos.temperatura_c.toFixed(1)} °C</span> : null}
              {n.signos.presion ? <span className="chip">TA {n.signos.presion}</span> : null}
              {n.signos.frecuencia_cardiaca ? <span className="chip">FC {n.signos.frecuencia_cardiaca} lpm</span> : null}
              {n.signos.saturacion ? <span className="chip">SpO₂ {n.signos.saturacion}%</span> : null}
              {n.signos.perimetro_cefalico_cm ? <span className="chip">PC {n.signos.perimetro_cefalico_cm} cm</span> : null}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2" style={{ marginTop: 14, fontSize: 14 }}>
            {n.motivo && <div><div className="label">Motivo</div>{n.motivo}</div>}
            {n.diagnostico && <div><div className="label">Diagnóstico</div>{n.diagnostico}</div>}
            {n.tratamiento && <div><div className="label">Plan</div>{n.tratamiento}</div>}
            {n.receta && <div><div className="label">Receta</div>{n.receta}</div>}
            {n.notas && <div className="sm:col-span-2" style={{ color: "var(--muted)" }}><div className="label">Notas internas</div>{n.notas}</div>}
          </div>
        </article>
      ))}
    </div>
  );
}

function imprimirReceta(n: Ficha) {
  const w = window.open("", "_blank", "width=720,height=900");
  if (!w) return;
  w.document.write(`<html><head><title>Receta</title><style>body{font-family:system-ui,sans-serif;padding:40px;color:#0b1a38}h1{color:#009d9d;margin:0}hr{border:none;border-top:2px solid #04bfad;margin:18px 0}small{color:#5f7385}</style></head><body>
  <h1>Clínica Vitalia</h1><small>Medical OS · Receta médica</small><hr/>
  <p><b>Paciente:</b> ${n.paciente_nombre}<br/><b>Fecha:</b> ${new Date(n.creado_en).toLocaleDateString("es-MX")}<br/><b>Médico:</b> ${n.medico_nombre ?? ""}</p>
  <p><b>Diagnóstico:</b> ${n.diagnostico ?? ""}</p><p><b>Indicaciones:</b><br/>${(n.receta || n.tratamiento || "").replace(/\n/g, "<br/>")}</p>
  <br/><br/><p>_____________________________<br/>Firma</p><script>window.print()</script></body></html>`);
  w.document.close();
}

function NuevaNota({ pacienteId, pacienteNombre, citaId, pediatrico, onGuardada }: { pacienteId: string; pacienteNombre: string; citaId?: string | null; pediatrico: boolean; onGuardada: () => void }) {
  const c = useClinica();
  const cita = c.citas.find((x) => x.id === citaId);
  const medicoId = c.sesion?.rol === "medico" ? c.sesion.id : cita?.medico_id ?? c.medicos[0]?.id;
  const medico = c.medicos.find((m) => m.id === medicoId);
  const [n, setN] = useState({ motivo: cita?.motivo ?? "", exploracion: "", diagnostico: "", tratamiento: "", receta: "", notas: "" });
  const [s, setS] = useState<Record<keyof SignosVitales, string>>({ peso_kg: "", talla_cm: "", temperatura_c: "", presion: "", frecuencia_cardiaca: "", saturacion: "", perimetro_cefalico_cm: "" });
  const num = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));
  const guardar = () => {
    if (!n.diagnostico.trim() && !n.motivo.trim()) return alert("Escribe al menos el motivo o el diagnóstico.");
    const f = c.agregarFicha({
      paciente_id: pacienteId,
      paciente_nombre: pacienteNombre,
      medico_id: medicoId!,
      medico_nombre: medico?.nombre,
      cita_id: cita?.id ?? null,
      servicio: cita?.servicio_nombre ?? "Consulta",
      ...n,
      signos: { peso_kg: num(s.peso_kg), talla_cm: num(s.talla_cm), temperatura_c: num(s.temperatura_c), presion: s.presion, frecuencia_cardiaca: num(s.frecuencia_cardiaca), saturacion: num(s.saturacion), perimetro_cefalico_cm: num(s.perimetro_cefalico_cm) },
    });
    if (f) {
      if (cita && cita.estado === "confirmada") c.marcarAsistida(cita.id);
      onGuardada();
    }
  };
  const campo = (k: keyof SignosVitales, label: string, ph: string) => (
    <label className="field"><span>{label}</span><input className="input" inputMode="decimal" placeholder={ph} value={s[k]} onChange={(e) => setS({ ...s, [k]: e.target.value })} /></label>
  );
  return (
    <div className="grid gap-5">
      {cita && <span className="chip chip-teal" style={{ width: "fit-content" }}>Vinculada a la cita de {hora(cita.inicio)} · {cita.servicio_nombre}</span>}
      <div>
        <div className="label" style={{ marginBottom: 8 }}>Signos vitales</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {campo("peso_kg", "Peso (kg)", "12.4")}
          {campo("talla_cm", "Talla (cm)", "76")}
          {campo("temperatura_c", "Temperatura (°C)", "36.6")}
          {pediatrico ? campo("perimetro_cefalico_cm", "Perímetro cefálico", "46") : campo("presion", "Presión arterial", "120/80")}
          {campo("frecuencia_cardiaca", "Frec. cardiaca", "88")}
          {campo("saturacion", "Saturación O₂ (%)", "98")}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="field"><span>Motivo de consulta (S)</span><textarea className="input" value={n.motivo} onChange={(e) => setN({ ...n, motivo: e.target.value })} /></label>
        <label className="field"><span>Exploración física (O)</span><textarea className="input" value={n.exploracion} onChange={(e) => setN({ ...n, exploracion: e.target.value })} /></label>
        <label className="field"><span>Diagnóstico (A)</span><textarea className="input" value={n.diagnostico} onChange={(e) => setN({ ...n, diagnostico: e.target.value })} /></label>
        <label className="field"><span>Plan / tratamiento (P)</span><textarea className="input" value={n.tratamiento} onChange={(e) => setN({ ...n, tratamiento: e.target.value })} /></label>
        <label className="field"><span>Receta</span><textarea className="input" value={n.receta} onChange={(e) => setN({ ...n, receta: e.target.value })} placeholder="Medicamento, dosis, frecuencia y duración" /></label>
        <label className="field"><span>Notas internas (no las ve el paciente)</span><textarea className="input" value={n.notas} onChange={(e) => setN({ ...n, notas: e.target.value })} /></label>
      </div>
      <div className="flex justify-end">
        <button type="button" className="btn btn-grad btn-lg" onClick={guardar}><Check /> Guardar nota{cita?.estado === "confirmada" ? " y marcar atendida" : ""}</button>
      </div>
    </div>
  );
}

function Cartilla({ pacienteId, meses, onToast }: { pacienteId: string; meses: number; onToast: (m: string) => void }) {
  const c = useClinica();
  const aplicadas = c.vacunas.filter((v) => v.paciente_id === pacienteId);
  const staff = c.sesion?.rol !== "paciente";
  const [lote, setLote] = useState("");
  const yaTiene = (vac: string, dosis: string) => aplicadas.find((a) => a.vacuna === vac && a.dosis === dosis);
  const aplicar = (vac: string, dosis: string) => {
    const quien = c.sesion?.rol === "medico" ? c.sesion.nombre : "Enf. Valeria Méndez";
    if (c.agregarVacuna({ paciente_id: pacienteId, vacuna: vac, dosis, fecha: new Date().toISOString(), lote: lote || "S/L", aplicada_por: quien })) onToast(`${vac} (${dosis}) registrada`);
  };
  const corresponden = ESQUEMA_VACUNACION.filter((v) => v.meses <= Math.max(meses, 0) + 1);
  const completas = corresponden.filter((v) => yaTiene(v.vacuna, v.dosis)).length;
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div style={{ minWidth: 240, flex: 1 }}>
          <div className="flex justify-between" style={{ fontSize: 14, marginBottom: 6 }}>
            <span style={{ color: "var(--muted)" }}>Esquema para su edad</span>
            <b style={{ color: "var(--teal-700)" }}>{completas} de {corresponden.length}</b>
          </div>
          <div className="progress"><span style={{ width: `${corresponden.length ? (completas / corresponden.length) * 100 : 0}%` }} /></div>
        </div>
        {staff && <input className="input" style={{ width: 200 }} placeholder="Lote de la dosis" value={lote} onChange={(e) => setLote(e.target.value)} />}
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Edad</th><th>Vacuna</th><th>Dosis</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {ESQUEMA_VACUNACION.map((v) => {
              const a = yaTiene(v.vacuna, v.dosis);
              const toca = !a && v.meses <= meses + 1;
              return (
                <tr key={v.vacuna + v.dosis}>
                  <td style={{ whiteSpace: "nowrap", color: "var(--muted)" }}>{v.edad}</td>
                  <td style={{ fontWeight: 500, color: "var(--navy)" }}>{v.vacuna}</td>
                  <td>{v.dosis}</td>
                  <td>
                    {a ? <span className="chip chip-ok"><Check /> {fecha(a.fecha)} · lote {a.lote}</span> : toca ? <span className="chip chip-warn">Pendiente</span> : <span className="chip">Próxima</span>}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {staff && !a && <button type="button" className={`btn btn-sm ${toca ? "btn-soft" : "btn-ghost"}`} onClick={() => aplicar(v.vacuna, v.dosis)}><Syringe /> Aplicar</button>}
                    {staff && a && <button type="button" className="btn btn-ghost btn-icon" aria-label="Quitar" onClick={() => confirm("¿Quitar esta dosis de la cartilla?") && c.eliminarVacuna(a.id)}><Trash2 size={15} /></button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {aplicadas.filter((a) => !ESQUEMA_VACUNACION.some((v) => v.vacuna === a.vacuna && v.dosis === a.dosis)).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {aplicadas.filter((a) => !ESQUEMA_VACUNACION.some((v) => v.vacuna === a.vacuna && v.dosis === a.dosis)).map((a) => (
            <span key={a.id} className="chip chip-ok">{a.vacuna} · {fecha(a.fecha)}</span>
          ))}
        </div>
      )}
      {staff && (
        <button type="button" className="btn btn-ghost btn-sm" style={{ width: "fit-content" }} onClick={() => aplicar("Influenza", "Anual " + new Date().getFullYear())}>
          <Syringe /> Registrar influenza anual
        </button>
      )}
    </div>
  );
}

function DatosPaciente({ pacienteId, onToast }: { pacienteId: string; onToast: (m: string) => void }) {
  const c = useClinica();
  const p = c.pacientes.find((x) => x.id === pacienteId)!;
  const [d, setD] = useState({ nombre: p.nombre, telefono: p.telefono, email: p.email, fecha_nacimiento: p.fecha_nacimiento ?? "", sexo: p.sexo ?? "", tutor: p.tutor ?? "", alergias: p.alergias ?? "", tipo_sangre: p.tipo_sangre ?? "", antecedentes: p.antecedentes ?? "" });
  const puedeEditar = c.permisos.editar_pacientes;
  const set = (k: keyof typeof d) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setD({ ...d, [k]: e.target.value });
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="field"><span>Nombre</span><input className="input" value={d.nombre} onChange={set("nombre")} disabled={!puedeEditar} /></label>
      <label className="field"><span>Celular</span><input className="input" value={d.telefono} onChange={set("telefono")} disabled={!puedeEditar} /></label>
      <label className="field"><span>Correo</span><input className="input" value={d.email} onChange={set("email")} disabled={!puedeEditar} /></label>
      <label className="field"><span>Fecha de nacimiento</span><input type="date" className="input" value={d.fecha_nacimiento} onChange={set("fecha_nacimiento")} disabled={!puedeEditar} /></label>
      <label className="field"><span>Sexo</span><select className="input" value={d.sexo} onChange={set("sexo")} disabled={!puedeEditar}><option value="">—</option><option value="F">Femenino</option><option value="M">Masculino</option></select></label>
      <label className="field"><span>Tipo de sangre</span><input className="input" value={d.tipo_sangre} onChange={set("tipo_sangre")} disabled={!puedeEditar} /></label>
      <label className="field"><span>Tutor</span><input className="input" value={d.tutor} onChange={set("tutor")} disabled={!puedeEditar} /></label>
      <label className="field"><span>Alergias</span><input className="input" value={d.alergias} onChange={set("alergias")} disabled={!puedeEditar} /></label>
      <label className="field md:col-span-2"><span>Antecedentes</span><textarea className="input" value={d.antecedentes} onChange={set("antecedentes")} disabled={!puedeEditar} /></label>
      <div className="flex items-center justify-between md:col-span-2">
        <span style={{ fontSize: 13, color: "var(--soft)" }}>{puedeEditar ? "" : "Tu usuario no tiene permiso para editar datos; pídeselo al administrador."}</span>
        {puedeEditar && <button type="button" className="btn btn-primary" onClick={() => { if (c.actualizarPaciente(p.id, { ...d, sexo: d.sexo as "F" | "M" | "" }).ok) onToast("Datos actualizados"); }}><Check /> Guardar cambios</button>}
      </div>
    </div>
  );
}
