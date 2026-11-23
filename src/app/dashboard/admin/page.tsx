"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, ArrowRight, CalendarDays, CalendarPlus, Clock3, PackageX, Percent, UserPlus, Wallet } from "lucide-react";
import { useClinica } from "@/lib/store";
import { resumirCitas, resumirMedicos } from "@/lib/datos/modelo";
import { Avatar, claveDia, diaCorto, EstadoChip, hora, Kpi, moneda, PageHead, pct } from "@/components/ui";

const DIA = 86_400_000;

export default function PanelAdmin() {
  const c = useClinica();
  const ahora = Date.now();

  const datos = useMemo(() => {
    const mes = c.citas.filter((x) => ahora - new Date(x.inicio).getTime() < 30 * DIA && new Date(x.inicio).getTime() <= ahora);
    const previo = c.citas.filter((x) => {
      const d = ahora - new Date(x.inicio).getTime();
      return d >= 30 * DIA && d < 60 * DIA;
    });
    const r = resumirCitas(mes);
    const rp = resumirCitas(previo);
    const hoy = c.citas.filter((x) => claveDia(x.inicio) === claveDia(ahora) && x.estado !== "cancelada").sort((a, b) => a.inicio.localeCompare(b.inicio));
    const nuevos = c.pacientes.filter((p) => ahora - new Date(p.creado_en).getTime() < 30 * DIA).length;
    const serie = Array.from({ length: 30 }, (_, i) => i).filter((i) => new Date(ahora - (29 - i) * DIA).getDay() !== 0).map((i) => {
      const k = claveDia(ahora - (29 - i) * DIA);
      const delDia = c.citas.filter((x) => claveDia(x.inicio) === k && x.estado === "asistida");
      return { dia: diaCorto(ahora - (29 - i) * DIA), ingresos: delDia.reduce((a, x) => a + x.precio, 0), citas: delDia.length };
    });
    const porMedico = resumirMedicos(mes, c.medicos).map((m) => ({ ...m, corto: m.nombre.replace(/^(Dra?|Enf)\.\s*/, "").split(" ")[0] }));
    const servicios = new Map<string, number>();
    for (const x of mes) if (x.estado === "asistida") servicios.set(x.servicio_nombre ?? "", (servicios.get(x.servicio_nombre ?? "") ?? 0) + 1);
    const top = [...servicios.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { r, rp, hoy, nuevos, serie, porMedico, top };
  }, [c.citas, c.pacientes, c.medicos, ahora]);

  const bajos = c.productos.filter((p) => p.existencias <= p.minimo);
  const caducan = c.productos.filter((p) => p.caducidad && new Date(p.caducidad).getTime() - ahora < 45 * DIA);
  const delta = (a: number, b: number) => (b > 0 ? (a - b) / b : null);
  const proximas = datos.hoy.filter((x) => new Date(x.fin).getTime() > ahora && x.estado === "confirmada");
  const saludo = new Date().getHours() < 12 ? "Buenos días" : new Date().getHours() < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <>
      <PageHead titulo={`${saludo} 👋`} sub={`Así va ${c.clinicaConfig.nombre} en los últimos 30 días.`}>
        <Link href="/dashboard/admin/citas" className="btn btn-ghost btn-sm">
          <CalendarDays /> Ver agenda
        </Link>
        <Link href="/dashboard/admin/citas" className="btn btn-grad btn-sm">
          <CalendarPlus /> Nueva cita
        </Link>
      </PageHead>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <div className="col-span-2 md:col-span-1"><Kpi destacado label="Ingresos del mes" icono={<Wallet />} valor={moneda.format(datos.r.ingresos)} delta={delta(datos.r.ingresos, datos.rp.ingresos)} nota="vs. 30 días previos" /></div>
        <Kpi label="Citas hoy" icono={<CalendarDays />} valor={datos.hoy.length} nota={`${proximas.length} por atender · ${datos.hoy.filter((x) => x.estado === "asistida").length} atendidas`} />
        <Kpi label="Asistencia" icono={<Percent />} valor={pct(datos.r.asistencia)} delta={delta(datos.r.asistencia, datos.rp.asistencia)} nota={`${datos.r.faltas} faltas`} />
        <Kpi label="Pacientes nuevos" icono={<UserPlus />} valor={datos.nuevos} nota={`${c.pacientes.length} en total`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]" style={{ marginTop: 16 }}>
        <div className="card card-pad anim-in">
          <div className="card-title">
            <div>
              <h2>Ingresos por día</h2>
              <p>Consultas atendidas · últimos 30 días</p>
            </div>
            <span className="chip chip-teal">{moneda.format(datos.r.ticketMedio)} ticket medio</span>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={datos.serie} margin={{ left: -10, right: 6, top: 6 }}>
                <defs>
                  <linearGradient id="gIng" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#04BFAD" stopOpacity={0.35} />
                    <stop offset="1" stopColor="#04BFAD" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#eef3f5" />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#8a9bab" }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: "#8a9bab" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v) => moneda.format(Number(v))} contentStyle={{ borderRadius: 14, border: "1px solid #e2ebef", fontSize: 13 }} />
                <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#009D9D" strokeWidth={2.5} fill="url(#gIng)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card card-pad anim-in">
          <div className="card-title">
            <div>
              <h2>Próximas hoy</h2>
              <p>{proximas.length ? `${proximas.length} pacientes por llegar` : "No quedan citas por hoy"}</p>
            </div>
            <Link href="/dashboard/admin/confirmar" className="btn btn-soft btn-sm">Llegadas</Link>
          </div>
          <div style={{ maxHeight: 268, overflowY: "auto" }}>
            {proximas.slice(0, 8).map((x) => {
              const m = c.medicos.find((y) => y.id === x.medico_id);
              return (
                <div key={x.id} className="list-row">
                  <div className="tnum" style={{ width: 48, fontWeight: 600, color: "var(--navy)" }}>{hora(x.inicio)}</div>
                  <Avatar nombre={x.paciente_nombre} size="is-sm" color={m?.color} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, color: "var(--navy)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.paciente_nombre}</div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.servicio_nombre} · {m?.nombre}</div>
                  </div>
                  <EstadoChip estado={x.estado} />
                </div>
              );
            })}
            {proximas.length === 0 && <p style={{ color: "var(--muted)", fontSize: 14, padding: "20px 0" }}>Revisa la agenda de mañana en Agenda y citas.</p>}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3" style={{ marginTop: 16 }}>
        <div className="card card-pad anim-in lg:col-span-1">
          <div className="card-title"><div><h2>Atendidas por especialista</h2><p>Últimos 30 días</p></div></div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={datos.porMedico} margin={{ left: -24, right: 0 }}>
                <CartesianGrid vertical={false} stroke="#eef3f5" />
                <XAxis dataKey="corto" tick={{ fontSize: 11, fill: "#8a9bab" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#8a9bab" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 14, border: "1px solid #e2ebef", fontSize: 13 }} />
                <Bar dataKey="atendidas" name="Atendidas" fill="#04BFAD" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card card-pad anim-in">
          <div className="card-title"><div><h2>Servicios más pedidos</h2><p>Últimos 30 días</p></div></div>
          {datos.top.map(([n, v], i) => (
            <div key={n} style={{ marginBottom: 14 }}>
              <div className="flex justify-between" style={{ fontSize: 14, marginBottom: 6 }}>
                <span style={{ color: "var(--navy)" }}>{i + 1}. {n}</span>
                <b className="tnum" style={{ fontWeight: 600 }}>{v}</b>
              </div>
              <div className="progress"><span style={{ width: `${(v / (datos.top[0]?.[1] || 1)) * 100}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="card card-pad anim-in">
          <div className="card-title"><div><h2>Pendientes</h2><p>Lo que necesita tu atención</p></div></div>
          <div className="grid gap-2">
            {datos.r.porCobrarCitas > 0 && (
              <Link href="/dashboard/admin/caja" className="list-row" style={{ borderBottom: "none", background: "var(--warn-50)", borderRadius: 14, padding: 12 }}>
                <Clock3 size={18} color="#a56411" />
                <div style={{ flex: 1, fontSize: 14 }}><b style={{ fontWeight: 600 }}>{datos.r.porCobrarCitas} consultas por cobrar</b><div style={{ color: "var(--muted)", fontSize: 12.5 }}>{moneda.format(datos.r.porCobrar)} pendientes</div></div>
                <ArrowRight size={16} />
              </Link>
            )}
            {bajos.length > 0 && (
              <Link href="/dashboard/admin/inventario" className="list-row" style={{ borderBottom: "none", background: "var(--danger-50)", borderRadius: 14, padding: 12 }}>
                <PackageX size={18} color="#c02842" />
                <div style={{ flex: 1, fontSize: 14 }}><b style={{ fontWeight: 600 }}>{bajos.length} insumos bajo el mínimo</b><div style={{ color: "var(--muted)", fontSize: 12.5 }}>{bajos.slice(0, 2).map((p) => p.nombre.split(" (")[0]).join(", ")}</div></div>
                <ArrowRight size={16} />
              </Link>
            )}
            {caducan.length > 0 && (
              <Link href="/dashboard/admin/inventario" className="list-row" style={{ borderBottom: "none", background: "var(--bg-2)", borderRadius: 14, padding: 12 }}>
                <AlertTriangle size={18} color="#a56411" />
                <div style={{ flex: 1, fontSize: 14 }}><b style={{ fontWeight: 600 }}>{caducan.length} por caducar (45 días)</b><div style={{ color: "var(--muted)", fontSize: 12.5 }}>{caducan.map((p) => p.nombre.split(" ")[0]).join(", ")}</div></div>
                <ArrowRight size={16} />
              </Link>
            )}
            <Link href="/dashboard/admin/integraciones" className="list-row" style={{ borderBottom: "none", background: "var(--teal-50)", borderRadius: 14, padding: 12 }}>
              <CalendarDays size={18} color="var(--teal)" />
              <div style={{ flex: 1, fontSize: 14 }}><b style={{ fontWeight: 600 }}>{c.medicos.filter((m) => m.google).length} de {c.medicos.length} con Google Calendar</b><div style={{ color: "var(--muted)", fontSize: 12.5 }}>Invita al resto a conectar su agenda</div></div>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
