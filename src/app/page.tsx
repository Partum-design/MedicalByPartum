import Link from "next/link";
import {
  CalendarCheck,
  CalendarX2,
  CreditCard,
  Gift,
  PhoneOff,
  ShieldCheck,
  Stethoscope,
  User,
  UserX,
} from "lucide-react";

// Landing: explica el porqué de la plataforma y da acceso a la demo por rol.
export default function LandingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-accent-500 text-white">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_70%_20%,white,transparent_45%)]" />
        <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="anim-in text-lg font-semibold tracking-tight">
            Medical<span className="text-accent-100">ByPartum</span>
          </span>
          <div className="anim-in anim-d1 flex items-center gap-2 text-sm">
            <Link href="/login" className="rounded-full px-4 py-2 transition-colors hover:bg-white/10">
              Iniciar sesión
            </Link>
            <Link
              href="/reservar"
              className="card-hover rounded-full bg-white px-4 py-2 font-medium text-brand-700 shadow-sm"
            >
              Agendar cita
            </Link>
          </div>
        </nav>

        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-14 text-center">
          <p className="anim-in anim-d1 mx-auto mb-4 w-fit rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-medium backdrop-blur">
            Plataforma de gestión para clínicas y consultorios
          </p>
          <h1 className="anim-in anim-d2 mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Menos consultorio vacío.
            <br />
            Más pacientes que regresan.
          </h1>
          <p className="anim-in anim-d3 mx-auto mt-5 max-w-2xl text-lg text-white/85">
            Cada cita a la que un paciente no llega es dinero perdido y tiempo médico
            desperdiciado. MedicalByPartum existe para resolver eso: agenda en línea con
            pago anticipado, telemedicina automática y un programa de lealtad que premia
            a quien sí regresa.
          </p>
          <div className="anim-in anim-d4 mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="card-hover rounded-full bg-white px-6 py-3 font-semibold text-brand-700 shadow-lg"
            >
              Probar la demo interactiva
            </Link>
            <Link
              href="/reservar"
              className="card-hover rounded-full border border-white/40 px-6 py-3 font-semibold backdrop-blur transition-colors hover:bg-white/10"
            >
              Reservar una cita
            </Link>
          </div>
        </div>
      </section>

      {/* El problema */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="anim-in mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight">
            El problema que atacamos
          </h2>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
            Los consultorios independientes y clínicas pequeñas pierden ingresos todos los
            días por tres fugas silenciosas:
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Problema
            delay="anim-d1"
            icon={<CalendarX2 className="h-5 w-5" />}
            title="Citas que no llegan"
            text="Sin pago anticipado, cancelar a última hora no le cuesta nada al paciente — y el hueco en la agenda ya no se llena."
          />
          <Problema
            delay="anim-d2"
            icon={<PhoneOff className="h-5 w-5" />}
            title="Agenda por teléfono"
            text="Recepción atada al teléfono, dobles reservas y pacientes que se van con quien sí contesta a la primera."
          />
          <Problema
            delay="anim-d3"
            icon={<UserX className="h-5 w-5" />}
            title="Pacientes que no vuelven"
            text="Conseguir un paciente nuevo cuesta mucho más que retener a uno actual, pero nadie mide ni premia la recurrencia."
          />
        </div>
      </section>

      {/* Cómo lo resolvemos */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="anim-in mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight">Cómo lo resolvemos</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Paso
            n="1"
            delay="anim-d1"
            icon={<CreditCard className="h-5 w-5" />}
            title="El paciente agenda y paga en línea"
            text="Disponibilidad en tiempo real, verificación por WhatsApp y pago con tarjeta. El horario queda apartado solo 10 minutos: sin pago, se libera — adiós a los bloqueos fantasma."
          />
          <Paso
            n="2"
            delay="anim-d2"
            icon={<CalendarCheck className="h-5 w-5" />}
            title="El médico solo atiende"
            text="La cita cae directo en su Google Calendar u Outlook con enlace de Meet o Teams si es videoconsulta. Su agenda del día vive en un panel limpio."
          />
          <Paso
            n="3"
            delay="anim-d3"
            icon={<Gift className="h-5 w-5" />}
            title="La clínica fideliza sola"
            text="Cada 5 citas asistidas y pagadas, el sistema desbloquea automáticamente una recompensa: 20% de descuento o consulta de seguimiento gratis."
          />
        </div>
        <p
          className="anim-in anim-d4 mx-auto mt-8 flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10"
          style={{ background: "var(--card)", color: "var(--ink-muted)" }}
        >
          <ShieldCheck className="h-4 w-4 text-accent-500" />
          Con seguridad antifraude: captcha invisible, OTP por SMS/WhatsApp, límites
          antibots y datos aislados por clínica.
        </p>
      </section>

      {/* Demo por rol */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="anim-in mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight">Recorre la demo</h2>
          <p className="mt-2 text-sm" style={{ color: "var(--ink-muted)" }}>
            Tres perfiles, una sola operación. Lo que hagas en un panel se refleja en los
            demás — los datos viven en tu navegador.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <RolCard
            delay="anim-d1"
            icon={<User className="h-6 w-6" />}
            titulo="Paciente"
            texto="Agenda, paga, acumula recompensas y entra a sus videoconsultas."
            tono="from-brand-500 to-brand-700"
          />
          <RolCard
            delay="anim-d2"
            icon={<Stethoscope className="h-6 w-6" />}
            titulo="Médico"
            texto="Ve su agenda del día, atiende y marca citas como asistidas."
            tono="from-accent-400 to-accent-600"
          />
          <RolCard
            delay="anim-d3"
            icon={<ShieldCheck className="h-6 w-6" />}
            titulo="Administrador"
            texto="Supervisa ingresos, equipo médico y el programa de lealtad."
            tono="from-brand-600 to-accent-500"
          />
        </div>
      </section>
    </main>
  );
}

function Problema({ icon, title, text, delay }: { icon: React.ReactNode; title: string; text: string; delay: string }) {
  return (
    <div
      className={`anim-in ${delay} card-hover rounded-3xl p-6 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10`}
      style={{ background: "var(--card)" }}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-950/40">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
        {text}
      </p>
    </div>
  );
}

function Paso({ n, icon, title, text, delay }: { n: string; icon: React.ReactNode; title: string; text: string; delay: string }) {
  return (
    <div
      className={`anim-in ${delay} card-hover relative rounded-3xl p-6 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10`}
      style={{ background: "var(--card)" }}
    >
      <span className="absolute right-5 top-4 text-4xl font-bold text-slate-100 dark:text-white/5">{n}</span>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
        {text}
      </p>
    </div>
  );
}

function RolCard({ icon, titulo, texto, tono, delay }: { icon: React.ReactNode; titulo: string; texto: string; tono: string; delay: string }) {
  return (
    <Link
      href="/login"
      className={`anim-in ${delay} card-hover group rounded-3xl p-6 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10`}
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
