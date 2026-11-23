"use client";

import { useState } from "react";
import { Check, Clock3, Pencil, Plus, Trash2 } from "lucide-react";
import { useClinica } from "@/lib/store";
import { CATEGORIAS_SERVICIO, type Servicio } from "@/lib/datos/modelo";
import { Avatar, Modal, moneda, PageHead, Segmented, Switch, useToast } from "@/components/ui";

type Form = Omit<Servicio, "id" | "activo">;
const VACIO: Form = { nombre: "", categoria: "Consulta", descripcion: "", precio: 500, duracion_min: 30, comision_pct: 40, medicos: [] };

export default function Servicios() {
  const c = useClinica();
  const toast = useToast();
  const [cat, setCat] = useState<string>("todas");
  const [edit, setEdit] = useState<Servicio | "nuevo" | null>(null);
  const [f, setF] = useState<Form>(VACIO);
  const lista = c.servicios.filter((s) => cat === "todas" || s.categoria === cat);
  const abrir = (s: Servicio | "nuevo") => {
    setEdit(s);
    setF(s === "nuevo" ? VACIO : { nombre: s.nombre, categoria: s.categoria, descripcion: s.descripcion ?? "", precio: s.precio, duracion_min: s.duracion_min, comision_pct: s.comision_pct, medicos: s.medicos ?? [], desde: s.desde });
  };
  const guardar = () => {
    if (!f.nombre.trim()) return alert("El servicio necesita nombre.");
    if (edit === "nuevo") c.agregarServicio(f) && toast.mostrar("Servicio agregado");
    else if (edit) c.actualizarServicio(edit.id, f).ok && toast.mostrar("Servicio actualizado");
    setEdit(null);
  };
  return (
    <>
      <PageHead titulo="Servicios" sub="Catálogo que ven los pacientes al reservar: precio, duración y quién lo ofrece.">
        <button type="button" className="btn btn-grad btn-sm" onClick={() => abrir("nuevo")}><Plus /> Nuevo servicio</button>
      </PageHead>
      <div style={{ marginBottom: 16, overflowX: "auto" }}>
        <Segmented valor={cat} onChange={setCat} opciones={[{ id: "todas", label: "Todas" }, ...CATEGORIAS_SERVICIO.map((k) => ({ id: k, label: `${k} (${c.servicios.filter((s) => s.categoria === k).length})` }))]} />
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Servicio</th><th>Categoría</th><th>Duración</th><th>Lo ofrecen</th><th style={{ textAlign: "right" }}>Precio</th><th>Comisión</th><th>En línea</th><th></th></tr></thead>
            <tbody>
              {lista.map((s) => (
                <tr key={s.id} style={{ opacity: s.activo ? 1 : 0.55 }}>
                  <td><div style={{ fontWeight: 500, color: "var(--navy)" }}>{s.nombre}</div><div style={{ fontSize: 12.5, color: "var(--muted)", maxWidth: 360 }}>{s.descripcion}</div></td>
                  <td><span className="chip chip-teal">{s.categoria}</span></td>
                  <td style={{ whiteSpace: "nowrap" }}><Clock3 size={13} style={{ display: "inline", marginRight: 4, color: "var(--soft)" }} />{s.duracion_min} min</td>
                  <td>
                    <div className="flex" style={{ gap: 0 }}>
                      {(s.medicos?.length ? c.medicos.filter((m) => s.medicos!.includes(m.id)) : c.medicos).slice(0, 4).map((m, i) => (
                        <span key={m.id} title={m.nombre} style={{ marginLeft: i ? -8 : 0, boxShadow: "0 0 0 2px #fff", borderRadius: 99 }}><Avatar nombre={m.nombre} color={m.color} size="is-sm" /></span>
                      ))}
                    </div>
                  </td>
                  <td className="tnum" style={{ textAlign: "right", fontWeight: 600 }}>{moneda.format(s.precio)}</td>
                  <td className="tnum">{s.comision_pct} %</td>
                  <td><Switch valor={s.activo} etiqueta="Activo" onChange={(v) => c.actualizarServicio(s.id, { activo: v })} /></td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button type="button" className="btn btn-ghost btn-icon" aria-label="Editar" onClick={() => abrir(s)}><Pencil size={15} /></button>
                    <button type="button" className="btn btn-ghost btn-icon" aria-label="Eliminar" onClick={() => confirm(`¿Eliminar «${s.nombre}»?`) && c.eliminarServicio(s.id)}><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal abierto={!!edit} onClose={() => setEdit(null)} titulo={edit === "nuevo" ? "Nuevo servicio" : "Editar servicio"} pie={<><button type="button" className="btn btn-ghost" onClick={() => setEdit(null)}>Cancelar</button><button type="button" className="btn btn-grad" onClick={guardar}><Check /> Guardar</button></>}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="field sm:col-span-2"><span>Nombre</span><input className="input" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} placeholder="Ej. Revisión pediátrica" /></label>
          <label className="field"><span>Categoría</span><select className="input" value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value as Form["categoria"] })}>{CATEGORIAS_SERVICIO.map((k) => <option key={k}>{k}</option>)}</select></label>
          <label className="field"><span>Duración (min)</span><input className="input" type="number" value={f.duracion_min} onChange={(e) => setF({ ...f, duracion_min: Number(e.target.value) })} /></label>
          <label className="field"><span>Precio (MXN)</span><input className="input" type="number" value={f.precio} onChange={(e) => setF({ ...f, precio: Number(e.target.value) })} /></label>
          <label className="field"><span>Comisión del médico (%)</span><input className="input" type="number" value={f.comision_pct} onChange={(e) => setF({ ...f, comision_pct: Number(e.target.value) })} /></label>
          <label className="field sm:col-span-2"><span>Descripción</span><textarea className="input" value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} /></label>
          <div className="sm:col-span-2">
            <div className="label" style={{ marginBottom: 8 }}>¿Quién lo ofrece? (ninguno marcado = todos)</div>
            <div className="flex flex-wrap gap-2">
              {c.medicos.map((m) => {
                const on = f.medicos?.includes(m.id);
                return (
                  <button key={m.id} type="button" className="chip" style={{ height: 34, cursor: "pointer", border: `1px solid ${on ? "var(--teal)" : "var(--line)"}`, background: on ? "var(--teal-50)" : "#fff" }} onClick={() => setF({ ...f, medicos: on ? f.medicos!.filter((x) => x !== m.id) : [...(f.medicos ?? []), m.id] })}>
                    {on && <Check />} {m.nombre}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
      {toast.nodo}
    </>
  );
}
