"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BellRing,
  CalendarCheck2,
  CalendarHeart,
  Check,
  Clock3,
  FileHeart,
  Gift,
  HeartPulse,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  Video,
} from "lucide-react";
import { useClinica } from "@/lib/store";
import { crearSemilla } from "@/lib/datos/semilla";
import { enZona } from "@/lib/datos/disponibilidad";
import { CATEGORIAS_SERVICIO, DIAS_SEMANA, type ClinicaConfig, type Servicio } from "@/lib/datos/modelo";
import { Logo } from "@/components/marca/Logo";
import { Avatar, moneda, Reveal } from "@/components/ui";
import { TelefonoInicio, TelefonoPanel, TelefonoPaso } from "@/components/portada/Mockups";

function abiertoAhora(cfg: ClinicaConfig) {
  const z = enZona(Date.now());
  const b = cfg.horario[z.diaSemana];
  if (!b?.activo) return { abierto: false, texto: "Cerrado hoy" };
  const [ha, ma] = b.inicio.split(":").map(Number);
  const [hb, mb] = b.fin.split(":").map(Number);
  const abierto = z.minutos >= ha * 60 + ma && z.minutos < hb * 60 + mb;
  return { abierto, texto: abierto ? `Abierto · cierra ${b.fin}` : z.minutos < ha * 60 + ma ? `Abre hoy a las ${b.inicio}` : "Cerrado · abre mañana" };
}

const ICONO_CATEGORIA: Record<string, React.ReactNode> = {
  Pediatría: <HeartPulse />,
  Vacunación: <Syringe />,
  Consulta: <Stethoscope />,
  Especialidad: <CalendarHeart />,
  Estudios: <FileHeart />,
  Telemedicina: <Video />,
  Paquete: <Sparkles />,
};

const FAQ = [
  ["¿Necesito crear una cuenta para agendar?", "No. Puedes reservar sólo con tu nombre y celular. Si creas tu cuenta (o entras con Google) verás tu expediente, recetas, cartilla de vacunación y podrás reagendar tú mismo."],
  ["¿Cómo funciona la vacuna de primer año?", "A los 12 meses corresponden SRP (triple viral), varicela, hepatitis A y el refuerzo de neumococo. Revisamos la cartilla de tu bebé, aplicamos en una sola visita y queda registrado en su cartilla digital."],
  ["¿Puedo agregar mi cita a Google Calendar?", "Sí. Al confirmar te damos un botón para agregarla a tu Google Calendar con la dirección y el enlace de videollamada si es teleconsulta. Nuestros médicos también sincronizan su agenda con Google."],
  ["¿Atienden por videollamada?", "Sí, en medicina general, pediatría, ginecología y nutrición. Recibes el enlace de la sala al reservar y tu receta digital al terminar."],
  ["¿Qué formas de pago aceptan?", "Efectivo, tarjeta de débito o crédito y transferencia en recepción. El pago en línea está disponible en la versión con pasarela conectada."],
];

