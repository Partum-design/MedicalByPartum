"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Ban, CalendarClock, CalendarPlus, Check, CreditCard, FileHeart, Banknote, Trash2, UserPlus, UserX, Video } from "lucide-react";
import { useClinica } from "@/lib/store";
import { instante } from "@/lib/datos/disponibilidad";
import { ETIQUETA_MODALIDAD, precioDe, type Cita, type Modalidad } from "@/lib/datos/modelo";
import { enlaceGoogleCalendar } from "@/lib/calendario";
import { Avatar, claveDia, diaLargo, edad, EstadoChip, hora, Modal, moneda, PagoChip } from "@/components/ui";
import { LogoCalendar } from "@/components/marca/LogoGoogle";

/** "2026-11-23" + "10:30" → ISO en la zona de la clínica */
export function isoDe(fechaClave: string, hhmm: string) {
  const [a, m, d] = fechaClave.split("-").map(Number);
  const [h, mi] = hhmm.split(":").map(Number);
  return new Date(instante(a, m, d, h * 60 + mi)).toISOString();
}

export function DetalleCita({ cita, onClose, onToast }: { cita: Cita | null; onClose: () => void; onToast?: (m: string) => void }) {
  const c = useClinica();
  const [reagendar, setReagendar] = useState(false);
  const [f, setF] = useState("");
  const [h, setH] = useState("");
  const [error, setError] = useState<string | null>(null);
  if (!cita) return null;
  const actual = c.citas.find((x) => x.id === cita.id) ?? cita;
  const paciente = c.pacientes.find((p) => p.id === actual.paciente_id);
  const medico = c.medicos.find((m) => m.id === actual.medico_id);
  const admin = c.sesion?.rol === "admin";
  const expediente = admin ? `/dashboard/admin/pacientes?id=${actual.paciente_id}` : `/dashboard/medico/expedientes?id=${actual.paciente_id}&cita=${actual.id}`;
  const ok = (m: string) => onToast?.(m);

  const guardarFecha = () => {
    setError(null);
    if (!f || !h) return setError("Elige fecha y hora.");
    const r = c.actualizarCita(actual.id, { inicio: isoDe(f, h) }, admin);
    if (!r.ok) return setError(r.error);
    setReagendar(false);
    ok("Cita reagendada");
  };

  return (
    <Modal
      abierto
      onClose={onClose}
      titulo={actual.servicio_nombre || "Consulta"}
      sub={`${diaLargo(actual.inicio)} · ${hora(actual.inicio)} – ${hora(actual.fin)}`}
      pie={
        <>
          {admin && (
            <button type="button" className="btn btn-danger btn-sm" style={{ marginRight: "auto" }} onClick={() => { if (confirm("¿Eliminar la cita? Desaparece también de caja y reportes.")) { c.eliminarCita(actual.id); onClose(); } }}>
              <Trash2 /> Eliminar
            </button>
          )}
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Cerrar
          </button>
        </>
      }
    >
      <div className="flex items-center gap-3">
        <Avatar nombre={actual.paciente_nombre} size="is-lg" />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: 17 }}>{actual.paciente_nombre}</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>
            {[edad(paciente?.fecha_nacimiento), paciente?.telefono, paciente?.tutor && `Tutor: ${paciente.tutor}`].filter(Boolean).join(" · ")}
          </div>
          {paciente?.alergias && paciente.alergias !== "Ninguna conocida" && <span className="chip chip-danger" style={{ marginTop: 6 }}>Alergia: {paciente.alergias}</span>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2" style={{ marginTop: 14 }}>
        <EstadoChip estado={actual.estado} />
        <PagoChip cita={actual} />
        <span className="chip">{ETIQUETA_MODALIDAD[actual.modalidad]}</span>
        <span className="chip" style={{ color: medico?.color }}>
          <span className="dot" /> {actual.medico_nombre}
        </span>
        {actual.google_evento_id && (
          <span className="chip">
            <LogoCalendar size={13} /> En Google Calendar
          </span>
        )}
      </div>
      <div className="grid gap-2" style={{ marginTop: 16, fontSize: 14, background: "var(--bg-2)", borderRadius: 16, padding: 14 }}>
        <div className="flex justify-between"><span style={{ color: "var(--muted)" }}>Precio</span><b style={{ fontWeight: 600 }}>{moneda.format(actual.precio)}</b></div>
        {actual.motivo && <div><span style={{ color: "var(--muted)" }}>Motivo: </span>{actual.motivo}</div>}
        {actual.notas && <div><span style={{ color: "var(--muted)" }}>Notas: </span>{actual.notas}</div>}
        {actual.direccion_domicilio && <div><span style={{ color: "var(--muted)" }}>Domicilio: </span>{actual.direccion_domicilio}</div>}
        {actual.llegada_en && <div><span style={{ color: "var(--muted)" }}>Llegó: </span>{hora(actual.llegada_en)}</div>}
        <div style={{ fontSize: 12, color: "var(--soft)" }}>Folio {actual.id} · {actual.creada_por === "paciente" ? "Reservada en línea" : "Registrada por el personal"}</div>
      </div>

      <div className="grid grid-cols-2 gap-2" style={{ marginTop: 16 }}>
        {actual.estado === "confirmada" && (
          <button type="button" className="btn btn-grad" onClick={() => { if (c.marcarAsistida(actual.id).ok) ok("Llegada confirmada"); }}>
            <Check /> Llegó
          </button>
        )}
        {actual.estado !== "cancelada" && actual.estado_pago === "pendiente" && (
          <>
            <button type="button" className="btn btn-soft" onClick={() => { if (c.cobrar(actual.id, "efectivo").ok) ok("Cobro en efectivo registrado"); }}>
              <Banknote /> Cobrar efectivo
            </button>
            <button type="button" className="btn btn-soft" onClick={() => { if (c.cobrar(actual.id, "tarjeta").ok) ok("Cobro con tarjeta registrado"); }}>
              <CreditCard /> Cobrar tarjeta
            </button>
          </>
        )}
        <Link href={expediente} className="btn btn-ghost">
          <FileHeart /> Expediente
        </Link>
        {actual.enlace_video && actual.estado === "confirmada" && (
          <a href={actual.enlace_video} target="_blank" rel="noreferrer" className="btn btn-ghost">
            <Video /> Videollamada
          </a>
        )}
        <a href={enlaceGoogleCalendar(actual, c.clinicaConfig)} target="_blank" rel="noreferrer" className="btn btn-ghost">
          <CalendarPlus /> Google Calendar
        </a>
        {actual.estado === "confirmada" && (
          <>
            <button type="button" className="btn btn-ghost" onClick={() => { setReagendar((v) => !v); setF(claveDia(actual.inicio)); setH(hora(actual.inicio)); }}>
              <CalendarClock /> Reagendar
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => { if (c.actualizarCita(actual.id, { estado: "no_asistio" }).ok) ok("Marcada como no asistió"); }}>
              <UserX /> No asistió
            </button>
            <button type="button" className="btn btn-danger" onClick={() => { if (confirm("¿Cancelar esta cita?") && c.cancelarCita(actual.id).ok) ok("Cita cancelada"); }}>
              <Ban /> Cancelar
            </button>
          </>
        )}
        {(actual.estado === "cancelada" || actual.estado === "no_asistio") && (
          <button type="button" className="btn btn-ghost" onClick={() => { const r = c.actualizarCita(actual.id, { estado: "confirmada" }, admin); if (r.ok) ok("Cita reactivada"); else alert(r.error); }}>
            Reactivar
          </button>
        )}
      </div>
      {reagendar && (
        <div className="card card-pad anim-in grid gap-3 sm:grid-cols-[1fr_1fr_auto]" style={{ marginTop: 12, alignItems: "end" }}>
          <label className="field">
            <span>Fecha</span>
            <input type="date" className="input" value={f} onChange={(e) => setF(e.target.value)} />
          </label>
          <label className="field">
            <span>Hora</span>
            <input type="time" step={300} className="input" value={h} onChange={(e) => setH(e.target.value)} />
          </label>
          <button type="button" className="btn btn-primary" onClick={guardarFecha}>Guardar</button>
          {error && <p style={{ color: "var(--danger)", fontSize: 13 }} className="sm:col-span-3">{error}</p>}
        </div>
      )}
    </Modal>
  );
}

