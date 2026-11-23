"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  CalendarPlus,
  Check,
  Clock3,
  Download,
  Home,
  MapPin,
  MessageCircle,
  Shuffle,
  Stethoscope,
  Video,
} from "lucide-react";
import { useClinica } from "@/lib/store";
import { slotsDisponibles } from "@/lib/datos/disponibilidad";
import { CATEGORIAS_SERVICIO, celularValido, ETIQUETA_MODALIDAD, type Cita, type Medico, type Modalidad, type Servicio } from "@/lib/datos/modelo";
import { enlaceGoogleCalendar, descargarIcs } from "@/lib/calendario";
import { Logo } from "@/components/marca/Logo";
import { LogoGoogle } from "@/components/marca/LogoGoogle";
import { Avatar, Cargando, claveDia, diaCorto, diaLargo, hora, moneda } from "@/components/ui";
import { QrCita } from "@/components/citas/QrCita";

type Paso = 1 | 2 | 3 | 4;
const PASOS = ["Servicio", "Especialista", "Día y hora", "Tus datos"];

export function FlujoReserva() {
  const c = useClinica();
  const q = useSearchParams();
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>(1);
  const [servicioId, setServicioId] = useState<string | null>(null);
  const [medicoId, setMedicoId] = useState<string | "cualquiera" | null>(null);
  const [modalidad, setModalidad] = useState<Modalidad>("presencial");
  const [dia, setDia] = useState<string | null>(null);
  const [slot, setSlot] = useState<{ t: number; medico: string } | null>(null);
  const [nombre, setNombre] = useState("");
  const [tel, setTel] = useState("");
  const [motivo, setMotivo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hecha, setHecha] = useState<Cita | null>(null);
  const [cat, setCat] = useState<string>("Pediatría");

  const servicios = c.servicios.filter((s) => s.activo);
  const servicio = servicios.find((s) => s.id === servicioId) ?? null;
  const candidatos: Medico[] = useMemo(
    () => c.medicos.filter((m) => m.activo && (!servicio?.medicos?.length || servicio.medicos.includes(m.id))),
    [c.medicos, servicio]
  );

  // Preselección desde la portada (?servicio=… / ?medico=…).
  useEffect(() => {
    if (!c.listo) return;
    const sv = q.get("servicio");
    const md = q.get("medico");
    if (sv && servicios.some((s) => s.id === sv)) {
      setServicioId(sv);
      setCat(servicios.find((s) => s.id === sv)!.categoria);
      setPaso(2);
    }
    if (md && c.medicos.some((m) => m.id === md)) {
      setMedicoId(md);
      const primero = servicios.find((s) => !s.medicos?.length || s.medicos.includes(md));
      if (primero) setCat(primero.categoria);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.listo]);

  useEffect(() => {
    if (c.sesion?.rol === "paciente") setNombre(c.sesion.nombre);
  }, [c.sesion]);

  // Horarios libres de los próximos 14 días, con la duración del servicio.
  const horarios = useMemo(() => {
    if (!servicio || !medicoId) return [] as { t: number; medico: string }[];
    const lista = medicoId === "cualquiera" ? candidatos : candidatos.filter((m) => m.id === medicoId);
    const todos = new Map<number, string>();
    for (const m of lista) {
      if (modalidad === "telemedicina" && !m.telemedicina) continue;
      if (modalidad === "domicilio" && !m.acepta_domicilio) continue;
      const libres = slotsDisponibles(
        {
          medico: { ...m, duracion_cita_min: servicio.duracion_min },
          horario: c.horarioDeMedico(m.id),
          clinica: c.clinicaConfig,
          citas: c.citas,
          eventos: c.eventosGoogle,
        },
        Date.now() + 30 * 60_000,
        14
      );
      for (const d of libres) if (!todos.has(d.getTime())) todos.set(d.getTime(), m.id);
    }
    return [...todos.entries()].sort((a, b) => a[0] - b[0]).map(([t, medico]) => ({ t, medico }));
  }, [servicio, medicoId, candidatos, modalidad, c]);

  const dias = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const h of horarios) mapa.set(claveDia(h.t), (mapa.get(claveDia(h.t)) ?? 0) + 1);
    return [...mapa.entries()];
  }, [horarios]);

  useEffect(() => {
    if (paso === 3 && (!dia || !dias.some(([d]) => d === dia))) setDia(dias[0]?.[0] ?? null);
  }, [paso, dias, dia]);

  if (!c.listo) return <Cargando />;

  const medicoElegido = c.medicos.find((m) => m.id === (slot?.medico ?? medicoId));
  const esPaciente = c.sesion?.rol === "paciente";

  const confirmar = () => {
    setError(null);
    if (!servicio || !slot) return;
    const datos = {
      medico_id: slot.medico,
      servicio_id: servicio.id,
      inicio: new Date(slot.t).toISOString(),
      modalidad,
      motivo: motivo.trim(),
      direccion_domicilio: modalidad === "domicilio" ? direccion : undefined,
    };
    if (esPaciente) {
      const r = c.crearCita(datos);
      if (!r.cita) return setError(r.error ?? "No se pudo reservar.");
      setHecha(r.cita);
    } else {
      if (nombre.trim().length < 3) return setError("Escribe el nombre del paciente.");
      if (!celularValido(tel)) return setError("Escribe un celular válido de 10 dígitos.");
      const r = c.reservarInvitado({ ...datos, nombre, telefono: tel });
      if (!r.cita) return setError(r.error ?? "No se pudo reservar.");
      setHecha(r.cita);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (hecha) return <Confirmacion cita={hecha} esPaciente={esPaciente} onOtra={() => router.refresh()} />;

  const modalidades: Modalidad[] = ["presencial", ...(candidatos.some((m) => m.telemedicina) && servicio?.categoria !== "Vacunación" ? (["telemedicina"] as const) : []), ...(candidatos.some((m) => m.acepta_domicilio) ? (["domicilio"] as const) : [])];

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-2)" }}>
      <header className="wrap flex items-center justify-between" style={{ height: 76 }}>
        <Link href="/">
          <Logo alto={30} />
        </Link>
        <Link href={esPaciente ? "/cuenta" : "/"} className="btn btn-ghost btn-sm">
          <ArrowLeft /> {esPaciente ? "Mi cuenta" : "Portada"}
        </Link>
      </header>

      <div className="wrap grid gap-6 lg:grid-cols-[1fr_340px]" style={{ paddingBottom: 60 }}>
        <div className="card anim-in" style={{ padding: "clamp(18px, 3vw, 32px)", borderRadius: 32 }}>
          <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 26 }}>
            {PASOS.map((p, i) => {
              const n = (i + 1) as Paso;
              const hecho = n < paso;
              return (
                <button
                  key={p}
                  type="button"
                  disabled={n > paso}
                  onClick={() => setPaso(n)}
                  className="flex items-center gap-2"
                  style={{ border: "none", background: "none", padding: 0, color: n === paso ? "var(--navy)" : hecho ? "var(--teal-700)" : "var(--soft)", fontWeight: n === paso ? 600 : 400, fontSize: 14 }}
                >
                  <span style={{ width: 28, height: 28, borderRadius: 28, display: "grid", placeItems: "center", fontSize: 13, background: n === paso ? "var(--grad)" : hecho ? "var(--teal-50)" : "var(--bg-2)", color: n === paso ? "#fff" : undefined }}>
                    {hecho ? <Check size={14} /> : n}
                  </span>
                  <span className="hidden sm:inline">{p}</span>
                  {i < 3 && <span style={{ width: 24, height: 1, background: "var(--line)", margin: "0 4px" }} />}
                </button>
              );
            })}
          </div>

          {paso === 1 && (
            <div className="anim-in">
              <h1 style={{ fontSize: 28 }}>¿Qué necesitas?</h1>
              <p style={{ color: "var(--muted)", marginTop: 4 }}>Elige el servicio; después verás quién lo ofrece y sus horarios.</p>
              <div className="segmented" style={{ marginTop: 18 }}>
                {CATEGORIAS_SERVICIO.filter((k) => servicios.some((s) => s.categoria === k && (!medicoId || medicoId === "cualquiera" || !s.medicos?.length || s.medicos.includes(medicoId)))).map((k) => (
                  <button key={k} type="button" aria-selected={cat === k} onClick={() => setCat(k)}>
                    {k}
                  </button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2" style={{ marginTop: 18 }}>
                {servicios
                  .filter((s) => s.categoria === cat)
                  .map((s: Servicio) => (
                    <button
                      key={s.id}
                      type="button"
                      className="card card-hover"
                      style={{ padding: 18, textAlign: "left", borderColor: servicioId === s.id ? "var(--teal)" : undefined, background: servicioId === s.id ? "var(--teal-50)" : "#fff" }}
                      onClick={() => {
                        setServicioId(s.id);
                        setSlot(null);
                        if (medicoId && medicoId !== "cualquiera" && s.medicos?.length && !s.medicos.includes(medicoId)) setMedicoId(null);
                        setModalidad("presencial");
                        setPaso(2);
                      }}
                    >
                      <div className="flex justify-between gap-3">
                        <b style={{ color: "var(--navy)", fontWeight: 600 }}>{s.nombre}</b>
                        <b style={{ color: "var(--teal-700)", fontWeight: 600 }}>{moneda.format(s.precio)}</b>
                      </div>
                      <p style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 4 }}>{s.descripcion}</p>
                      <span className="chip" style={{ marginTop: 10 }}>
                        <Clock3 /> {s.duracion_min} min
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {paso === 2 && servicio && (
            <div className="anim-in">
              <h1 style={{ fontSize: 28 }}>¿Con quién?</h1>
              <p style={{ color: "var(--muted)", marginTop: 4 }}>{servicio.nombre}</p>
              {modalidades.length > 1 && (
                <div style={{ marginTop: 18 }}>
                  <div className="label" style={{ marginBottom: 8 }}>Modalidad</div>
                  <div className="segmented">
                    {modalidades.map((m) => (
                      <button key={m} type="button" aria-selected={modalidad === m} onClick={() => setModalidad(m)}>
                        {m === "presencial" ? <Stethoscope size={14} style={{ display: "inline", marginRight: 6 }} /> : m === "telemedicina" ? <Video size={14} style={{ display: "inline", marginRight: 6 }} /> : <Home size={14} style={{ display: "inline", marginRight: 6 }} />}
                        {ETIQUETA_MODALIDAD[m]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2" style={{ marginTop: 18 }}>
                {candidatos.length > 1 && (
                  <button type="button" className="card card-hover flex items-center gap-3" style={{ padding: 16, textAlign: "left", borderColor: medicoId === "cualquiera" ? "var(--teal)" : undefined }} onClick={() => { setMedicoId("cualquiera"); setPaso(3); }}>
                    <span className="icon-tile">
                      <Shuffle />
                    </span>
                    <div>
                      <b style={{ color: "var(--navy)", fontWeight: 600 }}>Primero disponible</b>
                      <div style={{ fontSize: 13, color: "var(--muted)" }}>La hora más próxima con cualquier especialista</div>
                    </div>
                  </button>
                )}
                {candidatos
                  .filter((m) => (modalidad === "telemedicina" ? m.telemedicina : modalidad === "domicilio" ? m.acepta_domicilio : true))
                  .map((m) => (
                    <button key={m.id} type="button" className="card card-hover flex items-center gap-3" style={{ padding: 16, textAlign: "left", borderColor: medicoId === m.id ? "var(--teal)" : undefined, background: medicoId === m.id ? "var(--teal-50)" : "#fff" }} onClick={() => { setMedicoId(m.id); setSlot(null); setPaso(3); }}>
                      <Avatar nombre={m.nombre} color={m.color} size="is-lg" />
                      <div>
                        <b style={{ color: "var(--navy)", fontWeight: 600 }}>{m.nombre}</b>
                        <div style={{ fontSize: 13, color: "var(--teal-700)" }}>{m.especialidad}</div>
                        <div style={{ fontSize: 12, color: "var(--soft)" }}>Céd. {m.cedula} · {m.experiencia} años</div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {paso === 3 && servicio && (
            <div className="anim-in">
              <h1 style={{ fontSize: 28 }}>Elige día y hora</h1>
              <p style={{ color: "var(--muted)", marginTop: 4 }}>Horarios en tiempo real · hora del centro de México</p>
              {dias.length === 0 ? (
                <div className="empty">No hay horarios libres en los próximos 14 días. Prueba con otro especialista o escríbenos por WhatsApp.</div>
              ) : (
                <>
                  <div className="flex gap-2 overflow-x-auto" style={{ marginTop: 18, paddingBottom: 6 }}>
                    {dias.map(([d, n]) => {
                      const t = horarios.find((h) => claveDia(h.t) === d)!.t;
                      const [sem, num, mes] = diaCorto(t).split(" ");
                      return (
                        <button key={d} type="button" onClick={() => { setDia(d); setSlot(null); }} style={{ flex: "none", width: 74, padding: "10px 0", borderRadius: 18, border: `1px solid ${dia === d ? "transparent" : "var(--line)"}`, background: dia === d ? "var(--grad)" : "#fff", color: dia === d ? "#fff" : "var(--navy)", boxShadow: dia === d ? "var(--shadow-teal)" : undefined }}>
                          <div style={{ fontSize: 12, textTransform: "capitalize", opacity: 0.8 }}>{sem}</div>
                          <div style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.1 }}>{num}</div>
                          <div style={{ fontSize: 11.5, opacity: 0.8 }}>{mes}</div>
                          <div style={{ fontSize: 10.5, marginTop: 3, opacity: 0.75 }}>{n} libres</div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5" style={{ marginTop: 18 }}>
                    {horarios
                      .filter((h) => claveDia(h.t) === dia)
                      .map((h) => (
                        <button key={h.t} type="button" className="btn" style={{ borderRadius: 14, border: "1px solid var(--line)", background: slot?.t === h.t ? "var(--teal)" : "#fff", color: slot?.t === h.t ? "#fff" : "var(--navy)" }} onClick={() => setSlot(h)}>
                          {hora(h.t)}
                        </button>
                      ))}
                  </div>
                  {medicoId === "cualquiera" && slot && (
                    <p style={{ marginTop: 12, fontSize: 14, color: "var(--muted)" }}>
                      Te atenderá <b style={{ color: "var(--navy)" }}>{c.medicos.find((m) => m.id === slot.medico)?.nombre}</b>.
                    </p>
                  )}
                  <button type="button" className="btn btn-grad btn-lg" style={{ marginTop: 22 }} disabled={!slot} onClick={() => setPaso(4)}>
                    Continuar <ArrowRight />
                  </button>
                </>
              )}
            </div>
          )}

          {paso === 4 && servicio && slot && (
            <div className="anim-in grid gap-4" style={{ maxWidth: 560 }}>
              <div>
                <h1 style={{ fontSize: 28 }}>{esPaciente ? "Confirma tu cita" : "Tus datos"}</h1>
                <p style={{ color: "var(--muted)", marginTop: 4 }}>
                  {esPaciente ? `Agendando como ${c.sesion!.nombre}.` : "Sin contraseñas: sólo nombre y celular. Te mandamos la confirmación por WhatsApp."}
                </p>
              </div>
              {!esPaciente && (
                <>
                  <Link href="/google/autorizar?modo=login&siguiente=/reservar" className="btn btn-ghost">
                    <LogoGoogle /> Continuar con Google
                  </Link>
                  <label className="field">
                    <span>Nombre del paciente</span>
                    <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Mateo Ramírez" autoComplete="name" />
                    <small>Si es un menor, escribe su nombre; el tutor queda con el celular.</small>
                  </label>
                  <label className="field">
                    <span>Celular</span>
                    <input className="input" value={tel} onChange={(e) => setTel(e.target.value)} placeholder="55 1234 5678" inputMode="tel" autoComplete="tel" />
                  </label>
                </>
              )}
              {modalidad === "domicilio" && (
                <label className="field">
                  <span>Dirección para la visita</span>
                  <input className="input" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Calle, número, colonia" />
                </label>
              )}
              <label className="field">
                <span>Motivo de consulta (opcional)</span>
                <textarea className="input" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ej. Le tocan sus vacunas del año / fiebre desde ayer" maxLength={400} />
              </label>
              {error && <p className="chip chip-danger" style={{ height: "auto", padding: "8px 12px", whiteSpace: "normal" }}>{error}</p>}
              <button type="button" className="btn btn-grad btn-lg" onClick={confirmar}>
                <CalendarCheck2 /> Confirmar cita
              </button>
            </div>
          )}
        </div>

        <aside className="anim-in" style={{ animationDelay: "120ms" }}>
          <div className="credencial" style={{ position: "sticky", top: 20 }}>
            <div style={{ fontSize: 12.5, opacity: 0.8, textTransform: "uppercase", letterSpacing: ".06em" }}>Resumen</div>
            <div style={{ fontSize: 20, fontWeight: 600, marginTop: 8 }}>{servicio?.nombre ?? "Elige un servicio"}</div>
            <div className="grid gap-3" style={{ marginTop: 18, fontSize: 14 }}>
              <div className="flex items-center gap-3">
                <Stethoscope size={17} /> {medicoElegido?.nombre ?? (medicoId === "cualquiera" ? "Primero disponible" : "Especialista por elegir")}
              </div>
              <div className="flex items-center gap-3">
                <CalendarPlus size={17} /> {slot ? `${diaLargo(slot.t)} · ${hora(slot.t)}` : "Día y hora por elegir"}
              </div>
              <div className="flex items-center gap-3">
                {modalidad === "telemedicina" ? <Video size={17} /> : <MapPin size={17} />} {ETIQUETA_MODALIDAD[modalidad]}
              </div>
            </div>
            <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.2)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ opacity: 0.8 }}>Total a pagar en clínica</span>
              <b style={{ fontSize: 26 }}>{servicio ? moneda.format(servicio.precio) : "—"}</b>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Confirmacion({ cita, esPaciente, onOtra }: { cita: Cita; esPaciente: boolean; onOtra: () => void }) {
  const c = useClinica();
  const wa = c.clinicaConfig.whatsapp.replace(/\D/g, "");
  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-2)", padding: "24px 0 60px" }}>
      <div className="wrap" style={{ maxWidth: 720 }}>
        <Link href="/">
          <Logo alto={30} />
        </Link>
        <div className="card anim-in" style={{ marginTop: 24, borderRadius: 32, overflow: "hidden" }}>
          <div className="band" style={{ borderRadius: 0, padding: "36px 28px", textAlign: "center" }}>
            <span style={{ width: 64, height: 64, borderRadius: 64, background: "#fff", color: "var(--teal)", display: "inline-grid", placeItems: "center", boxShadow: "0 0 0 10px rgba(255,255,255,.18)" }}>
              <Check size={32} />
            </span>
            <h1 style={{ fontSize: 30, marginTop: 18 }}>¡Cita confirmada!</h1>
            <p style={{ opacity: 0.9, marginTop: 6 }}>
              {diaLargo(cita.inicio)} · {hora(cita.inicio)} h
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-[1fr_auto]" style={{ padding: 28 }}>
            <div className="grid gap-2" style={{ fontSize: 14.5 }}>
              <div><span style={{ color: "var(--muted)" }}>Paciente:</span> <b style={{ fontWeight: 600 }}>{cita.paciente_nombre}</b></div>
              <div><span style={{ color: "var(--muted)" }}>Servicio:</span> {cita.servicio_nombre}</div>
              <div><span style={{ color: "var(--muted)" }}>Especialista:</span> {cita.medico_nombre}</div>
              <div><span style={{ color: "var(--muted)" }}>Modalidad:</span> {ETIQUETA_MODALIDAD[cita.modalidad]}</div>
              <div><span style={{ color: "var(--muted)" }}>Total:</span> <b style={{ fontWeight: 600 }}>{moneda.format(cita.precio)}</b> en recepción</div>
              {cita.enlace_video && (
                <a href={cita.enlace_video} target="_blank" rel="noreferrer" className="chip chip-violet" style={{ marginTop: 6, width: "fit-content" }}>
                  <Video /> {cita.enlace_video.replace("https://", "")}
                </a>
              )}
              <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>
                {cita.modalidad === "telemedicina" ? "Entra a la videollamada 5 minutos antes." : "Muestra este código en recepción al llegar: se confirma tu asistencia en un segundo."}
              </p>
            </div>
            <div style={{ justifySelf: "center" }}>
              <QrCita id={cita.id} />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3" style={{ padding: "0 28px 28px" }}>
            <a className="btn btn-primary" href={enlaceGoogleCalendar(cita, c.clinicaConfig)} target="_blank" rel="noreferrer">
              <CalendarPlus /> Google Calendar
            </a>
            <button type="button" className="btn btn-ghost" onClick={() => descargarIcs(cita, c.clinicaConfig)}>
              <Download /> Apple / Outlook
            </button>
            <a className="btn btn-ghost" href={`https://wa.me/52${wa}?text=${encodeURIComponent(`Hola, agendé ${cita.servicio_nombre} para ${cita.paciente_nombre} el ${diaLargo(cita.inicio)} a las ${hora(cita.inicio)}.`)}`} target="_blank" rel="noreferrer">
              <MessageCircle /> WhatsApp
            </a>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2" style={{ marginTop: 18 }}>
          {esPaciente ? (
            <Link href="/cuenta" className="btn btn-dark">Ir a mi cuenta</Link>
          ) : (
            <Link href={`/login?rol=paciente`} className="btn btn-dark">Crear mi cuenta para ver mi expediente</Link>
          )}
          <button type="button" className="btn btn-ghost" onClick={() => { onOtra(); window.location.href = "/reservar"; }}>
            Agendar otra cita
          </button>
        </div>
      </div>
    </div>
  );
}
