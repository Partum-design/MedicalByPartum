"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Building2,
  CalendarCheck2,
  CalendarDays,
  Check,
  CreditCard,
  FileHeart,
  Gift,
  Megaphone,
  MessageCircle,
  Plus,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  User,
  Video,
} from "lucide-react";
import { useClinica } from "@/lib/store";
import { Logo } from "@/components/marca/Logo";
import { Reveal } from "@/components/ui";
import { TelefonoInicio, TelefonoPanel, TelefonoPaso } from "@/components/portada/Mockups";

/** Correo de ventas para cotizaciones Enterprise: cámbialo por el definitivo. */
const VENTAS = "hola@partumdesign.com.mx";

const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

const MODULOS: [React.ReactNode, string, string][] = [
  [<CalendarDays key="a" />, "Agenda y reservas en línea", "Tus pacientes reservan 24/7 desde tu enlace. Horarios por médico, bloqueos y cero empalmes."],
  [<FileHeart key="b" />, "Expediente clínico", "Notas de consulta, signos vitales, diagnósticos y recetas digitales en el historial de cada paciente."],
  [<BellRing key="c" />, "Recordatorios automáticos", "WhatsApp y SMS 24 horas antes. El paciente confirma, cancela o reagenda con un toque."],
  [<Video key="d" />, "Telemedicina", "Videollamada creada en automático para cada teleconsulta, con receta digital al terminar."],
  [<CreditCard key="e" />, "Caja y cobros", "Efectivo, tarjeta y transferencia. Corte de caja diario y pagos ligados a cada cita."],
  [<Syringe key="f" />, "Cartilla de vacunación", "Esquema por paciente, próximas dosis y avisos a los papás cuando toca la siguiente."],
  [<Gift key="g" />, "Programa de lealtad", "Tarjeta digital con descuentos por visitas. Tú defines las reglas y las recompensas."],
  [<BarChart3 key="h" />, "Reportes", "Ingresos, ocupación por médico, inasistencias y servicios más pedidos, en tiempo real."],
  [<Megaphone key="i" />, "Marketing", "Campañas a tus pacientes por segmento: reactivación, cumpleaños y recordatorios de control."],
  [<CalendarCheck2 key="j" />, "Google Calendar", "Cada médico sincroniza su agenda y los pacientes agregan su cita a su calendario."],
];

const PANELES = [
  {
    icono: <Building2 />,
    titulo: "Administración",
    texto: "Configura servicios, precios, horarios y equipo. Lleva la caja, revisa reportes y lanza campañas desde un solo lugar.",
    puntos: ["Equipo, roles y permisos", "Caja y corte diario", "Reportes y marketing"],
    href: "/login?rol=admin",
    cta: "Ver panel de administración",
  },
  {
    icono: <Stethoscope />,
    titulo: "Médicos",
    texto: "Cada médico ve su agenda del día, confirma llegadas, consulta el expediente y emite recetas sin papel.",
    puntos: ["Agenda del día y llegadas", "Expediente y recetas", "Sincronía con Google"],
    href: "/login?rol=medico",
    cta: "Ver panel médico",
  },
  {
    icono: <User />,
    titulo: "Pacientes",
    texto: "Tus pacientes agendan en un minuto, reciben recordatorios y consultan sus citas, recetas y cartilla desde su celular.",
    puntos: ["Reserva sin llamadas", "Recordatorios por WhatsApp", "Historial y tarjeta de lealtad"],
    href: "/reservar",
    cta: "Ver reserva de pacientes",
  },
];

type Plan = {
  id: string;
  nombre: string;
  descripcion: string;
  precioMensual: number | null;
  destacado?: boolean;
  features: string[];
};

