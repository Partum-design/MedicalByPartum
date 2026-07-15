import Link from "next/link";
import { Banknote, CalendarCheck, Gift, TrendingUp, Users } from "lucide-react";
import { DEMO_ADMIN_STATS } from "@/lib/demo";

const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

// Nodo Administrador (demo): reportes financieros y gestión de médicos.
// En producción estas métricas salen de vistas agregadas protegidas por RLS
// (admin_clinica solo ve su clinica_id).
export default function DashboardAdminPage() {
  const s = DEMO_ADMIN_STATS;

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-8">
        <Link href="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          ← Inicio
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Clínica Partum — Panel global</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-muted)" }}>
          Resumen del mes en curso · datos de demostración
        </p>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={<Banknote className="h-5 w-5" />} label="Ingresos del mes" value={mxn.format(s.ingresosMes)} />
        <Kpi icon={<CalendarCheck className="h-5 w-5" />} label="Citas del mes" value={String(s.citasMes)} />
        <Kpi icon={<TrendingUp className="h-5 w-5" />} label="Tasa de asistencia" value={`${Math.round(s.tasaAsistencia * 100)}%`} acento />
        <Kpi icon={<Users className="h-5 w-5" />} label="Pacientes activos" value={String(s.pacientesActivos)} />
      </section>

      <section className="mb-8 rounded-2xl p-5 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10" style={{ background: "var(--card)" }}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Equipo médico</h2>
          <button className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-700">
            + Dar de alta médico
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ color: "var(--ink-muted)" }}>
                <th className="pb-3 font-medium">Médico</th>
                <th className="pb-3 font-medium">Especialidad</th>
                <th className="pb-3 text-right font-medium">Citas</th>
                <th className="pb-3 text-right font-medium">Ingresos</th>
                <th className="pb-3 text-right font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {s.medicos.map((m) => (
                <tr key={m.nombre}>
                  <td className="py-3 font-medium">{m.nombre}</td>
                  <td className="py-3" style={{ color: "var(--ink-muted)" }}>{m.especialidad}</td>
                  <td className="py-3 text-right tabular-nums">{m.citas}</td>
                  <td className="py-3 text-right tabular-nums">{mxn.format(m.ingresos)}</td>
                  <td className="py-3 text-right">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        m.activo
                          ? "bg-accent-100 text-accent-600 dark:bg-accent-500/15 dark:text-accent-400"
                          : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
                      }`}
                    >
                      {m.activo ? "Activo" : "Baja"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl bg-gradient-to-r from-brand-600 to-accent-500 p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold">Programa de lealtad</h2>
              <p className="text-sm text-white/80">
                {s.recompensasCanjeadas} recompensas canjeadas este mes · regla: 5 citas → 20% de descuento
              </p>
            </div>
          </div>
          <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition-transform hover:scale-105">
            Configurar recompensas
          </button>
        </div>
      </section>
    </main>
  );
}

function Kpi({ icon, label, value, acento }: { icon: React.ReactNode; label: string; value: string; acento?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl p-4 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10" style={{ background: "var(--card)" }}>
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${
          acento ? "bg-gradient-to-br from-accent-400 to-accent-600" : "bg-gradient-to-br from-brand-500 to-brand-700"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs" style={{ color: "var(--ink-muted)" }}>{label}</p>
        <p className="text-lg font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}
