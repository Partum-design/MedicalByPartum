"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  Clock3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  PieChart,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import type { RolDemo, SesionDemo } from "@/lib/demo-store";

type NavItem = { label: string; href: string; icon: React.ReactNode };

const NAV: Record<RolDemo, NavItem[]> = {
  medico: [
    { label: "Mi agenda", href: "/dashboard/medico", icon: <CalendarDays className="h-4 w-4" /> },
    { label: "Expedientes", href: "/dashboard/medico/expedientes", icon: <ClipboardList className="h-4 w-4" /> },
    { label: "Horarios", href: "/dashboard/medico/horarios", icon: <Clock3 className="h-4 w-4" /> },
    { label: "Configuración", href: "/dashboard/medico/configuracion", icon: <Settings className="h-4 w-4" /> },
  ],
  admin: [
    { label: "Panel", href: "/dashboard/admin", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Equipo médico", href: "/dashboard/admin/equipo", icon: <Users className="h-4 w-4" /> },
    { label: "Reportes", href: "/dashboard/admin/reportes", icon: <PieChart className="h-4 w-4" /> },
    { label: "Configuración", href: "/dashboard/admin/configuracion", icon: <Settings className="h-4 w-4" /> },
  ],
  paciente: [
    { label: "Mi cuenta", href: "/cuenta", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Agendar cita", href: "/reservar", icon: <CalendarDays className="h-4 w-4" /> },
    { label: "Pagos", href: "/cuenta/pagos", icon: <CreditCard className="h-4 w-4" /> },
    { label: "Recompensas", href: "/cuenta/recompensas", icon: <Sparkles className="h-4 w-4" /> },
  ],
};

// Shell de panel estilo referencia: sidebar blanco redondeado con logo,
// navegación, tarjeta de usuario y logout; contenido sobre fondo gris claro.
export function PanelShell({
  sesion,
  activo,
  onLogout,
  children,
}: {
  sesion: SesionDemo;
  activo: string;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const items = NAV[sesion.rol];
  const inicial = sesion.nombre.replace(/^Dra?\.\s*/, "").charAt(0);

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl gap-6 p-4 sm:p-6">
      {/* Sidebar */}
      <aside
        className="anim-in sticky top-6 hidden h-[calc(100vh-3rem)] w-60 shrink-0 flex-col rounded-3xl p-5 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10 md:flex"
        style={{ background: "var(--card)" }}
      >
        <Link href="/" className="mb-8 flex items-center gap-2 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-400 text-sm font-bold text-white">
            M
          </span>
          <span className="font-display leading-none">
            <span className="block text-sm font-bold tracking-tight">
              Medical <span className="text-accent-600">OS</span>
            </span>
            <span className="block text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--ink-muted)" }}>
              by Partum
            </span>
          </span>
        </Link>

        <nav className="flex-1 space-y-1">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                item.label === activo
                  ? "bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow-sm"
                  : "hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Usuario + logout */}
        <div className="mt-6 border-t border-slate-100 pt-5 text-center dark:border-white/10">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-400 text-xl font-semibold text-white shadow-md">
            {inicial}
          </div>
          <p className="text-sm font-semibold">{sesion.nombre}</p>
          <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
            {sesion.subtitulo}
          </p>
          <button
            onClick={() => {
              onLogout();
              router.push("/");
            }}
            className="mx-auto mt-4 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
            style={{ color: "var(--ink-muted)" }}
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <div className="min-w-0 flex-1">
        {/* Barra superior móvil */}
        <div className="anim-in mb-4 flex items-center justify-between rounded-2xl px-4 py-3 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10 md:hidden" style={{ background: "var(--card)" }}>
          <Link href="/" className="font-display text-sm font-semibold">
            Medical <span className="text-accent-600">OS</span>
          </Link>
          <button
            onClick={() => {
              onLogout();
              router.push("/");
            }}
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: "var(--ink-muted)" }}
          >
            <LogOut className="h-4 w-4" /> Salir
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Tarjeta KPI pastel (estilo referencia): fondo suave, chip de icono y cifra.
export function KpiPastel({
  icon,
  label,
  value,
  nota,
  tono,
  delay = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  nota?: string;
  tono: "lila" | "azul" | "menta" | "durazno";
  delay?: string;
}) {
  const fondos = {
    lila: "bg-pastel-lila",
    azul: "bg-pastel-azul",
    menta: "bg-pastel-menta",
    durazno: "bg-pastel-durazno",
  } as const;
  return (
    <div className={`anim-in ${delay} card-hover rounded-2xl ${fondos[tono]} p-5 text-slate-800`}>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/70 text-slate-700">
          {icon}
        </span>
        <span className="text-xs font-medium text-slate-600">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums tracking-tight">{value}</p>
      {nota && <p className="mt-1 text-[11px] text-slate-500">{nota}</p>}
    </div>
  );
}