const PLANES: Plan[] = [
  {
    id: "esencial",
    nombre: "Esencial",
    descripcion: "Para el consultorio de un solo médico que quiere dejar de agendar por teléfono.",
    precioMensual: 990,
    features: [
      "1 médico activo",
      "Agenda en línea con bloqueo anti-scalping",
      "Pago con tarjeta (Stripe) y efectivo en clínica",
      "Verificación de pacientes por WhatsApp/SMS",
      "Recordatorios automáticos de cita",
    ],
  },
  {
    id: "profesional",
    nombre: "Profesional",
    descripcion: "Para clínicas con varios especialistas que quieren fidelizar pacientes.",
    precioMensual: 1990,
    destacado: true,
    features: [
      "Hasta 5 médicos activos",
      "Todo lo del plan Esencial",
      "Telemedicina con videollamada automática",
      "Programa de lealtad configurable",
      "Panel de administrador con reportes",
      "Sincronización con Google/Outlook Calendar",
    ],
  },
  {
    id: "enterprise",
    nombre: "Enterprise",
    descripcion: "Para hospitales, redes y clínicas multi-sucursal con necesidades a la medida.",
    precioMensual: null,
    features: [
      "Médicos y sucursales ilimitados",
      "Todo lo del plan Profesional",
      "Roles y permisos por sucursal",
      "Soporte prioritario y onboarding dedicado",
      "Acceso a API para integraciones propias",
      "Implementación y migración de datos",
    ],
  },
];

const FAQ = [
  ["¿Qué es Medical OS?", "Es el sistema operativo de tu clínica: agenda en línea, expediente clínico, cobros, recordatorios, telemedicina y reportes en una sola plataforma. Tu equipo trabaja desde el panel y tus pacientes reservan desde su celular."],
  ["¿Necesito instalar algo?", "No. Medical OS funciona en el navegador de cualquier computadora, tableta o celular. Tus pacientes tampoco descargan nada: reservan desde tu enlace."],
  ["¿Puedo migrar mis pacientes y mi agenda actual?", "Sí. Importamos tu base de pacientes y citas desde Excel u otro sistema. En el plan Enterprise la migración la hace nuestro equipo."],
  ["¿Mis datos están seguros?", "La información clínica viaja cifrada y cada usuario sólo ve lo que su rol le permite. Tú eres dueño de tus datos y puedes exportarlos cuando quieras."],
  ["¿Hay plazo forzoso?", "No. Los planes Esencial y Profesional se pagan mes a mes o por año con 20% de descuento, y cancelas cuando quieras. Enterprise se cotiza según tu operación."],
  ["¿Puedo probarlo antes de contratar?", "Sí. La demo tiene datos simulados de una clínica completa: entra como administrador, médico o paciente y recorre todos los módulos."],
];

