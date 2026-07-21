"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CalendarCheck, CreditCard, ShieldCheck, Stethoscope, User } from "lucide-react";
import { CUENTAS_DEMO, useDemoStore, type RolDemo } from "@/lib/demo-store";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" className="h-4.5 w-4.5" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
    </svg>
  );
}

const DESTINOS: Record<RolDemo, string> = {
  paciente: "/cuenta",
  medico: "/dashboard/medico",
  admin: "/dashboard/admin",
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useDemoStore();

  function entrar(rol: RolDemo) {
    login(rol);
    router.push(DESTINOS[rol]);
  }

  function entrarConGoogle() {
    // Demo: sin Supabase Auth conectado no hay OAuth real que ejecutar.
    // Entra como paciente — el flujo que en producción usaría este botón.
    login("paciente");
    router.push(DESTINOS.paciente);
  }

  const cuentas: { rol: RolDemo; icon: React.ReactNode; desc: string }[] = [
    {
      rol: "paciente",
      icon: <User className="h-6 w-6" />,
      desc: "Consulta tus citas, agenda nuevas y revisa tu programa de recompensas.",
    },
    {
      rol: "medico",
      icon: <Stethoscope className="h-6 w-6" />,
      desc: "Revisa tu agenda del día, atiende videoconsultas y marca citas como asistidas.",
    },
    {
      rol: "admin",
      icon: <ShieldCheck className="h-6 w-6" />,
      desc: "Supervisa ingresos, equipo médico y el programa de fidelización de la clínica.",
    },
  ];

  return (
    <main className="login-page">
      <div className="login-shell anim-in">
        <section className="login-story">
          <Link href="/" className="login-brand">
            <span className="login-brand-mark">M</span>
            <span>Medical <strong>OS</strong></span>
          </Link>
          <div className="login-story-copy">
            <p className="login-kicker">Demo clínica conectada</p>
            <h1>Una cita cambia todo el sistema.</h1>
            <p>
              Agenda como paciente, atiende como médico y mira cómo se actualiza la clínica desde administración.
            </p>
          </div>
          <div className="login-flow" aria-label="Flujo conectado de la demo">
            <span><CalendarCheck className="h-4 w-4" /> Reserva</span>
            <span><CreditCard className="h-4 w-4" /> Pago</span>
            <span><ShieldCheck className="h-4 w-4" /> Seguimiento</span>
          </div>
          <p className="login-local-note"><span /> Datos locales · puedes reiniciar la demo cuando quieras</p>
        </section>

        <section className="login-access">
          <Link href="/" className="login-back">← Volver al inicio</Link>
          <header>
            <p className="login-kicker text-brand-700">Acceso de prueba</p>
            <h2>Elige desde dónde quieres entrar.</h2>
            <p>Cada perfil tiene acciones reales conectadas con los demás paneles.</p>
          </header>

          <button onClick={entrarConGoogle} className="login-google">
            <GoogleIcon /> Continuar con Google
          </button>

          <div className="login-divider"><span />o usa un perfil de la demo<span /></div>

          <div className="login-role-list">
            {cuentas.map((c, i) => {
              const cuenta = CUENTAS_DEMO[c.rol];
              return (
                <button
                  key={c.rol}
                  onClick={() => entrar(c.rol)}
                  className={`login-role anim-in anim-d${i + 1}`}
                >
                  <span className={`login-role-icon role-${c.rol}`}>{c.icon}</span>
                  <span className="min-w-0 flex-1">
                    <strong>{cuenta.nombre}</strong>
                    <small>{cuenta.subtitulo}</small>
                    <span className="login-role-copy">{c.desc}</span>
                  </span>
                  <ArrowRight className="login-role-arrow" />
                </button>
              );
            })}
          </div>

          <p className="login-footnote">
            En producción, el acceso usa Supabase Auth, OAuth con Google y verificación por OTP.
          </p>
        </section>
      </div>
    </main>
  );
}
