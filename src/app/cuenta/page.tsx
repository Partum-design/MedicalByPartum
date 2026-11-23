"use client";

import Link from "next/link";
import { CalendarPlus, ClipboardList, Download, FileHeart, MapPin, Syringe, Video } from "lucide-react";
import { useClinica } from "@/lib/store";
import { ESQUEMA_VACUNACION } from "@/lib/datos/modelo";
import { enlaceGoogleCalendar, descargarIcs } from "@/lib/calendario";
import { diaLargo, edad, hora, PageHead, Vacio, diaCorto } from "@/components/ui";
import { QrCita } from "@/components/citas/QrCita";
import { LogoCalendar } from "@/components/marca/LogoGoogle";

export default function Cuenta() {
  const c = useClinica();
  const s = c.sesion!;
  const yo = c.pacientes.find((p) => p.id === s.id);
  const mias = c.citas.filter((x) => x.paciente_id === s.id);
  const proximas = mias.filter((x) => x.estado === "confirmada" && new Date(x.fin).getTime() > Date.now()).sort((a, b) => a.inicio.localeCompare(b.inicio));
  const prox = proximas[0];
  const ultima = c.fichas[0];
  const meses = yo?.fecha_nacimiento ? (Date.now() - new Date(yo.fecha_nacimiento).getTime()) / (30.44 * 86_400_000) : 999;
  const esquema = ESQUEMA_VACUNACION.filter((v) => v.meses <= meses);
  const aplicadas = esquema.filter((v) => c.vacunas.some((a) => a.vacuna === v.vacuna && a.dosis === v.dosis)).length;

  return (
    <>
      <PageHead titulo={`Hola, ${s.nombre.split(" ")[0]}`} sub={yo?.tutor ? `Cuenta de ${yo.nombre} · tutor: ${yo.tutor}` : "Tu salud, organizada en un solo lugar."}>
        <Link href="/reservar" className="btn btn-grad btn-sm"><CalendarPlus /> Agendar cita</Link>
      </PageHead>
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        {prox ? (
          <div className="credencial anim-in" style={{ padding: 28 }}>
            <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
              <div>
                <div style={{ fontSize: 12.5, opacity: 0.8, textTransform: "uppercase", letterSpacing: ".06em" }}>Tu próxima cita</div>
                <div style={{ fontSize: 26, fontWeight: 600, marginTop: 8, lineHeight: 1.15 }}>{prox.servicio_nombre}</div>
                <div style={{ marginTop: 6, opacity: 0.9, textTransform: "capitalize" }}>{diaLargo(prox.inicio)} · {hora(prox.inicio)} h</div>
                <div style={{ marginTop: 4, opacity: 0.85, fontSize: 14 }}>{prox.medico_nombre} · {prox.especialidad}</div>
                <div className="flex flex-wrap gap-2" style={{ marginTop: 20 }}>
                  <a href={enlaceGoogleCalendar(prox, c.clinicaConfig)} target="_blank" rel="noreferrer" className="btn btn-white btn-sm"><LogoCalendar size={16} /> Google Calendar</a>
                  <button type="button" className="btn btn-outline-white btn-sm" onClick={() => descargarIcs(prox, c.clinicaConfig)}><Download /> .ics</button>
                  {prox.enlace_video ? (
                    <a href={prox.enlace_video} target="_blank" rel="noreferrer" className="btn btn-outline-white btn-sm"><Video /> Entrar a la videollamada</a>
                  ) : (
                    <a href={c.clinicaConfig.mapa_url} target="_blank" rel="noreferrer" className="btn btn-outline-white btn-sm"><MapPin /> Cómo llegar</a>
                  )}
                </div>
              </div>
              <div style={{ justifySelf: "center", textAlign: "center" }}>
                <QrCita id={prox.id} size={150} />
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>Muéstralo en recepción</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card card-pad anim-in"><Vacio icono={<CalendarPlus />} titulo="No tienes citas próximas"><Link href="/reservar" className="btn btn-grad btn-sm" style={{ marginTop: 10 }}>Agendar ahora</Link></Vacio></div>
        )}
        <div className="grid gap-4">
          {meses < 15 * 12 && (
            <Link href="/cuenta/vacunas" className="card card-pad card-hover anim-in">
              <div className="flex items-center gap-3"><span className="icon-tile"><Syringe /></span><div style={{ flex: 1 }}><b style={{ fontWeight: 600, color: "var(--navy)" }}>Cartilla de vacunación</b><div style={{ fontSize: 13, color: "var(--muted)" }}>{edad(yo?.fecha_nacimiento)} · {aplicadas} de {esquema.length} dosis para su edad</div></div></div>
              <div className="progress" style={{ marginTop: 14 }}><span style={{ width: `${esquema.length ? (aplicadas / esquema.length) * 100 : 0}%` }} /></div>
              {aplicadas < esquema.length && <p style={{ fontSize: 13, color: "#a56411", marginTop: 8 }}>Tiene {esquema.length - aplicadas} dosis pendiente(s).</p>}
            </Link>
          )}
          <Link href="/cuenta/expediente" className="card card-pad card-hover anim-in">
            <div className="flex items-center gap-3"><span className="icon-tile"><FileHeart /></span><div><b style={{ fontWeight: 600, color: "var(--navy)" }}>Última consulta</b><div style={{ fontSize: 13, color: "var(--muted)" }}>{ultima ? `${diaCorto(ultima.creado_en)} · ${ultima.medico_nombre}` : "Aún no hay consultas registradas"}</div></div></div>
            {ultima && <p style={{ fontSize: 14, marginTop: 12 }}><b style={{ fontWeight: 500 }}>Diagnóstico:</b> {ultima.diagnostico}</p>}
            {ultima?.receta && <p style={{ fontSize: 14, marginTop: 4, color: "var(--muted)" }}>Receta: {ultima.receta}</p>}
          </Link>
          <Link href="/cuenta/citas" className="card card-pad card-hover anim-in flex items-center gap-3">
            <span className="icon-tile is-soft"><ClipboardList /></span>
            <div><b style={{ fontWeight: 600, color: "var(--navy)" }}>{proximas.length} {proximas.length === 1 ? "cita" : "citas"} por venir</b><div style={{ fontSize: 13, color: "var(--muted)" }}>{mias.filter((x) => x.estado === "asistida").length} consultas atendidas en total</div></div>
          </Link>
        </div>
      </div>
    </>
  );
}