export function Portada() {
  const c = useClinica();
  const [scroll, setScroll] = useState(false);
  const [anual, setAnual] = useState(false);

  useEffect(() => {
    const f = () => setScroll(window.scrollY > 12);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  const panel = c.sesion ? (c.sesion.rol === "admin" ? "/dashboard/admin" : c.sesion.rol === "medico" ? "/dashboard/medico" : "/cuenta") : null;

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
          <Link href="/" aria-label="Medical OS · inicio" className="site-logo">
            <Logo alto={46} />
          </Link>
          <nav aria-label="Secciones">
            <a href="#producto">Producto</a>
            <a href="#modulos">Módulos</a>
            <a href="#paneles">Paneles</a>
            <a href="#precios">Precios</a>
            <a href="#preguntas">Preguntas</a>
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Link href={panel ?? "/login"} className="btn btn-ghost btn-sm hidden sm:inline-flex">
              {panel ? "Mi panel" : "Iniciar sesión"}
            </Link>
            <Link href="/login" className="btn btn-grad btn-sm">
              Probar la demo
            </Link>
          </div>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="wrap">
          <div className="band hero-band">
            <div className="anim-in" style={{ position: "relative", zIndex: 2 }}>
              <span className="chip" style={{ background: "rgba(255,255,255,.16)", color: "#fff", marginBottom: 22 }}>
                <Sparkles /> Software para clínicas y consultorios
              </span>
              <h1>
                El sistema operativo
                <br />
                <em>de tu clínica.</em>
              </h1>
              <p className="hero-lead">
                Agenda en línea, expediente clínico, cobros, recordatorios por WhatsApp y telemedicina en una sola plataforma. Tu equipo trabaja
                menos en papeleo y tus pacientes agendan sin llamar.
              </p>
              <div className="flex flex-wrap gap-3" style={{ marginTop: 30 }}>
                <Link href="/login" className="btn btn-white btn-lg">
                  Probar la demo <ArrowRight />
                </Link>
                <a href="#precios" className="btn btn-outline-white btn-lg">
                  Ver planes
                </a>
              </div>
              <div className="hero-stats">
                <div>
                  <b>10</b>
                  <span>módulos integrados</span>
                </div>
                <div>
                  <b>3</b>
                  <span>paneles: admin, médico y paciente</span>
                </div>
                <div>
                  <b>24/7</b>
                  <span>reservas en línea</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div style={{ position: "absolute", left: "50%", top: 0, transform: "translateX(-40%)" }} className="anim-in hero-telefono">
                <TelefonoInicio />
              </div>
              <div className="burbuja burbuja-1" style={{ left: "-2%", top: 70 }}>
                <i>
                  <Check />
                </i>
                <div>
                  <b>Nueva cita en línea</b>
                  <small>Agendada sin llamadas · Jue 10:30</small>
                </div>
              </div>
              <div className="burbuja burbuja-2" style={{ left: "4%", top: 250, animationDelay: "-2s" }}>
                <i style={{ background: "#25D366" }}>
                  <MessageCircle />
                </i>
                <div>
                  <b>Recordatorio enviado</b>
                  <small>WhatsApp · 24 h antes</small>
                </div>
              </div>
              <div className="burbuja burbuja-3" style={{ right: "-3%", top: 330, animationDelay: "-4s" }}>
                <i style={{ background: "#4285F4" }}>
                  <CalendarCheck2 />
                </i>
                <div>
                  <b>Agenda sincronizada</b>
                  <small>Google Calendar al instante</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Producto ---------- */}
      <section className="section" id="producto" style={{ paddingTop: 60 }}>
        <div className="wrap grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="relative order-2 lg:order-1">
            <div className="beneficio-visual" style={{ position: "relative", height: 560, display: "grid", placeItems: "center" }}>
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
                Qué es Medical OS
              </span>
              <h2 className="section-title" style={{ marginTop: 16 }}>
                Toda tu clínica, <em>en un solo lugar.</em>
              </h2>
              <p className="section-lead">
                Deja de saltar entre la libreta de citas, Excel, WhatsApp y la caja. Medical OS conecta la agenda, el expediente y los cobros para
                que todo tu equipo vea lo mismo.
              </p>
            </Reveal>
            <div className="grid gap-3" style={{ marginTop: 28 }}>
              {[
                [<CalendarDays key="1" />, "Menos llamadas, más consultas", "Tus pacientes reservan solos en horarios reales. Recepción deja de contestar el teléfono para agendar."],
                [<BellRing key="2" />, "Menos inasistencias", "Recordatorios automáticos por WhatsApp y confirmación de llegada con código QR."],
                [<FileHeart key="3" />, "Expediente sin papel", "Notas, signos vitales y recetas digitales que el médico encuentra en segundos."],
                [<ShieldCheck key="4" />, "Control para el dueño", "Ingresos, ocupación y desempeño por médico en reportes en tiempo real."],
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

      {/* ---------- Módulos ---------- */}
      <section className="section" id="modulos" style={{ background: "var(--bg-2)", borderRadius: 48, margin: "0 12px" }}>
        <div className="wrap">
          <Reveal className="section-head is-center">
            <h2 className="section-title">
              Módulos que <em>trabajan juntos</em>
            </h2>
            <p className="section-lead">Activa sólo lo que necesitas hoy y suma módulos conforme crece tu clínica.</p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" style={{ marginTop: 34 }}>
            {MODULOS.map(([icono, t, d], i) => (
              <Reveal key={t} delay={(i % 5) * 70}>
                <div className="servicio-card modulo-card">
                  <span className="icon-tile">{icono}</span>
                  <h3 style={{ fontSize: 17, marginTop: 6 }}>{t}</h3>
                  <p style={{ color: "var(--muted)", fontSize: 14 }}>{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Paneles ---------- */}
      <section className="section" id="paneles">
        <div className="wrap">
          <Reveal className="section-head is-center">
            <h2 className="section-title">
              Un panel para <em>cada persona</em>
            </h2>
            <p className="section-lead">Administración, médicos y pacientes usan la misma plataforma, cada quien con lo que necesita ver.</p>
          </Reveal>
          <div className="grid gap-5 lg:grid-cols-3" style={{ marginTop: 40 }}>
            {PANELES.map((p, i) => (
              <Reveal key={p.titulo} delay={i * 100} className="h-full">
                <div className="card card-pad panel-card">
                  <span className="icon-tile">{p.icono}</span>
                  <h3 style={{ fontSize: 21, marginTop: 14 }}>{p.titulo}</h3>
                  <p style={{ color: "var(--muted)", fontSize: 14.5, marginTop: 6 }}>{p.texto}</p>
                  <ul className="grid gap-2" style={{ marginTop: 16, flex: 1 }}>
                    {p.puntos.map((x) => (
                      <li key={x} className="flex items-center gap-2" style={{ fontSize: 14 }}>
                        <Check size={16} color="var(--teal)" /> {x}
                      </li>
                    ))}
                  </ul>
                  <Link href={p.href} className="btn btn-soft" style={{ marginTop: 20, width: "100%" }}>
                    {p.cta} <ArrowRight />
                  </Link>
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
            <Reveal className="text-center">
              <h2 className="section-title" style={{ color: "#fff", padding: "64px 20px 0", maxWidth: 760, margin: "0 auto" }}>
                Tus pacientes agendan <span style={{ color: "var(--navy)" }}>solos</span>, en tres pasos…
              </h2>
            </Reveal>
            <div className="pasos">
              <div className="pasos-linea" />
              <div className="pasos-grid grid gap-10 md:grid-cols-3">
                {(
                  [
                    [1, "Eligen servicio y especialista"],
                    [2, "Escogen día y hora libres"],
                    [3, "Reciben su confirmación"],
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

      {/* ---------- Precios ---------- */}
      <section className="section" id="precios">
        <div className="wrap">
          <Reveal className="section-head is-center">
            <span className="eyebrow" style={{ justifyContent: "center" }}>
              <i>
                <Sparkles />
              </i>
              Precios
            </span>
            <h2 className="section-title" style={{ marginTop: 16 }}>
              Planes simples, <em>sin sorpresas</em>
            </h2>
            <p className="section-lead">Cancela cuando quieras. Todos los planes incluyen pago con tarjeta y en efectivo desde el día uno.</p>
            <div className="segmented precio-toggle" role="group" aria-label="Periodo de pago" style={{ marginTop: 26 }}>
              <button type="button" aria-pressed={!anual} onClick={() => setAnual(false)}>
                Mensual
              </button>
              <button type="button" aria-pressed={anual} onClick={() => setAnual(true)}>
                Anual <small>· ahorra 20%</small>
              </button>
            </div>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch" style={{ marginTop: 40 }}>
            {PLANES.map((plan, i) => {
              const precio = plan.precioMensual === null ? null : anual ? Math.round(plan.precioMensual * 0.8) : plan.precioMensual;
              return (
                <Reveal key={plan.id} delay={i * 100} className="h-full">
                  <div className={`plan-card ${plan.destacado ? "is-destacado" : ""}`}>
                    {plan.destacado && (
                      <span className="plan-badge">
                        <Sparkles /> Más elegido
                      </span>
                    )}
                    {plan.precioMensual === null && (
                      <span className="plan-badge is-enterprise">
                        <Building2 /> A la medida
                      </span>
                    )}
                    <h3>{plan.nombre}</h3>
                    <p className="plan-desc">{plan.descripcion}</p>
                    {precio === null ? (
                      <p className="plan-precio">
                        <b className="is-texto">Bajo cotización</b>
                        <span>Precio según médicos, sucursales e integraciones</span>
                      </p>
                    ) : (
                      <p className="plan-precio">
                        <b className="tnum">{mxn.format(precio)}</b>
                        <span>/mes{anual && " · facturado anual"}</span>
                      </p>
                    )}
                    <ul>
                      {plan.features.map((f) => (
                        <li key={f}>
                          <Check /> {f}
                        </li>
                      ))}
                    </ul>
                    {plan.precioMensual === null ? (
                      <a href={`mailto:${VENTAS}?subject=${encodeURIComponent("Cotización Medical OS Enterprise")}`} className="btn btn-dark btn-lg">
                        Solicitar cotización
                      </a>
                    ) : (
                      <Link href="/login" className={`btn btn-lg ${plan.destacado ? "btn-white" : "btn-dark"}`}>
                        Probar la demo
                      </Link>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>

          <p style={{ textAlign: "center", fontSize: 12.5, color: "var(--soft)", marginTop: 26, maxWidth: 560, marginInline: "auto" }}>
            Precios de referencia en pesos mexicanos (MXN), antes de IVA. Esta demo no procesa pagos reales de suscripción.
          </p>
        </div>
      </section>

      {/* ---------- Preguntas ---------- */}
      <section className="section" id="preguntas" style={{ paddingTop: 40 }}>
        <div className="wrap grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <h2 className="section-title">
              Preguntas <em>frecuentes</em>
            </h2>
            <p className="section-lead">¿Tienes otra duda? Escríbenos y te mostramos Medical OS con los datos de tu clínica.</p>
            <Link href="/login" className="btn btn-grad btn-lg" style={{ marginTop: 24 }}>
              Probar la demo <ArrowRight />
            </Link>
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
            <Logo alto={46} blanco />
            <p style={{ marginTop: 18, fontSize: 14, maxWidth: 320 }}>
              El sistema operativo para clínicas y consultorios: agenda, expediente, cobros y pacientes en una sola plataforma.
            </p>
          </div>
          <div>
            <h4>Producto</h4>
            <div className="grid gap-2" style={{ fontSize: 14 }}>
              <a href="#modulos">Módulos</a>
              <a href="#paneles">Paneles</a>
              <a href="#precios">Precios</a>
            </div>
          </div>
          <div>
            <h4>Demo</h4>
            <div className="grid gap-2" style={{ fontSize: 14 }}>
              <Link href="/login?rol=admin">Administración</Link>
              <Link href="/login?rol=medico">Acceso médico</Link>
              <Link href="/reservar">Reserva de pacientes</Link>
            </div>
          </div>
          <div>
            <h4>Contacto</h4>
            <div className="grid gap-2" style={{ fontSize: 14 }}>
              <a href={`mailto:${VENTAS}`}>Ventas</a>
              <a href="#preguntas">Preguntas frecuentes</a>
            </div>
          </div>
        </div>
        <div className="wrap flex flex-wrap justify-between gap-3" style={{ marginTop: 40, paddingTop: 22, borderTop: "1px solid rgba(255,255,255,.1)", fontSize: 13 }}>
          <span>© {new Date().getFullYear()} Medical OS. Demo con datos simulados.</span>
          <span>Medical OS por Partum Design</span>
        </div>
      </footer>
    </div>
  );
}
