"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, CreditCard, Database, MessageCircle, RotateCcw, Server, Video } from "lucide-react";
import { useClinica } from "@/lib/store";
import { Avatar, hace, PageHead, Switch, useToast } from "@/components/ui";
import { LogoCalendar, LogoGoogle } from "@/components/marca/LogoGoogle";

export default function Integraciones() {
  const c = useClinica();
  const toast = useToast();
  const i = c.integraciones;
  const [servidor, setServidor] = useState<{ creado: string; operaciones: number } | null>(null);
  useEffect(() => {
    fetch("/api/datos").then((r) => r.json()).then((d) => setServidor(d.servidor)).catch(() => {});
    if (new URLSearchParams(window.location.search).get("google") === "conectado") {
      toast.mostrar("Google Calendar conectado");
      window.history.replaceState(null, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.sincronizando]);

  const Tarjeta = ({ icono, titulo, desc, estado, children }: { icono: React.ReactNode; titulo: string; desc: string; estado: "on" | "off" | "demo"; children?: React.ReactNode }) => (
    <div className="card card-pad anim-in">
      <div className="flex items-start gap-3">
        <span className="icon-tile is-soft" style={{ background: "#fff", border: "1px solid var(--line)" }}>{icono}</span>
        <div style={{ flex: 1 }}>
          <div className="flex flex-wrap items-center gap-2"><b style={{ fontWeight: 600, color: "var(--navy)" }}>{titulo}</b><span className={`chip ${estado === "on" ? "chip-ok" : estado === "demo" ? "chip-teal" : ""}`}><span className="dot" />{estado === "on" ? "Activo" : estado === "demo" ? "Simulado" : "Apagado"}</span></div>
          <p style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 2 }}>{desc}</p>
        </div>
      </div>
      {children && <div style={{ marginTop: 14 }}>{children}</div>}
    </div>
  );

  return (
    <>
      <PageHead titulo="Integraciones" sub="Conexiones con Google, WhatsApp, pagos y telemedicina. En la demo todas funcionan en modo simulado." />
      <div className="card anim-in" style={{ padding: 22, marginBottom: 16 }}>
        <div className="flex flex-wrap items-center gap-3">
          <LogoCalendar size={40} />
          <div style={{ flex: 1 }}>
            <b style={{ fontWeight: 600, color: "var(--navy)", fontSize: 17 }}>Google Calendar por especialista</b>
            <p style={{ fontSize: 13.5, color: "var(--muted)" }}>Cada médico autoriza su propia cuenta (OAuth). Las citas se crean, mueven y borran solas, y sus eventos personales bloquean la reserva en línea.</p>
          </div>
          <span className="chip chip-teal">{c.medicos.filter((m) => m.google).length}/{c.medicos.length} conectados</span>
        </div>
        <div className="table-wrap" style={{ marginTop: 14 }}>
          <table className="table">
            <tbody>
              {c.medicos.map((m) => (
                <tr key={m.id}>
                  <td><span className="flex items-center gap-2"><Avatar nombre={m.nombre} color={m.color} size="is-sm" /><span><b style={{ fontWeight: 500, color: "var(--navy)" }}>{m.nombre}</b><br /><span style={{ fontSize: 12, color: "var(--muted)" }}>{m.especialidad}</span></span></span></td>
                  <td style={{ color: "var(--muted)" }}>{m.google ? m.google.email : "—"}</td>
                  <td>{m.google ? <span className="chip chip-ok">Sincronizado {m.google.ultimo_sync ? hace(m.google.ultimo_sync) : ""}</span> : <span className="chip">Sin conectar</span>}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {m.google ? (
                      <>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { c.sincronizarGoogle(m.id); toast.mostrar(`Agenda de ${m.nombre} sincronizada`); }}>Sincronizar</button>{" "}
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => c.desconectarGoogle(m.id)}>Desconectar</button>
                      </>
                    ) : (
                      <Link href={`/google/autorizar?modo=calendar&medico=${m.id}&volver=${encodeURIComponent("/dashboard/admin/integraciones")}`} className="btn btn-soft btn-sm"><LogoGoogle size={15} /> Conectar</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Tarjeta icono={<LogoGoogle size={22} />} titulo="Acceso con Google" desc="Los pacientes entran y se registran con su cuenta de Google en un toque." estado={i.google_login ? "on" : "off"}>
          <div className="flex items-center justify-between"><span style={{ fontSize: 14 }}>Mostrar «Continuar con Google»</span><Switch valor={i.google_login} etiqueta="Acceso con Google" onChange={(v) => c.actualizarIntegraciones({ google_login: v })} /></div>
        </Tarjeta>
        <Tarjeta icono={<MessageCircle color="#1faa59" />} titulo="Recordatorios por WhatsApp" desc="Confirmación al reservar y recordatorio antes de la cita (WhatsApp Business API)." estado={i.whatsapp_recordatorios ? "demo" : "off"}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2" style={{ fontSize: 14 }}>Enviar <select className="input" style={{ width: 90, minHeight: 36 }} value={i.recordatorio_horas} onChange={(e) => c.actualizarIntegraciones({ recordatorio_horas: Number(e.target.value) })}>{[2, 12, 24, 48].map((h) => <option key={h} value={h}>{h} h</option>)}</select> antes</label>
            <Switch valor={i.whatsapp_recordatorios} etiqueta="Recordatorios" onChange={(v) => c.actualizarIntegraciones({ whatsapp_recordatorios: v })} />
          </div>
        </Tarjeta>
        <Tarjeta icono={<CreditCard color="#635bff" />} titulo="Pagos en línea" desc="Cobro anticipado con tarjeta al reservar (Stripe o Mercado Pago)." estado={i.pagos_en_linea ? "demo" : "off"}>
          <div className="flex items-center justify-between"><span style={{ fontSize: 14 }}>Pedir pago al reservar</span><Switch valor={i.pagos_en_linea} etiqueta="Pagos en línea" onChange={(v) => c.actualizarIntegraciones({ pagos_en_linea: v })} /></div>
        </Tarjeta>
        <Tarjeta icono={<Video color="var(--violet)" />} titulo="Telemedicina" desc="Sala de videollamada que se genera sola para cada teleconsulta." estado="demo">
          <select className="input" value={i.telemedicina_proveedor} onChange={(e) => c.actualizarIntegraciones({ telemedicina_proveedor: e.target.value as typeof i.telemedicina_proveedor })}>
            <option>Google Meet</option><option>Zoom</option><option>Sala propia</option>
          </select>
        </Tarjeta>
        <Tarjeta icono={<BarChart3 color="#e37400" />} titulo="Google Analytics y Ads" desc="Medición de visitas a la portada y conversiones de reserva." estado="off">
          <p style={{ fontSize: 13, color: "var(--soft)" }}>Se conecta con el ID de medición de la clínica en producción.</p>
        </Tarjeta>
        <Tarjeta icono={<Database color="var(--teal)" />} titulo="Base de datos" desc="Demo sin base de datos: el navegador guarda la información y un servidor simulado (/api/datos) valida y replica cada cambio." estado="demo">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="chip"><Server /> Servidor: {servidor ? `${servidor.operaciones} operaciones · desde ${hace(servidor.creado)}` : "consultando…"}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={async () => { if (confirm("¿Volver a los datos de ejemplo? Se pierden los cambios.")) { await c.restablecerDemo(); toast.mostrar("Datos de ejemplo restablecidos"); } }}><RotateCcw /> Restablecer demo</button>
          </div>
        </Tarjeta>
      </div>
      {toast.nodo}
    </>
  );
}
