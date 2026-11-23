import type { Cita, ClinicaConfig } from "@/lib/datos/modelo";

const utc = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function detalle(c: Cita, clinica: ClinicaConfig) {
  return [
    `${c.servicio_nombre || "Consulta"} con ${c.medico_nombre} (${c.especialidad}).`,
    c.enlace_video ? `Videollamada: ${c.enlace_video}` : `Llega 10 minutos antes y muestra tu código QR en recepción.`,
    c.motivo ? `Motivo: ${c.motivo}` : "",
    `${clinica.nombre} · ${clinica.telefono}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Enlace de "Agregar a Google Calendar" (plantilla pública, no requiere API). */
export function enlaceGoogleCalendar(c: Cita, clinica: ClinicaConfig) {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `${c.servicio_nombre || "Consulta"} · ${clinica.nombre}`,
    dates: `${utc(c.inicio)}/${utc(c.fin)}`,
    details: detalle(c, clinica),
    location: c.modalidad === "telemedicina" ? c.enlace_video ?? "Videollamada" : c.modalidad === "domicilio" ? c.direccion_domicilio ?? "" : clinica.direccion,
    ctz: "America/Mexico_City",
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

/** Archivo .ics para Apple Calendar, Outlook y cualquier otro calendario. */
export function descargarIcs(c: Cita, clinica: ClinicaConfig) {
  const esc = (t: string) => t.replace(/[,;\\]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Medical OS//Citas//ES",
    "BEGIN:VEVENT",
    `UID:${c.id}@medical-os`,
    `DTSTAMP:${utc(new Date().toISOString())}`,
    `DTSTART:${utc(c.inicio)}`,
    `DTEND:${utc(c.fin)}`,
    `SUMMARY:${esc(`${c.servicio_nombre || "Consulta"} · ${clinica.nombre}`)}`,
    `DESCRIPTION:${esc(detalle(c, clinica))}`,
    `LOCATION:${esc(c.modalidad === "telemedicina" ? c.enlace_video ?? "" : clinica.direccion)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT2H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Recordatorio de cita",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `cita-${c.id}.ics`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