export function Portada() {
  const c = useClinica();
  const base = useMemo(() => (c.listo ? null : crearSemilla()), [c.listo]);
  const clinica = c.listo ? c.clinicaConfig : base!.clinica;
  const medicos = (c.listo ? c.medicos : base!.medicos).filter((m) => m.activo);
  const servicios = (c.listo ? c.servicios : base!.servicios).filter((s) => s.activo);
  const lealtad = c.listo ? c.recompensasConfig : base!.recompensas;

  const [scroll, setScroll] = useState(false);
  const [estado, setEstado] = useState<{ abierto: boolean; texto: string } | null>(null);
  const categorias = CATEGORIAS_SERVICIO.filter((k) => servicios.some((s) => s.categoria === k));
  const [cat, setCat] = useState<string>("Pediatría");

  useEffect(() => {
    const f = () => setScroll(window.scrollY > 12);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => {
    setEstado(abiertoAhora(clinica));
    const t = window.setInterval(() => setEstado(abiertoAhora(clinica)), 60_000);
    return () => window.clearInterval(t);
  }, [clinica]);

  const wa = clinica.whatsapp.replace(/\D/g, "");
  const panel = c.sesion ? (c.sesion.rol === "admin" ? "/dashboard/admin" : c.sesion.rol === "medico" ? "/dashboard/medico" : "/cuenta") : null;
  const hoy = estado ? enZona(Date.now()).diaSemana : null;

  return (
    <div className="site">
      {/* Formas decorativas de fondo, como globos de diálogo suaves */}
      <svg className="blob" style={{ left: -140, top: 40, width: 420 }} viewBox="0 0 400 520" aria-hidden>
        <path d="M60 0h220c66 0 120 54 120 120v100c0 66-54 120-120 120H170l-80 90 10-90H60C27 340 0 313 0 280V60C0 27 27 0 60 0Z" fill="#EEF4F6" />
      </svg>
      <svg className="blob" style={{ right: -160, top: 980, width: 380 }} viewBox="0 0 400 520" aria-hidden>
        <path d="M340 0H120C54 0 0 54 0 120v100c0 66 54 120 120 120h110l80 90-10-90h40c33 0 60-27 60-60V60c0-33-27-60-60-60Z" fill="#E8F6F6" />
      </svg>

      <header className={`site-nav ${scroll ? "is-scrolled" : ""}`}>
        <div className="wrap">
          <Link href="/" aria-label="Inicio">
            <Logo alto={34} />
          </Link>
          <nav aria-label="Secciones">
            <a href="#servicios">Servicios</a>
            <a href="#especialistas">Especialistas</a>
            <a href="#vacunacion">Vacunación</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#visitanos">Visítanos</a>
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Link href={panel ?? "/login"} className="btn btn-ghost btn-sm hidden sm:inline-flex">
              {panel ? "Mi panel" : "Iniciar sesión"}
            </Link>
            <Link href="/reservar" className="btn btn-grad btn-sm">
              Agendar cita
            </Link>
          </div>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="wrap">
          <div className="band hero-band">
            <div className="anim-in" style={{ position: "relative", zIndex: 2 }}>
              {estado && (
                <span className="chip" style={{ background: "rgba(255,255,255,.16)", color: "#fff", marginBottom: 22 }}>
                  <span className="dot" style={{ color: estado.abierto ? "#7dffc9" : "#ffd28a" }} />
                  {clinica.nombre} · {estado.texto}
                </span>
              )}
              <h1>
                Consultas sin filas,
                <br />
                <em>nunca más.</em>
              </h1>
              <p className="hero-lead">
                Agenda en línea con pediatras, médicos generales y especialistas. Recordatorios por WhatsApp, expediente digital y la cartilla de
                vacunación de tus hijos siempre contigo.
              </p>
              <div className="flex flex-wrap gap-3" style={{ marginTop: 30 }}>
                <Link href="/reservar" className="btn btn-white btn-lg">
                  Agendar mi cita <ArrowRight />
                </Link>
                <a href="#servicios" className="btn btn-outline-white btn-lg">
                  Ver servicios
                </a>
              </div>
              <div className="hero-stats">
                <div>
                  <b>{medicos.length}</b>
                  <span>especialistas</span>
                </div>
                <div>
                  <b>{servicios.length}</b>
                  <span>servicios en línea</span>
                </div>
                <div>
                  <b>60 s</b>
                  <span>para agendar</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div style={{ position: "absolute", left: "50%", top: 0, transform: "translateX(-40%)" }} className="anim-in">
                <TelefonoInicio />
              </div>
              <div className="burbuja" style={{ left: "-2%", top: 70 }}>
                <i>
                  <Check />
                </i>
                <div>
                  <b>Cita confirmada</b>
                  <small>Revisión pediátrica · Jue 10:30</small>
                </div>
              </div>
              <div className="burbuja" style={{ left: "4%", top: 250, animationDelay: "-2s" }}>
                <i style={{ background: "#25D366" }}>
                  <MessageCircle />
                </i>
                <div>
                  <b>Recordatorio enviado</b>
                  <small>WhatsApp · 24 h antes</small>
                </div>
              </div>
              <div className="burbuja" style={{ right: "-3%", top: 330, animationDelay: "-4s" }}>
                <i style={{ background: "#4285F4" }}>
                  <CalendarCheck2 />
                </i>
                <div>
                  <b>En tu Google Calendar</b>
                  <small>Sincronizado al instante</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Beneficios ---------- */}
      <section className="section" style={{ paddingTop: 60 }}>
        <div className="wrap grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="relative order-2 lg:order-1" >
            <div style={{ position: "relative", height: 560, display: "grid", placeItems: "center" }}>
              <div style={{ position: "absolute", right: "6%", top: 40, width: "70%", height: 440, borderRadius: 44, background: "var(--grad-band)" }} />
              <div style={{ position: "absolute", left: "4%", bottom: 30, width: 170, height: 170, borderRadius: "40px 40px 40px 0", background: "var(--navy)" }} />
              <div style={{ position: "absolute", left: "13%", bottom: 96, width: 90, height: 90, borderRadius: 30, background: "#fff" }} />
              <div style={{ position: "relative", transform: "rotate(-4deg)" }}>
                <TelefonoPanel />
              </div>
            </div>
          </Reveal>
          <div className="order-1 lg:order-2">
            <Reveal>
              <span className="eyebrow">
                <i>
                  <Plus />
                </i>
                Pensado para familias
              </span>
              <h2 className="section-title" style={{ marginTop: 16 }}>
                <em>Paciente</em>, deja el papeleo con nosotros.
              </h2>
              <p className="section-lead">Tú sólo preocúpate por sentirte mejor; de lo demás se encarga la clínica.</p>
            </Reveal>
            <div className="grid gap-3" style={{ marginTop: 28 }}>
              {[
                [<CalendarHeart key="1" />, "Agenda en 60 segundos", "Elige servicio, especialista y hora disponible en tiempo real. Sin llamadas ni esperas."],
                [<BellRing key="2" />, "Recordatorios automáticos", "Te avisamos por WhatsApp 24 horas antes y puedes cancelar o reagendar con un toque."],
                [<FileHeart key="3" />, "Expediente y recetas digitales", "Diagnósticos, signos vitales y recetas de cada consulta, siempre disponibles en tu cuenta."],
                [<Syringe key="4" />, "Cartilla de vacunación digital", "Sabes qué vacuna le toca a tus hijos y cuándo. Te recordamos las siguientes dosis."],
              ].map(([icono, t, d], i) => (
                <Reveal key={i} delay={i * 90}>
                  <div className="feature">
                    <span className="icon-tile">{icono}</span>
                    <div>
                      <h3>{t}</h3>
                      <p>{d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Servicios ---------- */}
      <section className="section" id="servicios" style={{ background: "var(--bg-2)", borderRadius: 48, margin: "0 12px" }}>
        <div className="wrap">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="section-head">
              <h2 className="section-title">
                Servicios para <em>cada etapa</em> de la vida
              </h2>
              <p className="section-lead">Precios claros y duración de cada consulta. Reserva el que necesites en línea.</p>
            </div>
            <div className="segmented" role="tablist" aria-label="Categoría">
              {categorias.map((k) => (
                <button key={k} type="button" role="tab" aria-selected={cat === k} onClick={() => setCat(k)}>
                  {k}
                </button>
              ))}
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ marginTop: 34 }}>
            {servicios
              .filter((s) => s.categoria === cat)
              .map((s: Servicio, i) => (
                <div key={s.id} className="servicio-card anim-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-start justify-between gap-3">
                    <span className="icon-tile">{ICONO_CATEGORIA[s.categoria] ?? <Stethoscope />}</span>
                    <span className="chip">
                      <Clock3 /> {s.duracion_min} min
                    </span>
                  </div>
                  <h3 style={{ fontSize: 18, marginTop: 6 }}>{s.nombre}</h3>
                  <p style={{ color: "var(--muted)", fontSize: 14, flex: 1 }}>{s.descripcion}</p>
                  <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
                    <span className="precio">
                      {s.desde && <small style={{ fontSize: 13, color: "var(--muted)", fontWeight: 400 }}>desde </small>}
                      {moneda.format(s.precio)}
                    </span>
                    <Link href={`/reservar?servicio=${s.id}`} className="btn btn-soft btn-sm">
                      Agendar <ArrowRight />
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ---------- Vacunación ---------- */}
      <section className="section" id="vacunacion">
        <div className="wrap grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <span className="eyebrow">
              <i>
                <Syringe />
              </i>
              Módulo de vacunación
            </span>
            <h2 className="section-title" style={{ marginTop: 16 }}>
              La <em>vacuna de primer año</em>, sin estrés.
            </h2>
            <p className="section-lead">
              Red de frío certificada, enfermera especializada y la cartilla digital de tu bebé actualizada al momento. Te avisamos cuando toque la
              siguiente dosis.
            </p>
            <div className="flex flex-wrap gap-3" style={{ marginTop: 26 }}>
              <Link href="/reservar?servicio=srv-vacuna-1anio" className="btn btn-grad btn-lg">
                Agendar vacuna <ArrowRight />
              </Link>
              <Link href="/reservar?servicio=srv-revision-ped" className="btn btn-ghost btn-lg">
                Revisión pediátrica
              </Link>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="card card-pad" style={{ borderRadius: 32, padding: 28 }}>
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: 17 }}>Esquema del primer año</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>Referencia simplificada · tu pediatra confirma cada dosis</div>
                </div>
                <span className="chip chip-mint">
                  <ShieldCheck /> Red de frío
                </span>
              </div>
              <div style={{ position: "relative", marginTop: 26, paddingLeft: 28 }}>
                <div style={{ position: "absolute", left: 9, top: 6, bottom: 6, width: 2, background: "linear-gradient(var(--aqua), var(--mint))", borderRadius: 2 }} />
                {[
                  ["Al nacer", "BCG · Hepatitis B"],
                  ["2 meses", "Hexavalente · Rotavirus · Neumococo"],
                  ["4 meses", "Hexavalente · Rotavirus · Neumococo"],
                  ["6 meses", "Hexavalente · Influenza"],
                  ["12 meses", "SRP · Varicela · Hepatitis A · Neumococo"],
                  ["18 meses", "Refuerzo hexavalente"],
                ].map(([edad, v], i) => (
                  <div key={edad} style={{ position: "relative", paddingBottom: i === 5 ? 0 : 18 }}>
                    <span style={{ position: "absolute", left: -26, top: 3, width: 16, height: 16, borderRadius: 16, background: i === 4 ? "var(--teal)" : "#fff", border: "3px solid var(--teal)", boxShadow: i === 4 ? "0 0 0 6px var(--teal-50)" : undefined }} />
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <b style={{ color: i === 4 ? "var(--teal-700)" : "var(--navy)", fontWeight: 600, minWidth: 74 }}>{edad}</b>
                      <span style={{ color: "var(--muted)", fontSize: 14 }}>{v}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Especialistas ---------- */}
      <section className="section" id="especialistas" style={{ paddingTop: 30 }}>
        <div className="wrap">
          <Reveal className="section-head is-center">
            <h2 className="section-title">
              Nuestro <em>equipo médico</em>
            </h2>
            <p className="section-lead">Especialistas certificados, con cédula profesional verificada y agenda en línea.</p>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" style={{ marginTop: 40 }}>
            {medicos.map((m, i) => (
              <Reveal key={m.id} delay={i * 80}>
                <div className="medico-card">
                  <div className="medico-foto" style={{ background: `linear-gradient(150deg, color-mix(in srgb, ${m.color} 18%, #fff), color-mix(in srgb, ${m.color} 42%, #fff))` }}>
                    <svg viewBox="0 0 200 170" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden>
                      <circle cx="170" cy="20" r="60" fill="#fff" opacity=".35" />
                      <circle cx="20" cy="160" r="40" fill="#fff" opacity=".25" />
                    </svg>
                    <Avatar nombre={m.nombre} color={m.color} size="is-xl" />
                    {m.telemedicina && (
                      <span className="chip" style={{ position: "absolute", left: 12, bottom: 12, background: "#fff" }}>
                        <Video /> Teleconsulta
                      </span>
                    )}
                  </div>
                  <div style={{ padding: 18 }}>
                    <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: 16.5 }}>{m.nombre}</div>
                    <div style={{ color: "var(--teal-700)", fontSize: 14 }}>{m.especialidad}</div>
                    <div style={{ color: "var(--soft)", fontSize: 12.5, marginTop: 6 }}>
                      Céd. prof. {m.cedula} · {m.experiencia} años
                    </div>
                    <Link href={`/reservar?medico=${m.id}`} className="btn btn-soft btn-sm" style={{ marginTop: 14, width: "100%" }}>
                      Agendar con {m.nombre.split(" ")[0]} {m.nombre.split(" ")[1]}
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Cómo funciona ---------- */}
      <section className="section" id="como-funciona" style={{ paddingTop: 30 }}>
        <div className="wrap">
          <div className="band" style={{ paddingBottom: 0 }}>
            <Reveal className="text-center" >
              <h2 className="section-title" style={{ color: "#fff", padding: "64px 20px 0", maxWidth: 760, margin: "0 auto" }}>
                <span style={{ color: "var(--navy)" }}>Paciente</span>, tu cita confirmada en pocos clics…
              </h2>
            </Reveal>
            <div className="pasos">
              <div className="pasos-linea" />
              <div className="grid gap-10 md:grid-cols-3">
                {(
                  [
                    [1, "Elige servicio y especialista"],
                    [2, "Escoge día y hora"],
                    [3, "Recibe tu confirmación"],
                  ] as const
                ).map(([n, t], i) => (
                  <Reveal key={n} delay={i * 140} className="text-center">
                    <div className="paso-num">{n}</div>
                    <div className="paso-label">{t}</div>
                    <div style={{ display: "flex", justifyContent: "center", marginTop: 26, height: 300, overflow: "hidden", maskImage: "linear-gradient(#000 70%, transparent)" }}>
                      <TelefonoPaso paso={n} />
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Lealtad (sólo si el programa está encendido) ---------- */}
      {lealtad.activa && (
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="wrap">
            <Reveal className="card card-pad flex flex-wrap items-center justify-between gap-6" >
              <div className="flex items-center gap-4">
                <span className="icon-tile">
                  <Gift />
                </span>
                <div>
                  <h3 style={{ fontSize: 20 }}>Tarjeta Vitalia</h3>
                  <p style={{ color: "var(--muted)" }}>
                    Cada {lealtad.citas_requeridas} consultas atendidas te ganas {lealtad.valor_descuento}% de descuento en la siguiente.
                  </p>
                </div>
              </div>
              <Link href="/login" className="btn btn-grad">
                Obtener mi tarjeta
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* ---------- Visítanos ---------- */}
      <section className="section" id="visitanos" style={{ paddingTop: 30 }}>
        <div className="wrap grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <Reveal className="card card-pad" >
            <h2 className="section-title" style={{ fontSize: 34 }}>
              <em>Visítanos</em>
            </h2>
            <p style={{ color: "var(--muted)", marginTop: 8 }}>{clinica.descripcion}</p>
            <div className="grid gap-3" style={{ marginTop: 22 }}>
              <div className="flex gap-3">
                <span className="icon-tile is-sm is-soft">
                  <MapPin />
                </span>
                <span style={{ fontSize: 14.5 }}>{clinica.direccion}</span>
              </div>
              <div className="flex gap-3">
                <span className="icon-tile is-sm is-soft">
                  <Phone />
                </span>
                <span style={{ fontSize: 14.5 }}>
                  {clinica.telefono} · {clinica.email}
                </span>
              </div>
            </div>
            <div style={{ marginTop: 22, borderTop: "1px solid var(--line-2)", paddingTop: 14 }}>
              {DIAS_SEMANA.map((d) => {
                const b = clinica.horario[d.id];
                return (
                  <div key={d.id} className="flex justify-between" style={{ padding: "6px 0", fontSize: 14, color: hoy === d.id ? "var(--teal-700)" : "var(--slate)", fontWeight: hoy === d.id ? 600 : 400 }}>
                    <span>{d.label}</span>
                    <span className="tnum">{b.activo ? `${b.inicio} – ${b.fin}` : "Cerrado"}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2" style={{ marginTop: 20 }}>
              <a href={`tel:${clinica.telefono.replace(/\s/g, "")}`} className="btn btn-ghost">
                <Phone /> Llamar
              </a>
              <a href={`https://wa.me/52${wa}`} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ background: "#1faa59", boxShadow: "none" }}>
                <MessageCircle /> WhatsApp
              </a>
              <a href={clinica.mapa_url} target="_blank" rel="noreferrer" className="btn btn-soft">
                <MapPin /> Cómo llegar
              </a>
            </div>
          </Reveal>
          <Reveal delay={120} className="card" >
            <iframe
              title="Mapa de la clínica"
              src={`https://www.google.com/maps?q=${encodeURIComponent(clinica.direccion)}&output=embed`}
              style={{ width: "100%", height: "100%", minHeight: 420, border: 0, borderRadius: 24, display: "block" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        </div>
      </section>

      {/* ---------- Preguntas ---------- */}
      <section className="section" style={{ paddingTop: 40 }}>
        <div className="wrap grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <h2 className="section-title">
              Preguntas <em>frecuentes</em>
            </h2>
            <p className="section-lead">¿Tienes otra duda? Escríbenos por WhatsApp y te respondemos en minutos.</p>
          </Reveal>
          <Reveal className="faq" delay={100}>
            {FAQ.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <Plus />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      <footer className="site-footer">
        <div className="wrap grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo alto={34} blanco />
            <p style={{ marginTop: 16, fontSize: 14, maxWidth: 320 }}>
              {clinica.nombre}: {clinica.eslogan.toLowerCase()}. Sitio y sistema de gestión impulsados por Medical OS.
            </p>
          </div>
          <div>
            <h4>Pacientes</h4>
            <div className="grid gap-2" style={{ fontSize: 14 }}>
              <Link href="/reservar">Agendar cita</Link>
              <Link href="/login">Mi cuenta</Link>
              <a href="#vacunacion">Vacunación</a>
            </div>
          </div>
          <div>
            <h4>Clínica</h4>
            <div className="grid gap-2" style={{ fontSize: 14 }}>
              <a href="#especialistas">Especialistas</a>
              <a href="#servicios">Servicios</a>
              <a href="#visitanos">Ubicación</a>
            </div>
          </div>
          <div>
            <h4>Equipo</h4>
            <div className="grid gap-2" style={{ fontSize: 14 }}>
              <Link href="/login?rol=admin">Administración</Link>
              <Link href="/login?rol=medico">Acceso médico</Link>
            </div>
          </div>
        </div>
        <div className="wrap flex flex-wrap justify-between gap-3" style={{ marginTop: 40, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,.1)", fontSize: 13 }}>
          <span>© {new Date().getFullYear()} {clinica.nombre}. Datos de demostración.</span>
          <span>Medical OS por Partum Design</span>
        </div>
      </footer>
    </div>
  );
}
