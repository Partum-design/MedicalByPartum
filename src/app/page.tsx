import Link from "next/link";
import {
  CalendarCheck,
  CalendarX2,
  CreditCard,
  Gift,
  Layers,
  PhoneOff,
  ShieldCheck,
  Stethoscope,
  Timer,
  User,
  UserCog,
  UserX,
} from "lucide-react";
import { Reveal } from "@/components/marketing/Reveal";
import { SavedCard } from "@/components/marketing/SavedCard";

// Landing: explica el porqué de la plataforma y da acceso a la demo por rol.
export default function LandingPage() {
  return (
    <main className="overflow-x-hidden">
      {/* Hero */}
      <section className="bg-grid-glow relative bg-ink-950 text-white">
        <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 sm:py-6">
          <Link href="/" className="anim-in flex shrink-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-400 text-sm font-bold sm:h-9 sm:w-9">
              M
            </span>
            <span className="font-display leading-none whitespace-nowrap">
              <span className="block text-sm font-bold tracking-tight sm:text-base">Medical OS</span>
              <span className="hidden text-[10px] uppercase tracking-[0.25em] text-white/50 sm:block">
                by Partum
              </span>
            </span>
          </Link>
          <div className="anim-in anim-d1 flex shrink-0 items-center gap-1.5 text-sm sm:gap-2">
            <Link
              href="/login"
              className="hidden rounded-full px-4 py-2 transition-colors hover:bg-white/10 sm:inline-block"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/reservar"
              className="card-hover whitespace-nowrap rounded-full bg-white px-3.5 py-2 text-sm font-medium text-brand-700 shadow-sm sm:px-4"
            >
              Agendar cita
            </Link>
          </div>
        </nav>

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 pb-24 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-14">
          <div className="text-center lg:text-left">
            <p className="anim-in anim-d1 mx-auto w-fit rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-medium tracking-wide backdrop-blur lg:mx-0">
              Sistema núcleo para clínicas y consultorios
            </p>
            <h1 className="font-display anim-in anim-d2 mx-auto mt-5 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:mx-0">
              Menos consultorio vacío.
              <br />
              <span className="shimmer-text">Más pacientes que regresan.</span>
            </h1>
            <p className="anim-in anim-d3 mx-auto mt-5 max-w-lg text-lg text-white/75 lg:mx-0">
              Cada cita a la que un paciente no llega es dinero perdido y tiempo médico
              desperdiciado. Medical OS resuelve eso: agenda en línea con pago
              anticipado, telemedicina automática y un programa de lealtad que premia a
              quien sí regresa.
            </p>
            <div className="anim-in anim-d4 mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                href="/login"
                className="card-hover rounded-full bg-white px-6 py-3 font-semibold text-brand-700 shadow-lg"
              >
                Probar la demo interactiva
              </Link>
              <Link
                href="/reservar"
                className="card-hover rounded-full border border-white/25 px-6 py-3 font-semibold backdrop-blur transition-colors hover:bg-white/10"
              >
                Reservar una cita
              </Link>
            </div>
            <p className="anim-in anim-d5 mt-8 text-xs uppercase tracking-[0.2em] text-white/40">
              Pagos procesados vía Stripe · Mercado Pago
            </p>
          </div>

          <div className="anim-pop anim-d3">
            <SavedCard />
          </div>
        </div>
      </section>

      {/* Núcleo único — estadísticas reales del producto, no vanidad */}
      <section className="bg-cyan-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Reveal className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
              Un núcleo, no doce pestañas
            </p>
            <h2 className="font-display mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              La agenda, el cobro y la lealtad viven en el mismo sistema
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
              Sin agenda de papel, sin hoja de cálculo aparte, sin terminal de cobro
              desconectada. Un mismo lugar para paciente, médico y administrador.
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat delay={0} icon={<Layers className="h-4 w-4" />} value="1" label="Sistema núcleo" nota="Sustituye agenda, chat, hoja de cálculo y terminal" />
            <Stat delay={80} icon={<Timer className="h-4 w-4" />} value="10 min" label="Bloqueo de horario" nota="Sin pago confirmado, se libera solo" />
            <Stat delay={160} icon={<Gift className="h-4 w-4" />} value="Cada 5" label="Citas asistidas" nota="Desbloquean una recompensa automática" />
            <Stat delay={240} icon={<UserCog className="h-4 w-4" />} value="3 roles" label="Un solo panel" nota="Paciente, médico y administrador" />
          </div>
        </div>
      </section>

      {/* El problema */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight">El problema que atacamos</h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
            Los consultorios independientes y clínicas pequeñas pierden ingresos todos los
            días por tres fugas silenciosas:
          </p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-3">
          <Reveal delay={0}>
            <Problema
              icon={<CalendarX2 className="h-5 w-5" />}
              title="Citas que no llegan"
              text="Sin pago anticipado, cancelar a última hora no le cuesta nada al paciente — y el hueco en la agenda ya no se llena."
            />
          </Reveal>
          <Reveal delay={100}>
            <Problema
              icon={<PhoneOff className="h-5 w-5" />}
              title="Agenda por teléfono"
              text="Recepción atada al teléfono, dobles reservas y pacientes que se van con quien sí contesta a la primera."
            />
          </Reveal>
          <Reveal delay={200}>
            <Problema
              icon={<UserX className="h-5 w-5" />}
              title="Pacientes que no vuelven"
              text="Conseguir un paciente nuevo cuesta mucho más que retener a uno actual, pero nadie mide ni premia la recurrencia."
            />
          </Reveal>
        </div>
      </section>

      {/* Cómo lo resolvemos */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight">Cómo lo resolvemos</h2>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-3">
          <Reveal delay={0}>
            <Paso n="01" icon={<CreditCard className="h-5 w-5" />} title="El paciente agenda y paga en línea" text="Disponibilidad en tiempo real, verificación por WhatsApp y pago con tarjeta. El horario queda apartado solo 10 minutos: sin pago, se libera — adiós a los bloqueos fantasma." />
          </Reveal>
          <Reveal delay={100}>
            <Paso n="02" icon={<CalendarCheck className="h-5 w-5" />} title="El médico solo atiende" text="La cita cae directo en su Google Calendar u Outlook con enlace de Meet o Teams si es videoconsulta. Su agenda del día vive en un panel limpio." />
          </Reveal>
          <Reveal delay={200}>
            <Paso n="03" icon={<Gift className="h-5 w-5" />} title="La clínica fideliza sola" text="Cada 5 citas asistidas y pagadas, el sistema desbloquea automáticamente una recompensa: 20% de descuento o consulta de seguimiento gratis." />
          </Reveal>
        </div>
        <Reveal delay={280} className="mx-auto mt-8 flex w-fit">
          <p
            className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10"
            style={{ background: "var(--card)", color: "var(--ink-muted)" }}
          >
            <ShieldCheck className="h-4 w-4 text-accent-500" />
            Con seguridad antifraude: captcha invisible, OTP por SMS/WhatsApp, límites
            antibots y datos aislados por clínica.
          </p>
        </Reveal>
      </section>

      {/* Demo por rol */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight">Recorre la demo</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--ink-muted)" }}>
            Tres perfiles, una sola operación. Lo que hagas en un panel se refleja en los
            demás — los datos viven en tu navegador.
          </p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-3">
          <Reveal delay={0}>
            <RolCard icon={<User className="h-6 w-6" />} titulo="Paciente" texto="Agenda, paga, acumula recompensas y entra a sus videoconsultas." tono="from-brand-500 to-brand-700" />
          </Reveal>
          <Reveal delay={100}>
            <RolCard icon={<Stethoscope className="h-6 w-6" />} titulo="Médico" texto="Ve su agenda del día, atiende y marca citas como asistidas." tono="from-accent-400 to-brand-600" />
          </Reveal>
          <Reveal delay={200}>
            <RolCard icon={<ShieldCheck className="h-6 w-6" />} titulo="Administrador" texto="Supervisa ingresos, equipo médico y el programa de lealtad." tono="from-brand-600 to-accent-500" />
          </Reveal>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-grid-glow relative bg-ink-950 text-white">
        <Reveal className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Un consultorio lleno empieza con una agenda que cobra sola.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Prueba los tres paneles de la demo con datos reales de tu navegador — sin
            registrarte, sin tarjeta.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/login" className="card-hover rounded-full bg-white px-6 py-3 font-semibold text-brand-700 shadow-lg">
              Probar la demo interactiva
            </Link>
            <Link href="/reservar" className="card-hover rounded-full border border-white/25 px-6 py-3 font-semibold backdrop-blur transition-colors hover:bg-white/10">
              Reservar una cita
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}

function Stat({
  icon,
  value,
  label,
  nota,
  delay,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  nota: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="card-hover h-full rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-400 text-white">
          {icon}
        </div>
        <p className="font-num text-3xl font-semibold tracking-tight text-ink-900">{value}</p>
        <p className="mt-1 text-sm font-medium">{label}</p>
        <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--ink-muted)" }}>
          {nota}
        </p>
      </div>
    </Reveal>
  );
}

function Problema({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div
      className="card-hover h-full rounded-3xl p-6 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10"
      style={{ background: "var(--card)" }}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
        {text}
      </p>
    </div>
  );
}

function Paso({ n, icon, title, text }: { n: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <div
      className="card-hover relative h-full rounded-3xl p-6 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10"
      style={{ background: "var(--card)" }}
    >
      <span className="font-num absolute right-5 top-4 text-3xl font-semibold text-slate-100 dark:text-white/5">
        {n}
      </span>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-400 text-white">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
        {text}
      </p>
    </div>
  );
}

function RolCard({ icon, titulo, texto, tono }: { icon: React.ReactNode; titulo: string; texto: string; tono: string }) {
  return (
    <Link
      href="/login"
      className="card-hover group block h-full rounded-3xl p-6 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10"
      style={{ background: "var(--card)" }}
    >
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tono} text-white shadow-md`}>
        {icon}
      </div>
      <h3 className="font-semibold">{titulo}</h3>
      <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
        {texto}
      </p>
      <span className="mt-4 inline-block text-sm font-medium text-brand-600 transition-transform group-hover:translate-x-1">
        Entrar como {titulo.toLowerCase()} →
      </span>
    </Link>
  );
}
