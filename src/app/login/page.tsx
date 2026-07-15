"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Stethoscope, User } from "lucide-react";
import { CUENTAS_DEMO, useDemoStore, type RolDemo } from "@/lib/demo-store";

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
        En producción este acceso usa Supabase Auth con correo/contraseña, OAuth y OTP.
      </p>
    </main>
  );
}
