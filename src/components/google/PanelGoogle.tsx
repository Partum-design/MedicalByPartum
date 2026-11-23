"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarClock, Check, Link2Off, Plus, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { useClinica } from "@/lib/store";
import { claveDia, diaCorto, hace, hora, Switch, useToast } from "@/components/ui";
import { LogoCalendar } from "@/components/marca/LogoGoogle";
import { isoDe } from "@/components/citas/CitaModales";

/**
 * Conexión de un médico con su Google Calendar (OAuth simulado):
 * estado, sincronización bidireccional, eventos espejo y bloqueos personales.
 */
export function PanelGoogle({ medicoId, volver }: { medicoId: string; volver: string }) {
  const c = useClinica();
  const toast = useToast();
  const m = c.medicos.find((x) => x.id === medicoId);
  const [nuevo, setNuevo] = useState({ titulo: "", fecha: claveDia(Date.now() + 86_400_000), inicio: "14:00", fin: "15:00" });
  const [sincronizando, setSincronizando] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("google") === "conectado") {
      toast.mostrar("Google Calendar conectado");
      window.history.replaceState(null, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!m) return null;
  const g = m.google;
  const eventos = c.eventosGoogle
    .filter((e) => e.medico_id === medicoId && new Date(e.fin).getTime() > Date.now())
    .sort((a, b) => a.inicio.localeCompare(b.inicio));
  const espejo = eventos.filter((e) => e.origen === "medical-os");
  const personales = eventos.filter((e) => e.origen === "personal");

  if (!g) {
    return (
      <div className="card anim-in" style={{ overflow: "hidden" }}>
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]" style={{ padding: 28 }}>
          <div>
            <LogoCalendar size={46} />
            <h2 style={{ fontSize: 24, marginTop: 14 }}>Conecta tu Google Calendar</h2>
            <p style={{ color: "var(--muted)", marginTop: 8 }}>
              Cada cita que se agende, mueva o cancele en Medical OS aparecerá sola en tu calendario. Y tus eventos personales (juntas, cursos, comidas) bloquearán esas horas en la reserva en línea para que nadie te agende encima.
            </p>
            <div className="grid gap-2" style={{ marginTop: 18, fontSize: 14 }}>
              {["Sincronización en ambos sentidos", "Recordatorios de Google en tu teléfono", "Puedes desconectarlo cuando quieras"].map((t) => (
                <div key={t} className="flex items-center gap-2"><Check size={16} color="var(--teal)" /> {t}</div>
              ))}
            </div>
            <Link href={`/google/autorizar?modo=calendar&medico=${medicoId}&volver=${encodeURIComponent(volver)}`} className="btn btn-grad btn-lg" style={{ marginTop: 24 }}>
              Conectar con Google
            </Link>
            <p className="flex items-center gap-2" style={{ fontSize: 12.5, color: "var(--soft)", marginTop: 12 }}>
              <ShieldCheck size={14} /> OAuth 2.0 · sólo pedimos acceso a eventos de calendario.
            </p>
          </div>
          <div className="band grid place-items-center" style={{ borderRadius: 28, minHeight: 260, padding: 24 }}>
            <div className="card" style={{ width: "100%", maxWidth: 280, padding: 16, color: "var(--navy)" }}>
              <div className="flex items-center gap-2" style={{ fontWeight: 600 }}><LogoCalendar size={20} /> Martes</div>
              {["09:00 Revisión pediátrica · Sofía", "10:30 Teleconsulta · Iker", "14:00 Junta del colegio (personal)"].map((t, i) => (
                <div key={t} style={{ marginTop: 8, fontSize: 12.5, padding: "8px 10px", borderRadius: 10, background: i === 2 ? "#eef1f4" : "var(--teal-50)", borderLeft: `3px solid ${i === 2 ? "#9aa0a6" : "var(--teal)"}` }}>{t}</div>
              ))}
            </div>
          </div>
        </div>
        {toast.nodo}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="card card-pad anim-in">
        <div className="flex flex-wrap items-center gap-4">
          <LogoCalendar size={44} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="flex items-center gap-2">
              <b style={{ fontWeight: 600, color: "var(--navy)", fontSize: 17 }}>Google Calendar conectado</b>
              <span className="chip chip-ok"><span className="dot" /> Activo</span>
            </div>
            <div style={{ fontSize: 13.5, color: "var(--muted)" }}>
              {g.email} · calendario «{g.calendario}» · última sincronización {g.ultimo_sync ? hace(g.ultimo_sync) : "pendiente"}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={sincronizando}
            onClick={() => {
              setSincronizando(true);
              setTimeout(() => {
                c.sincronizarGoogle(medicoId);
                setSincronizando(false);
                toast.mostrar("Calendario sincronizado");
              }, 900);
            }}
          >
            <RefreshCw className={sincronizando ? "animate-spin" : ""} /> {sincronizando ? "Sincronizando…" : "Sincronizar ahora"}
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => confirm("¿Desconectar Google Calendar? Se quitarán los eventos creados por Medical OS.") && c.desconectarGoogle(medicoId)}>
            <Link2Off /> Desconectar
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3" style={{ marginTop: 18, padding: 14, borderRadius: 16, background: "var(--bg-2)" }}>
          <div>
            <b style={{ fontWeight: 500, color: "var(--navy)" }}>Sincronización automática</b>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Crear, mover y borrar eventos al instante cuando cambie una cita.</div>
          </div>
          <Switch valor={g.auto} etiqueta="Sincronización automática" onChange={(v) => c.ajustarGoogle(medicoId, v)} />
        </div>
        <div className="grid grid-cols-3 gap-3" style={{ marginTop: 14 }}>
          {[
            ["Citas en Google", espejo.length],
            ["Bloqueos personales", personales.length],
            ["Próximos 7 días", eventos.filter((e) => new Date(e.inicio).getTime() < Date.now() + 7 * 86_400_000).length],
          ].map(([k, v]) => (
            <div key={k} className="kpi" style={{ padding: 14 }}>
              <div className="kpi-label">{k}</div>
              <div className="kpi-value" style={{ fontSize: 22, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="card card-pad anim-in">
          <div className="card-title"><div><h2>Próximos eventos en tu Google Calendar</h2><p>Los de Medical OS y los tuyos, como los ves en Google</p></div></div>
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {eventos.slice(0, 30).map((e) => (
              <div key={e.id} className="list-row">
                <div style={{ width: 86, fontSize: 13, color: "var(--muted)", textTransform: "capitalize" }}>{diaCorto(e.inicio)}<br /><b className="tnum" style={{ color: "var(--navy)", fontWeight: 600 }}>{hora(e.inicio)}</b></div>
                <div style={{ flex: 1, padding: "8px 12px", borderRadius: 12, background: e.origen === "personal" ? "#eef1f4" : "var(--teal-50)", borderLeft: `3px solid ${e.origen === "personal" ? "#9aa0a6" : m.color}` }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--navy)" }}>{e.titulo}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{e.origen === "personal" ? "Evento personal · bloquea la agenda" : "Creado por Medical OS"} · hasta {hora(e.fin)}</div>
                </div>
                {e.origen === "personal" && (
                  <button type="button" className="btn btn-ghost btn-icon" aria-label="Quitar bloqueo" onClick={() => c.eliminarEventoGoogle(e.id)}><Trash2 size={15} /></button>
                )}
              </div>
            ))}
            {eventos.length === 0 && <p style={{ color: "var(--muted)", padding: 16 }}>Sin eventos próximos.</p>}
          </div>
        </div>
        <div className="card card-pad anim-in">
          <div className="card-title"><div><h2>Simular evento personal</h2><p>Así se ve cuando agendas algo directo en Google</p></div><CalendarClock size={20} color="var(--teal)" /></div>
          <div className="grid gap-3">
            <label className="field"><span>Título</span><input className="input" placeholder="Ej. Junta, curso, comida" value={nuevo.titulo} onChange={(e) => setNuevo({ ...nuevo, titulo: e.target.value })} /></label>
            <label className="field"><span>Fecha</span><input type="date" className="input" value={nuevo.fecha} onChange={(e) => setNuevo({ ...nuevo, fecha: e.target.value })} /></label>
            <div className="grid grid-cols-2 gap-2">
              <label className="field"><span>Inicio</span><input type="time" className="input" value={nuevo.inicio} onChange={(e) => setNuevo({ ...nuevo, inicio: e.target.value })} /></label>
              <label className="field"><span>Fin</span><input type="time" className="input" value={nuevo.fin} onChange={(e) => setNuevo({ ...nuevo, fin: e.target.value })} /></label>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                if (!nuevo.titulo.trim()) return alert("Escribe un título.");
                const inicio = isoDe(nuevo.fecha, nuevo.inicio);
                const fin = isoDe(nuevo.fecha, nuevo.fin);
                if (fin <= inicio) return alert("La hora de fin debe ser posterior.");
                if (c.agregarEventoGoogle({ medico_id: medicoId, titulo: nuevo.titulo.trim(), inicio, fin, ocupado: true }).ok) {
                  toast.mostrar("Evento recibido desde Google: esas horas ya no se ofrecen");
                  setNuevo({ ...nuevo, titulo: "" });
                }
              }}
            >
              <Plus /> Recibir desde Google
            </button>
          </div>
        </div>
      </div>
      {toast.nodo}
    </div>
  );
}
