"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarCheck2, CalendarDays, Check, FileHeart, Stethoscope, Users, Video, Wallet } from "lucide-react";
import { useClinica } from "@/lib/store";
import { resumirCitas } from "@/lib/datos/modelo";
import { Avatar, claveDia, edad, EstadoChip, hora, Kpi, moneda, PageHead, useToast } from "@/components/ui";
import { Agenda } from "@/components/citas/Agenda";
import { DetalleCita } from "@/components/citas/CitaModales";
import { LogoCalendar } from "@/components/marca/LogoGoogle";

export default function PanelMedico() {
  const c = useClinica();
  const toast = useToast();
  const [abierta, setAbierta] = useState<string | null>(null);
  const yo = c.medicos.find((m) => m.id === c.sesion?.id);
  const ahora = Date.now();
  const mias = useMemo(() => c.citas.filter((x) => x.medico_id === c.sesion?.id), [c.citas, c.sesion]);
  const hoy = mias.filter((x) => claveDia(x.inicio) === claveDia(ahora) && x.estado !== "cancelada").sort((a, b) => a.inicio.localeCompare(b.inicio));
  const mes = resumirCitas(mias.filter((x) => ahora - new Date(x.inicio).getTime() < 30 * 86_400_000 && new Date(x.inicio).getTime() <= ahora));
  const siguiente = hoy.find((x) => x.estado === "confirmada" && new Date(x.fin).getTime() > ahora);
  if (!yo) return null;
  const pacienteSig = siguiente ? c.pacientes.find((p) => p.id === siguiente.paciente_id) : null;

  return (
    <>
      <PageHead titulo={`Hola, ${yo.nombre.split(" ").slice(0, 2).join(" ")}`} sub={`${yo.especialidad} · ${hoy.length} pacientes hoy`}>
        {yo.google ? (
          <Link href="/dashboard/medico/google" className="chip" style={{ height: 36, padding: "0 14px" }}><LogoCalendar size={16} /> Google Calendar sincronizado</Link>
        ) : (
          <Link href="/dashboard/medico/google" className="btn btn-soft btn-sm"><LogoCalendar size={16} /> Conectar Google Calendar</Link>
        )}
      </PageHead>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr_1fr_1fr]">
        {siguiente ? (
          <div className="credencial anim-in">
            <div style={{ fontSize: 12.5, opacity: 0.8, textTransform: "uppercase", letterSpacing: ".06em" }}>Siguiente paciente · {hora(siguiente.inicio)}</div>
            <div className="flex items-center gap-3" style={{ marginTop: 12 }}>
              <Avatar nombre={siguiente.paciente_nombre} color="#0b6f75" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 17 }}>{siguiente.paciente_nombre}</div>
                <div style={{ fontSize: 13, opacity: 0.85 }}>{siguiente.servicio_nombre}{pacienteSig?.fecha_nacimiento ? ` · ${edad(pacienteSig.fecha_nacimiento)}` : ""}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2" style={{ marginTop: 16 }}>
              <Link href={`/dashboard/medico/expedientes?id=${siguiente.paciente_id}&cita=${siguiente.id}`} className="btn btn-white btn-sm"><Stethoscope /> Iniciar consulta</Link>
              {siguiente.enlace_video && <a href={siguiente.enlace_video} target="_blank" rel="noreferrer" className="btn btn-outline-white btn-sm"><Video /> Video</a>}
            </div>
          </div>
        ) : (
          <Kpi destacado label="Siguiente paciente" icono={<CalendarCheck2 />} valor="Libre" nota="No quedan citas por hoy" />
        )}
        <Kpi label="Atendidos (30 días)" icono={<Users />} valor={mes.atendidas} nota={`${Math.round(mes.asistencia * 100)} % de asistencia`} />
        <Kpi label="Producción (30 días)" icono={<Wallet />} valor={moneda.format(mes.ingresos)} nota="Valor de consultas atendidas" />
        <Kpi label="Por venir" icono={<CalendarDays />} valor={mias.filter((x) => x.estado === "confirmada" && new Date(x.inicio).getTime() > ahora).length} nota="citas agendadas" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[380px_1fr]" style={{ marginTop: 16 }}>
        <div className="card card-pad anim-in">
          <div className="card-title"><div><h2>Hoy</h2><p>Tu lista del día</p></div></div>
          {hoy.length === 0 && <p style={{ color: "var(--muted)" }}>Sin citas hoy.</p>}
          {hoy.map((x) => (
            <div key={x.id} className="list-row" style={{ cursor: "pointer" }} onClick={() => setAbierta(x.id)}>
              <div className="tnum" style={{ width: 46, fontWeight: 600, color: "var(--navy)" }}>{hora(x.inicio)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, color: "var(--navy)", fontSize: 14 }} className="flex items-center gap-1">{x.modalidad === "telemedicina" && <Video size={13} color="var(--violet)" />}{x.paciente_nombre}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{x.servicio_nombre}</div>
              </div>
              {x.estado === "confirmada" ? (
                <button type="button" className="btn btn-soft btn-sm" onClick={(e) => { e.stopPropagation(); if (c.marcarAsistida(x.id).ok) toast.mostrar("Llegada confirmada"); }}><Check /> Llegó</button>
              ) : x.estado === "asistida" ? (
                <Link href={`/dashboard/medico/expedientes?id=${x.paciente_id}&cita=${x.id}`} className="btn btn-ghost btn-sm" onClick={(e) => e.stopPropagation()}><FileHeart /> Nota</Link>
              ) : (
                <EstadoChip estado={x.estado} />
              )}
            </div>
          ))}
        </div>
        <Agenda medicos={[yo]} vistaInicial="semana" soloLectura={!c.permisos.crear_citas} />
      </div>
      {abierta && <DetalleCita cita={c.citas.find((x) => x.id === abierta) ?? null} onClose={() => setAbierta(null)} onToast={toast.mostrar} />}
      {toast.nodo}
    </>
  );
}
