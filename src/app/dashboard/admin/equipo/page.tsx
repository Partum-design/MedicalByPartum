"use client";

import { useMemo, useState } from "react";
import { Check, Pencil, Plus, Power, Trash2, Video, Home } from "lucide-react";
import { useClinica } from "@/lib/store";
import { ETIQUETAS_PERMISOS, permisosDe, resumirMedicos, type Medico, type PermisosMedico } from "@/lib/datos/modelo";
import { Avatar, Modal, moneda, PageHead, pct, Switch, useToast } from "@/components/ui";
import { LogoCalendar } from "@/components/marca/LogoGoogle";

const VACIO = { nombre: "", especialidad: "", cedula: "", color: "#04BFAD", experiencia: 1, duracion_cita_min: 30, acepta_domicilio: false, telemedicina: true, biografia: "" };

export default function Equipo() {
  const c = useClinica();
  const toast = useToast();
  const [editando, setEditando] = useState<Medico | "nuevo" | null>(null);
  const [d, setD] = useState<typeof VACIO>(VACIO);
  const [permisos, setPermisos] = useState<PermisosMedico | null>(null);
  const resumen = useMemo(() => new Map(resumirMedicos(c.citas.filter((x) => Date.now() - new Date(x.inicio).getTime() < 30 * 86_400_000 && new Date(x.inicio).getTime() <= Date.now()), c.medicos).map((r) => [r.id, r])), [c.citas, c.medicos]);

  const abrir = (m: Medico | "nuevo") => {
    setEditando(m);
    if (m === "nuevo") {
      setD(VACIO);
      setPermisos(null);
    } else {
      setD({ nombre: m.nombre, especialidad: m.especialidad, cedula: m.cedula, color: m.color, experiencia: m.experiencia, duracion_cita_min: m.duracion_cita_min, acepta_domicilio: m.acepta_domicilio, telemedicina: m.telemedicina, biografia: m.biografia });
      setPermisos(permisosDe(m));
    }
  };
  const guardar = () => {
    if (d.nombre.trim().length < 3 || !d.especialidad.trim()) return alert("Nombre y especialidad son obligatorios.");
    if (editando === "nuevo") {
      if (c.agregarMedico(d)) toast.mostrar(`${d.nombre} se unió al equipo`);
    } else if (editando) {
      if (c.actualizarMedico(editando.id, { ...d, permisos: permisos ?? undefined }).ok) toast.mostrar("Cambios guardados");
    }
    setEditando(null);
  };
  const grupos = [...new Set(ETIQUETAS_PERMISOS.map((p) => p.grupo))];

  return (
    <>
      <PageHead titulo="Equipo médico" sub={`${c.medicos.filter((m) => m.activo).length} activos · desempeño de los últimos 30 días`}>
        <button type="button" className="btn btn-grad btn-sm" onClick={() => abrir("nuevo")}><Plus /> Agregar especialista</button>
      </PageHead>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {c.medicos.map((m) => {
          const r = resumen.get(m.id);
          return (
            <div key={m.id} className="card anim-in" style={{ overflow: "hidden", opacity: m.activo ? 1 : 0.6 }}>
              <div style={{ height: 6, background: m.color }} />
              <div style={{ padding: 20 }}>
                <div className="flex items-start gap-3">
                  <Avatar nombre={m.nombre} color={m.color} size="is-lg" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: 16.5 }}>{m.nombre}</div>
                    <div style={{ color: "var(--teal-700)", fontSize: 14 }}>{m.especialidad}</div>
                    <div style={{ color: "var(--soft)", fontSize: 12.5 }}>Céd. {m.cedula} · {m.duracion_cita_min} min por cita</div>
                  </div>
                  {!m.activo && <span className="chip chip-warn">Inactivo</span>}
                </div>
                <div className="flex flex-wrap gap-2" style={{ marginTop: 12 }}>
                  {m.telemedicina && <span className="chip chip-violet"><Video /> Teleconsulta</span>}
                  {m.acepta_domicilio && <span className="chip"><Home /> Domicilio</span>}
                  <span className="chip" style={{ opacity: m.google ? 1 : 0.6 }}><LogoCalendar size={13} /> {m.google ? "Google conectado" : "Sin Google"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2" style={{ marginTop: 16 }}>
                  {[["Atendidas", r?.atendidas ?? 0], ["Asistencia", pct(r?.asistencia ?? 0)], ["Producción", moneda.format(r?.ingresos ?? 0)]].map(([k, v]) => (
                    <div key={k} style={{ background: "var(--bg-2)", borderRadius: 14, padding: "10px 12px" }}>
                      <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{k}</div>
                      <div className="tnum" style={{ fontWeight: 600, color: "var(--navy)" }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2" style={{ marginTop: 14 }}>
                  <button type="button" className="btn btn-soft btn-sm" style={{ flex: 1 }} onClick={() => abrir(m)}><Pencil /> Editar y permisos</button>
                  <button type="button" className="btn btn-ghost btn-icon" title={m.activo ? "Desactivar" : "Activar"} onClick={() => c.toggleActivoMedico(m.id)}><Power size={16} /></button>
                  <button type="button" className="btn btn-ghost btn-icon" title="Eliminar" onClick={() => confirm(`¿Eliminar a ${m.nombre}? Sus citas futuras se cancelarán.`) && c.eliminarMedico(m.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Modal abierto={!!editando} onClose={() => setEditando(null)} titulo={editando === "nuevo" ? "Nuevo especialista" : "Editar especialista"} grande pie={<><button type="button" className="btn btn-ghost" onClick={() => setEditando(null)}>Cancelar</button><button type="button" className="btn btn-grad" onClick={guardar}><Check /> Guardar</button></>}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="field"><span>Nombre</span><input className="input" value={d.nombre} onChange={(e) => setD({ ...d, nombre: e.target.value })} placeholder="Dra. Nombre Apellido" /></label>
          <label className="field"><span>Especialidad</span><input className="input" value={d.especialidad} onChange={(e) => setD({ ...d, especialidad: e.target.value })} /></label>
          <label className="field"><span>Cédula profesional</span><input className="input" value={d.cedula} onChange={(e) => setD({ ...d, cedula: e.target.value })} /></label>
          <label className="field"><span>Duración base de cita (min)</span><input className="input" type="number" value={d.duracion_cita_min} onChange={(e) => setD({ ...d, duracion_cita_min: Number(e.target.value) })} /></label>
          <label className="field"><span>Años de experiencia</span><input className="input" type="number" value={d.experiencia} onChange={(e) => setD({ ...d, experiencia: Number(e.target.value) })} /></label>
          <label className="field"><span>Color</span><input className="input" type="color" style={{ padding: 4 }} value={d.color} onChange={(e) => setD({ ...d, color: e.target.value })} /></label>
          <div className="flex items-center justify-between" style={{ padding: 12, borderRadius: 14, background: "var(--bg-2)" }}><span>Teleconsulta</span><Switch valor={d.telemedicina} etiqueta="Teleconsulta" onChange={(v) => setD({ ...d, telemedicina: v })} /></div>
          <div className="flex items-center justify-between" style={{ padding: 12, borderRadius: 14, background: "var(--bg-2)" }}><span>Domicilio</span><Switch valor={d.acepta_domicilio} etiqueta="Domicilio" onChange={(v) => setD({ ...d, acepta_domicilio: v })} /></div>
          <label className="field sm:col-span-2"><span>Biografía</span><textarea className="input" value={d.biografia} onChange={(e) => setD({ ...d, biografia: e.target.value })} /></label>
        </div>
        {permisos && (
          <div style={{ marginTop: 22 }}>
            <h3 style={{ fontSize: 16 }}>Permisos</h3>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>Lo que este usuario puede hacer en su panel.</p>
            {grupos.map((g) => (
              <div key={g} style={{ marginTop: 10 }}>
                <div className="app-nav-grupo" style={{ padding: "6px 0" }}>{g}</div>
                {ETIQUETAS_PERMISOS.filter((p) => p.grupo === g).map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3" style={{ padding: "8px 0", borderBottom: "1px solid var(--line-2)" }}>
                    <div><div style={{ fontWeight: 500, fontSize: 14, color: "var(--navy)" }}>{p.label}</div><div style={{ fontSize: 12.5, color: "var(--muted)" }}>{p.ayuda}</div></div>
                    <Switch valor={permisos[p.id]} etiqueta={p.label} onChange={(v) => setPermisos({ ...permisos, [p.id]: v })} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </Modal>
      {toast.nodo}
    </>
  );
}
