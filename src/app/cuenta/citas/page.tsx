"use client";

import Link from "next/link";
import { Ban, CalendarPlus, Video } from "lucide-react";
import { useClinica } from "@/lib/store";
import { ETIQUETA_MODALIDAD } from "@/lib/datos/modelo";
import { enlaceGoogleCalendar } from "@/lib/calendario";
import { diaLargo, EstadoChip, hora, moneda, PageHead, useToast, Vacio } from "@/components/ui";
import { LogoCalendar } from "@/components/marca/LogoGoogle";
import { QrCita } from "@/components/citas/QrCita";

export default function MisCitas() {
  const c = useClinica();
  const toast = useToast();
  const mias = c.citas.filter((x) => x.paciente_id === c.sesion?.id).sort((a, b) => b.inicio.localeCompare(a.inicio));
  const futuras = mias.filter((x) => x.estado === "confirmada" && new Date(x.fin).getTime() > Date.now()).reverse();
  const pasadas = mias.filter((x) => !futuras.includes(x));
  return (
    <>
      <PageHead titulo="Mis citas" sub="Puedes cancelar o agregar tus citas a tu calendario.">
        <Link href="/reservar" className="btn btn-grad btn-sm"><CalendarPlus /> Nueva cita</Link>
      </PageHead>
      <h2 style={{ fontSize: 17, marginBottom: 10 }}>Próximas</h2>
      {futuras.length === 0 && <div className="card"><Vacio titulo="Sin citas próximas" /></div>}
      <div className="grid gap-3 lg:grid-cols-2">
        {futuras.map((x) => (
          <div key={x.id} className="card card-pad anim-in flex gap-4">
            <QrCita id={x.id} size={110} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <b style={{ fontWeight: 600, color: "var(--navy)" }}>{x.servicio_nombre}</b>
              <div style={{ fontSize: 14, textTransform: "capitalize" }}>{diaLargo(x.inicio)} · {hora(x.inicio)}</div>
              <div style={{ fontSize: 13, color: "var(--muted)" }}>{x.medico_nombre} · {ETIQUETA_MODALIDAD[x.modalidad]} · {moneda.format(x.precio)}</div>
              <div className="flex flex-wrap gap-2" style={{ marginTop: 10 }}>
                <a href={enlaceGoogleCalendar(x, c.clinicaConfig)} target="_blank" rel="noreferrer" className="btn btn-soft btn-sm"><LogoCalendar size={15} /> Calendar</a>
                {x.enlace_video && <a href={x.enlace_video} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm"><Video /> Video</a>}
                <button type="button" className="btn btn-danger btn-sm" onClick={() => confirm("¿Cancelar esta cita?") && c.cancelarCita(x.id).ok && toast.mostrar("Cita cancelada")}><Ban /> Cancelar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <h2 style={{ fontSize: 17, margin: "26px 0 10px" }}>Historial</h2>
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Fecha</th><th>Servicio</th><th>Especialista</th><th>Estado</th></tr></thead>
            <tbody>
              {pasadas.map((x) => (
                <tr key={x.id}><td style={{ textTransform: "capitalize" }}>{diaLargo(x.inicio)}</td><td>{x.servicio_nombre}</td><td>{x.medico_nombre}</td><td><EstadoChip estado={x.estado} /></td></tr>
              ))}
              {pasadas.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--muted)", padding: 24 }}>Sin historial todavía.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {toast.nodo}
    </>
  );
}
