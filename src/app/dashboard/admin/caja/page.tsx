"use client";

import { useMemo, useState } from "react";
import { Banknote, CreditCard, Plus, Receipt, Trash2, TrendingDown, Wallet } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useClinica } from "@/lib/store";
import { CATEGORIAS_GASTO, type Gasto } from "@/lib/datos/modelo";
import { diaCorto, fecha, hora, Kpi, Modal, moneda, PageHead, Segmented, useToast } from "@/components/ui";

const COLORES = ["#009D9D", "#04BFAD", "#55D9A8", "#2C506D", "#7C5CFA", "#F08A4B", "#9fb0bd"];

export default function Caja() {
  const c = useClinica();
  const toast = useToast();
  const [periodo, setPeriodo] = useState<"7" | "30" | "90">("30");
  const [alta, setAlta] = useState(false);
  const [g, setG] = useState<{ concepto: string; categoria: Gasto["categoria"]; monto: number }>({ concepto: "", categoria: "Insumos médicos", monto: 0 });
  const desde = Date.now() - Number(periodo) * 86_400_000;
  const d = useMemo(() => {
    const cobradas = c.citas.filter((x) => x.estado_pago === "pagado" && x.estado !== "cancelada" && new Date(x.inicio).getTime() >= desde && new Date(x.inicio).getTime() <= Date.now());
    const porCobrar = c.citas.filter((x) => x.estado === "asistida" && x.estado_pago === "pendiente");
    const gastos = c.gastos.filter((x) => new Date(x.fecha).getTime() >= desde);
    const ingresos = cobradas.reduce((a, x) => a + x.precio, 0);
    const egresos = gastos.reduce((a, x) => a + x.monto, 0);
    const comisiones = Math.round(cobradas.reduce((a, x) => a + (x.precio * (x.comision_pct ?? 0)) / 100, 0));
    const efectivo = cobradas.filter((x) => x.metodo_pago === "efectivo").reduce((a, x) => a + x.precio, 0);
    const porCat = CATEGORIAS_GASTO.map((k) => ({ name: k, value: gastos.filter((x) => x.categoria === k).reduce((a, x) => a + x.monto, 0) })).filter((x) => x.value > 0);
    return { cobradas, porCobrar, gastos, ingresos, egresos, comisiones, efectivo, porCat };
  }, [c.citas, c.gastos, desde]);

  return (
    <>
      <PageHead titulo="Caja y finanzas" sub="Cobros de consultas, gastos de la clínica y utilidad.">
        <Segmented valor={periodo} onChange={setPeriodo} opciones={[{ id: "7", label: "7 días" }, { id: "30", label: "30 días" }, { id: "90", label: "90 días" }]} />
        <button type="button" className="btn btn-grad btn-sm" onClick={() => setAlta(true)}><Plus /> Registrar gasto</button>
      </PageHead>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Kpi destacado label="Cobrado" icono={<Wallet />} valor={moneda.format(d.ingresos)} nota={`${d.cobradas.length} consultas`} />
        <Kpi label="Gastos" icono={<TrendingDown />} valor={moneda.format(d.egresos)} nota={`${d.gastos.length} movimientos`} />
        <Kpi label="Utilidad estimada" icono={<Receipt />} valor={moneda.format(d.ingresos - d.egresos - d.comisiones)} nota={`después de ${moneda.format(d.comisiones)} en honorarios`} />
        <Kpi label="Por cobrar" icono={<Banknote />} valor={moneda.format(d.porCobrar.reduce((a, x) => a + x.precio, 0))} nota={`${d.porCobrar.length} consultas atendidas`} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]" style={{ marginTop: 16 }}>
        <div className="card anim-in" style={{ overflow: "hidden" }}>
          <div className="card-title" style={{ padding: "20px 20px 0" }}><div><h2>Por cobrar</h2><p>Consultas atendidas sin pago registrado</p></div></div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Fecha</th><th>Paciente</th><th>Servicio</th><th style={{ textAlign: "right" }}>Monto</th><th></th></tr></thead>
              <tbody>
                {d.porCobrar.slice(0, 12).map((x) => (
                  <tr key={x.id}>
                    <td style={{ textTransform: "capitalize", whiteSpace: "nowrap" }}>{diaCorto(x.inicio)} {hora(x.inicio)}</td>
                    <td style={{ fontWeight: 500, color: "var(--navy)" }}>{x.paciente_nombre}</td>
                    <td>{x.servicio_nombre}</td>
                    <td className="tnum" style={{ textAlign: "right" }}>{moneda.format(x.precio)}</td>
                    <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                      <button type="button" className="btn btn-soft btn-sm" onClick={() => c.cobrar(x.id, "efectivo").ok && toast.mostrar("Cobrado en efectivo")}><Banknote /> Efectivo</button>{" "}
                      <button type="button" className="btn btn-soft btn-sm" onClick={() => c.cobrar(x.id, "tarjeta").ok && toast.mostrar("Cobrado con tarjeta")}><CreditCard /> Tarjeta</button>
                    </td>
                  </tr>
                ))}
                {d.porCobrar.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: 24 }}>Todo cobrado 🎉</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-4" style={{ padding: 20, borderTop: "1px solid var(--line-2)", fontSize: 14 }}>
            <span className="chip chip-mint"><Banknote /> Efectivo {moneda.format(d.efectivo)}</span>
            <span className="chip chip-teal"><CreditCard /> Tarjeta {moneda.format(d.ingresos - d.efectivo)}</span>
          </div>
        </div>
        <div className="card card-pad anim-in">
          <div className="card-title"><div><h2>Gastos por categoría</h2><p>Últimos {periodo} días</p></div></div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={d.porCat} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
                  {d.porCat.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => moneda.format(Number(v))} contentStyle={{ borderRadius: 14, fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-1" style={{ marginTop: 8 }}>
            {d.porCat.map((x, i) => (
              <div key={x.name} className="flex items-center justify-between" style={{ fontSize: 13.5 }}>
                <span className="flex items-center gap-2"><span className="dot" style={{ color: COLORES[i % COLORES.length] }} />{x.name}</span>
                <b className="tnum" style={{ fontWeight: 500 }}>{moneda.format(x.value)}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card anim-in" style={{ marginTop: 16, overflow: "hidden" }}>
        <div className="card-title" style={{ padding: "20px 20px 0" }}><div><h2>Gastos</h2></div></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Fecha</th><th>Concepto</th><th>Categoría</th><th style={{ textAlign: "right" }}>Monto</th><th></th></tr></thead>
            <tbody>
              {d.gastos.map((x) => (
                <tr key={x.id}>
                  <td>{fecha(x.fecha)}</td>
                  <td style={{ fontWeight: 500, color: "var(--navy)" }}>{x.concepto}</td>
                  <td><span className="chip">{x.categoria}</span></td>
                  <td className="tnum" style={{ textAlign: "right" }}>{moneda.format(x.monto)}</td>
                  <td><button type="button" className="btn btn-ghost btn-icon" aria-label="Eliminar" onClick={() => confirm("¿Eliminar gasto?") && c.eliminarGasto(x.id)}><Trash2 size={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal abierto={alta} onClose={() => setAlta(false)} titulo="Registrar gasto" pie={<><button type="button" className="btn btn-ghost" onClick={() => setAlta(false)}>Cancelar</button><button type="button" className="btn btn-grad" onClick={() => { if (!g.concepto.trim() || g.monto <= 0) return alert("Concepto y monto son obligatorios."); c.agregarGasto(g); setAlta(false); setG({ ...g, concepto: "", monto: 0 }); toast.mostrar("Gasto registrado"); }}>Guardar</button></>}>
        <div className="grid gap-3">
          <label className="field"><span>Concepto</span><input className="input" value={g.concepto} onChange={(e) => setG({ ...g, concepto: e.target.value })} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="field"><span>Categoría</span><select className="input" value={g.categoria} onChange={(e) => setG({ ...g, categoria: e.target.value as Gasto["categoria"] })}>{CATEGORIAS_GASTO.map((k) => <option key={k}>{k}</option>)}</select></label>
            <label className="field"><span>Monto</span><input className="input" type="number" value={g.monto || ""} onChange={(e) => setG({ ...g, monto: Number(e.target.value) })} /></label>
          </div>
        </div>
      </Modal>
      {toast.nodo}
    </>
  );
}
