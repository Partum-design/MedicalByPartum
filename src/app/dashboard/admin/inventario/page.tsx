"use client";

import { useState } from "react";
import { AlertTriangle, Boxes, CalendarX2, Check, Minus, Pencil, Plus, Syringe, Trash2 } from "lucide-react";
import { useClinica } from "@/lib/store";
import { CATEGORIAS_PRODUCTO, type Producto } from "@/lib/datos/modelo";
import { fecha, Kpi, Modal, moneda, PageHead, Segmented, useToast } from "@/components/ui";

type Form = Omit<Producto, "id">;
const VACIO: Form = { nombre: "", categoria: "Vacuna", existencias: 0, minimo: 5, costo: 0, precio_venta: 0, unidad: "dosis", lote: "", caducidad: "" };

export default function Inventario() {
  const c = useClinica();
  const toast = useToast();
  const [cat, setCat] = useState<string>("todas");
  const [edit, setEdit] = useState<Producto | "nuevo" | null>(null);
  const [f, setF] = useState<Form>(VACIO);
  const ahora = Date.now();
  const dias = (p: Producto) => (p.caducidad ? Math.round((new Date(p.caducidad).getTime() - ahora) / 86_400_000) : null);
  const lista = c.productos.filter((p) => cat === "todas" || (cat === "alertas" ? p.existencias <= p.minimo || (dias(p) ?? 999) < 45 : p.categoria === cat));
  const valor = c.productos.reduce((a, p) => a + p.existencias * p.costo, 0);
  const bajos = c.productos.filter((p) => p.existencias <= p.minimo).length;
  const caducan = c.productos.filter((p) => (dias(p) ?? 999) < 45).length;
  const abrir = (p: Producto | "nuevo") => { setEdit(p); setF(p === "nuevo" ? VACIO : { ...p }); };
  const guardar = () => {
    if (!f.nombre.trim()) return alert("Escribe el nombre.");
    if (edit === "nuevo") c.agregarProducto(f) && toast.mostrar("Producto agregado");
    else if (edit) c.actualizarProducto(edit.id, f).ok && toast.mostrar("Producto actualizado");
    setEdit(null);
  };
  return (
    <>
      <PageHead titulo="Inventario" sub="Vacunas con lote y caducidad, medicamentos y material. Al aplicar una vacuna se descuenta sola.">
        <button type="button" className="btn btn-grad btn-sm" onClick={() => abrir("nuevo")}><Plus /> Nuevo producto</button>
      </PageHead>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4" style={{ marginBottom: 16 }}>
        <Kpi destacado label="Valor del inventario" icono={<Boxes />} valor={moneda.format(valor)} nota="a costo de compra" />
        <Kpi label="Dosis de vacuna" icono={<Syringe />} valor={c.productos.filter((p) => p.categoria === "Vacuna").reduce((a, p) => a + p.existencias, 0)} nota={`${c.productos.filter((p) => p.categoria === "Vacuna").length} biológicos`} />
        <Kpi label="Bajo el mínimo" icono={<AlertTriangle />} valor={bajos} nota="por reabastecer" />
        <Kpi label="Caducan en 45 días" icono={<CalendarX2 />} valor={caducan} nota="úsalos primero" />
      </div>
      <div style={{ marginBottom: 14, overflowX: "auto" }}>
        <Segmented valor={cat} onChange={setCat} opciones={[{ id: "todas", label: "Todo" }, { id: "alertas", label: `Alertas (${c.productos.filter((p) => p.existencias <= p.minimo || (dias(p) ?? 999) < 45).length})` }, ...CATEGORIAS_PRODUCTO.map((k) => ({ id: k, label: k }))]} />
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Producto</th><th>Lote</th><th>Caducidad</th><th>Existencias</th><th style={{ textAlign: "right" }}>Costo</th><th style={{ textAlign: "right" }}>Venta</th><th></th></tr></thead>
            <tbody>
              {lista.map((p) => {
                const d = dias(p);
                const bajo = p.existencias <= p.minimo;
                return (
                  <tr key={p.id}>
                    <td><div style={{ fontWeight: 500, color: "var(--navy)" }}>{p.nombre}</div><span className="chip" style={{ height: 22, marginTop: 4 }}>{p.categoria}</span></td>
                    <td style={{ color: "var(--muted)" }}>{p.lote || "—"}</td>
                    <td>{p.caducidad ? <span className={`chip ${d! < 45 ? "chip-danger" : d! < 120 ? "chip-warn" : ""}`}>{fecha(p.caducidad + "T12:00:00")} · {d} d</span> : "—"}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button type="button" className="btn btn-ghost btn-icon" style={{ width: 30, minHeight: 30 }} aria-label="Restar" onClick={() => c.ajustarExistencias(p.id, -1)}><Minus size={14} /></button>
                        <b className="tnum" style={{ minWidth: 34, textAlign: "center", fontWeight: 600, color: bajo ? "var(--danger)" : "var(--navy)" }}>{p.existencias}</b>
                        <button type="button" className="btn btn-ghost btn-icon" style={{ width: 30, minHeight: 30 }} aria-label="Sumar" onClick={() => c.ajustarExistencias(p.id, 1)}><Plus size={14} /></button>
                        <span style={{ fontSize: 12, color: "var(--soft)" }}>{p.unidad} · mín. {p.minimo}</span>
                      </div>
                      <div className="progress" style={{ height: 5, marginTop: 6, maxWidth: 180 }}><span style={{ width: `${Math.min(100, (p.existencias / Math.max(1, p.minimo * 2)) * 100)}%`, background: bajo ? "var(--danger)" : undefined }} /></div>
                    </td>
                    <td className="tnum" style={{ textAlign: "right" }}>{moneda.format(p.costo)}</td>
                    <td className="tnum" style={{ textAlign: "right" }}>{p.precio_venta ? moneda.format(p.precio_venta) : "—"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <button type="button" className="btn btn-ghost btn-icon" aria-label="Editar" onClick={() => abrir(p)}><Pencil size={15} /></button>
                      <button type="button" className="btn btn-ghost btn-icon" aria-label="Eliminar" onClick={() => confirm(`¿Eliminar ${p.nombre}?`) && c.eliminarProducto(p.id)}><Trash2 size={15} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <Modal abierto={!!edit} onClose={() => setEdit(null)} titulo={edit === "nuevo" ? "Nuevo producto" : "Editar producto"} pie={<><button type="button" className="btn btn-ghost" onClick={() => setEdit(null)}>Cancelar</button><button type="button" className="btn btn-grad" onClick={guardar}><Check /> Guardar</button></>}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="field sm:col-span-2"><span>Nombre</span><input className="input" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></label>
          <label className="field"><span>Categoría</span><select className="input" value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value as Form["categoria"] })}>{CATEGORIAS_PRODUCTO.map((k) => <option key={k}>{k}</option>)}</select></label>
          <label className="field"><span>Unidad</span><input className="input" value={f.unidad} onChange={(e) => setF({ ...f, unidad: e.target.value })} /></label>
          <label className="field"><span>Existencias</span><input className="input" type="number" value={f.existencias} onChange={(e) => setF({ ...f, existencias: Number(e.target.value) })} /></label>
          <label className="field"><span>Mínimo</span><input className="input" type="number" value={f.minimo} onChange={(e) => setF({ ...f, minimo: Number(e.target.value) })} /></label>
          <label className="field"><span>Costo</span><input className="input" type="number" value={f.costo} onChange={(e) => setF({ ...f, costo: Number(e.target.value) })} /></label>
          <label className="field"><span>Precio de venta</span><input className="input" type="number" value={f.precio_venta} onChange={(e) => setF({ ...f, precio_venta: Number(e.target.value) })} /></label>
          <label className="field"><span>Lote</span><input className="input" value={f.lote} onChange={(e) => setF({ ...f, lote: e.target.value })} /></label>
          <label className="field"><span>Caducidad</span><input className="input" type="date" value={f.caducidad} onChange={(e) => setF({ ...f, caducidad: e.target.value })} /></label>
        </div>
      </Modal>
      {toast.nodo}
    </>
  );
}
