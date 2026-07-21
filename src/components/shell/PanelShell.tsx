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

// Shell compartido: escritorio con sidebar fijo y móvil con navegación inferior.
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
    <div className="app-shell">
      <aside className="app-sidebar anim-in">
        <Link href="/" className="app-brand">
          <span className="app-brand-mark">
            <span className="app-brand-pulse" />
            M
          </span>
          <span className="font-display leading-none">
            <span className="block text-sm font-bold tracking-tight text-white">
              Medical <span className="text-mint-raw">OS</span>
            </span>
            <span className="block text-[9px] uppercase tracking-[0.22em] text-white/40">
              by Partum
            </span>
          </span>
        </Link>

        <p className="app-nav-label">Espacio de trabajo</p>
        <nav className="app-nav" aria-label="Navegación principal">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-current={item.label === activo ? "page" : undefined}
              className={`app-nav-item ${item.label === activo ? "is-active" : ""}`}
            >
              <span className="app-nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="app-user-card">
          <div className="flex items-center gap-3">
            <div className="app-user-avatar">{inicial}</div>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold text-white">{sesion.nombre}</p>
              <p className="truncate text-[11px] text-white/48">{sesion.subtitulo}</p>
            </div>
          </div>
          <button
            onClick={() => {
              onLogout();
              router.push("/");
            }}
            className="app-logout"
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-mobile-header anim-in">
          <Link href="/" className="flex items-center gap-2 font-display text-sm font-semibold text-white">
            <span className="app-mobile-mark">M</span>
            Medical <span className="text-mint-raw">OS</span>
          </Link>
          <button
            onClick={() => {
              onLogout();
              router.push("/");
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-white/70"
          >
            <LogOut className="h-4 w-4" /> Salir
          </button>
        </header>

        <div className="app-page">{children}</div>

        <nav className="app-mobile-nav" aria-label="Navegación móvil">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-current={item.label === activo ? "page" : undefined}
              className={`app-mobile-item ${item.label === activo ? "is-active" : ""}`}
            >
              {item.icon}
              <span>{item.label.replace("Configuración", "Ajustes").replace("Equipo médico", "Equipo")}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

// KPI basado en la misma escala de seis tonos de la marca.
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
    lila: "kpi-slate",
    azul: "kpi-cyan",
    menta: "kpi-mint",
    durazno: "kpi-fog",
  } as const;
  return (
    <div className={`anim-in ${delay} kpi-card ${fondos[tono]}`}>
      <div className="mb-3 flex items-center gap-2">
        <span className="kpi-card-icon">
          {icon}
        </span>
        <span className="text-xs font-medium text-ink-900/70">{label}</span>
      </div>
      <p className="font-num text-2xl font-semibold tabular-nums tracking-tight text-ink-900">{value}</p>
      {nota && <p className="mt-1 text-[11px] leading-relaxed text-ink-900/55">{nota}</p>}
    </div>
  );
}
