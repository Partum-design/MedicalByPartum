"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Stethoscope, User } from "lucide-react";
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

  const cuentas: { rol: RolDemo; icon: React.ReactNode; desc: string; tono: string }[] = [
    {
      rol: "paciente",
      icon: <User className="h-6 w-6" />,
      desc: "Consulta tus citas, agenda nuevas y revisa tu programa de recompensas.",
      tono: "from-brand-500 to-brand-700",
    },
    {
      rol: "medico",
      icon: <Stethoscope className="h-6 w-6" />,
      desc: "Revisa tu agenda del día, atiende videoconsultas y marca citas como asistidas.",
      tono: "from-accent-400 to-accent-600",
    },
    {
      rol: "admin",
      icon: <ShieldCheck className="h-6 w-6" />,
      desc: "Supervisa ingresos, equipo médico y el programa de fidelización de la clínica.",
      tono: "from-brand-600 to-accent-500",
    },
  ];

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-12">
      <div className="anim-in mb-10 text-center">
        <Link href="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          ← Volver al inicio
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Entra a la demo</h1>
        <p className="mt-2 text-sm" style={{ color: "var(--ink-muted)" }}>
          Elige un perfil para explorar la plataforma. Los datos son locales de tu
          navegador: lo que hagas aquí (agendar, cancelar, atender) se guarda de verdad.
        </p>
      </div>

      <button
        onClick={entrarConGoogle}
        className="anim-in card-hover mb-6 flex w-full items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold shadow-sm transition-colors hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
      >
        <GoogleIcon /> Continuar con Google
      </button>

      <div className="anim-in mb-6 flex items-center gap-3 text-xs uppercase tracking-wide" style={{ color: "var(--ink-muted)" }}>
        <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        o elige un perfil de la demo
        <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
      </div>

      <div className="space-y-4">
        {cuentas.map((c, i) => {
          const cuenta = CUENTAS_DEMO[c.rol];
          return (
            <button
              key={c.rol}
              onClick={() => entrar(c.rol)}
              className={`anim-in anim-d${i + 1} card-hover flex w-full items-center gap-5 rounded-3xl p-6 text-left shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10`}
              style={{ background: "var(--card)" }}
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${c.tono} text-white shadow-md`}
              >
                {c.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{cuenta.nombre}</p>
                <p className="text-xs font-medium uppercase tracking-wide text-accent-600">
                  {cuenta.subtitulo}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                  {c.desc}
                </p>
              </div>
              <span className="hidden rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 sm:block dark:bg-brand-900/40 dark:text-brand-100">
                Entrar →
              </span>
            </button>
          );
        })}
      </div>

      <p className="anim-in anim-d4 mt-8 text-center text-xs" style={{ color: "var(--ink-muted)" }}>
        En producción este acceso usa Supabase Auth: correo/contraseña, OAuth con Google y
        verificación por OTP.
      </p>
    </main>
  );
}
