import Link from "next/link";
import {
  CalendarCheck,
  ShieldCheck,
  Video,
  Gift,
  Stethoscope,
  LayoutDashboard,
} from "lucide-react";

export default function LandingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-accent-500 text-white">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_70%_20%,white,transparent_45%)]" />
        <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="text-lg font-semibold tracking-tight">
            Medical<span className="text-accent-100">ByPartum</span>
          </span>
          <div className="flex items-center gap-2 text-sm">
            <Link href="/dashboard/medico" className="rounded-full px-4 py-2 transition-colors hover:bg-white/10">
              Soy médico
            </Link>
            <Link
              href="/reservar"
              className="rounded-full bg-white px-4 py-2 font-medium text-brand-700 shadow-sm transition-transform hover:scale-105"
            >
              Agendar cita
            </Link>
          </div>
        </nav>

        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-16 text-center">
          <p className="mx-auto mb-4 w-fit rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-medium backdrop-blur">
            Plataforma SaaS para clínicas y consultorios
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Tu consultorio, en piloto automático
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">
            Agenda en línea, pagos, telemedicina y fidelización de pacientes.
            Todo protegido contra bots y fraude.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/reservar"
              className="rounded-full bg-white px-6 py-3 font-semibold text-brand-700 shadow-lg transition-transform hover:scale-105"
            >
              Reservar una cita
            </Link>
            <Link
              href="/dashboard/admin"
              className="rounded-full border border-white/40 px-6 py-3 font-semibold backdrop-blur transition-colors hover:bg-white/10"
            >
              Ver demo de clínica
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon={<CalendarCheck className="h-5 w-5" />}
            title="Agenda en tiempo real"
            text="Disponibilidad en vivo con bloqueo de horario de 10 minutos durante el pago: los bots pierden el lugar, tus pacientes no."
          />
          <Feature
            icon={<Video className="h-5 w-5" />}
            title="Telemedicina integrada"
            text="Sincronización bidireccional con Google Calendar y Outlook; enlaces de Meet o Teams generados automáticamente."
          />
          <Feature
            icon={<Gift className="h-5 w-5" />}
            title="Fidelización automática"
            text="Cada 5 citas asistidas y pagadas se desbloquea una recompensa configurable: descuentos o consultas de seguimiento gratis."
          />
          <Feature
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Seguridad antifraude"
            text="Turnstile invisible, verificación OTP por WhatsApp/SMS, rate limiting y Row Level Security en la base de datos."
          />
          <Feature
            icon={<Stethoscope className="h-5 w-5" />}
            title="Expedientes clínicos"
            text="Notas, diagnósticos y recetas básicas por paciente, visibles solo para el médico tratante."
          />
          <Feature
            icon={<LayoutDashboard className="h-5 w-5" />}
            title="Control total de la clínica"
            text="Altas y bajas de médicos, reportes financieros y analíticas de retención en un panel global."
          />
        </div>
      </section>

      <footer className="border-t border-slate-200/60 py-8 text-center text-sm dark:border-white/10" style={{ color: "var(--ink-muted)" }}>
        MedicalByPartum · Demo técnica — Next.js · Supabase · Vercel
      </footer>
    </main>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div
      className="rounded-2xl p-6 shadow-sm ring-1 ring-slate-900/5 transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-accent-500/40 dark:ring-white/10"
      style={{ background: "var(--card)" }}
    >
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