/** Alta de cita desde recepción o desde el consultorio. */
export function NuevaCita({
  abierto,
  onClose,
  inicial,
  onCreada,
}: {
  abierto: boolean;
  onClose: () => void;
  inicial?: { medico_id?: string; fecha?: string; hora?: string; paciente_id?: string };
  onCreada?: (id: string) => void;
}) {
  const c = useClinica();
  const admin = c.sesion?.rol === "admin";
  const [busca, setBusca] = useState("");
  const [pacienteId, setPacienteId] = useState(inicial?.paciente_id ?? "");
  const [nuevo, setNuevo] = useState(false);
  const [np, setNp] = useState({ nombre: "", telefono: "", fecha_nacimiento: "", tutor: "" });
  const [medicoId, setMedicoId] = useState(inicial?.medico_id ?? (c.sesion?.rol === "medico" ? c.sesion.id : c.medicos[0]?.id ?? ""));
  const [servicioId, setServicioId] = useState("");
  const [f, setF] = useState(inicial?.fecha ?? claveDia(Date.now()));
  const [h, setH] = useState(inicial?.hora ?? "10:00");
  const [modalidad, setModalidad] = useState<Modalidad>("presencial");
  const [notas, setNotas] = useState("");
  const [forzar, setForzar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const medico = c.medicos.find((m) => m.id === medicoId);
  const servicios = c.servicios.filter((s) => s.activo && (!s.medicos?.length || s.medicos.includes(medicoId)));
  const coincidencias = useMemo(() => {
    const t = busca.trim().toLowerCase();
    if (!t) return c.pacientes.slice(0, 6);
    return c.pacientes.filter((p) => p.nombre.toLowerCase().includes(t) || p.telefono.includes(t)).slice(0, 8);
  }, [busca, c.pacientes]);
  const paciente = c.pacientes.find((p) => p.id === pacienteId);

  const guardar = () => {
    setError(null);
    let pid = pacienteId;
    if (nuevo) {
      if (np.nombre.trim().length < 3) return setError("Escribe el nombre del paciente.");
      const r = c.registrarPaciente({ nombre: np.nombre, telefono: np.telefono, email: "", fecha_nacimiento: np.fecha_nacimiento, tutor: np.tutor });
      if (!r.paciente) return setError(r.error);
      pid = r.paciente.id;
    }
    if (!pid) return setError("Elige o registra al paciente.");
    if (!servicioId) return setError("Elige el servicio.");
    const r = c.crearCitaPersonal({ paciente_id: pid, medico_id: medicoId, servicio_id: servicioId, inicio: isoDe(f, h), modalidad, notas, forzar: admin && forzar });
    if (!r.ok) return setError(r.error);
    onCreada?.(r.id!);
    onClose();
  };

  return (
    <Modal
      abierto={abierto}
      onClose={onClose}
      titulo="Nueva cita"
      sub="Recepción, teléfono o WhatsApp"
      grande
      pie={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="button" className="btn btn-grad" onClick={guardar}>
            <CalendarPlus /> Agendar
          </button>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="grid content-start gap-3">
          <div className="flex items-center justify-between">
            <span className="label">Paciente</span>
            <button type="button" className="btn btn-soft btn-sm" onClick={() => setNuevo((v) => !v)}>
              <UserPlus /> {nuevo ? "Buscar existente" : "Paciente nuevo"}
            </button>
          </div>
          {nuevo ? (
            <div className="grid gap-2">
              <input className="input" placeholder="Nombre completo" value={np.nombre} onChange={(e) => setNp({ ...np, nombre: e.target.value })} />
              <input className="input" placeholder="Celular" inputMode="tel" value={np.telefono} onChange={(e) => setNp({ ...np, telefono: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <label className="field"><span>Nacimiento</span><input type="date" className="input" value={np.fecha_nacimiento} onChange={(e) => setNp({ ...np, fecha_nacimiento: e.target.value })} /></label>
                <label className="field"><span>Tutor (menores)</span><input className="input" value={np.tutor} onChange={(e) => setNp({ ...np, tutor: e.target.value })} /></label>
              </div>
            </div>
          ) : (
            <>
              <input className="input input-search" placeholder="Buscar por nombre o teléfono" value={busca} onChange={(e) => setBusca(e.target.value)} />
              <div className="grid gap-1" style={{ maxHeight: 250, overflowY: "auto" }}>
                {coincidencias.map((p) => (
                  <button key={p.id} type="button" onClick={() => setPacienteId(p.id)} className="flex items-center gap-3" style={{ padding: 8, borderRadius: 12, border: `1px solid ${pacienteId === p.id ? "var(--teal)" : "transparent"}`, background: pacienteId === p.id ? "var(--teal-50)" : "transparent", textAlign: "left" }}>
                    <Avatar nombre={p.nombre} size="is-sm" />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--navy)" }}>{p.nombre}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{[edad(p.fecha_nacimiento), p.telefono].filter(Boolean).join(" · ")}</div>
                    </div>
                  </button>
                ))}
              </div>
              {paciente && <span className="chip chip-teal">Seleccionado: {paciente.nombre}</span>}
            </>
          )}
        </div>
        <div className="grid content-start gap-3">
          <label className="field">
            <span>Especialista</span>
            <select className="input" value={medicoId} onChange={(e) => { setMedicoId(e.target.value); setServicioId(""); }} disabled={c.sesion?.rol === "medico" && !c.permisos.agendar_otros}>
              {c.medicos.filter((m) => m.activo).map((m) => <option key={m.id} value={m.id}>{m.nombre} · {m.especialidad}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Servicio</span>
            <select className="input" value={servicioId} onChange={(e) => setServicioId(e.target.value)}>
              <option value="">Elige…</option>
              {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre} · {s.duracion_min} min · {moneda.format(precioDe(s, medico))}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="field"><span>Fecha</span><input type="date" className="input" value={f} onChange={(e) => setF(e.target.value)} /></label>
            <label className="field"><span>Hora</span><input type="time" step={300} className="input" value={h} onChange={(e) => setH(e.target.value)} /></label>
          </div>
          <label className="field">
            <span>Modalidad</span>
            <select className="input" value={modalidad} onChange={(e) => setModalidad(e.target.value as Modalidad)}>
              <option value="presencial">En consultorio</option>
              {medico?.telemedicina && <option value="telemedicina">Telemedicina</option>}
              {medico?.acepta_domicilio && <option value="domicilio">A domicilio</option>}
            </select>
          </label>
          <label className="field"><span>Notas internas</span><input className="input" value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Ej. Viene con estudios previos" /></label>
          {admin && (
            <label className="flex items-center gap-2" style={{ fontSize: 13.5, color: "var(--slate)" }}>
              <input type="checkbox" checked={forzar} onChange={(e) => setForzar(e.target.checked)} /> Permitir encimar o fuera de horario (sobrecupo)
            </label>
          )}
        </div>
      </div>
      {error && <p className="chip chip-danger" style={{ marginTop: 14, height: "auto", padding: "8px 12px", whiteSpace: "normal" }}>{error}</p>}
    </Modal>
  );
}
