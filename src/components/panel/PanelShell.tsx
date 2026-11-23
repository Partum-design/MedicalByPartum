"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  Boxes,
  CalendarCheck2,
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  Clock3,
  CreditCard,
  ExternalLink,
  FileHeart,
  Gift,
  Grid2x2,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Megaphone,
  PieChart,
  Plug,
  RotateCcw,
  ScanLine,
  Search,
  Settings,
  Stethoscope,
  Syringe,
  Tags,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";
import type { Rol } from "@/lib/datos/modelo";
import { useClinica } from "@/lib/store";
import { Logo } from "@/components/marca/Logo";
import { Avatar, Cargando, hace } from "@/components/ui";
import { TablasResponsivas } from "@/components/panel/TablasResponsivas";

type Item = { label: string; corto?: string; href: string; icon: ReactNode; grupo?: string; extra?: ReactNode };

function navDe(rol: Rol, lealtadActiva: boolean): Item[] {
  if (rol === "admin")
    return [
      { grupo: "Operación", label: "Panel", href: "/dashboard/admin", icon: <LayoutDashboard /> },
      { label: "Agenda y citas", corto: "Agenda", href: "/dashboard/admin/citas", icon: <CalendarDays /> },
      { label: "Confirmar llegada", corto: "Llegadas", href: "/dashboard/admin/confirmar", icon: <ScanLine /> },
      { label: "Pacientes", href: "/dashboard/admin/pacientes", icon: <Users /> },
      { grupo: "Clínica", label: "Equipo médico", corto: "Equipo", href: "/dashboard/admin/equipo", icon: <Stethoscope /> },
      { label: "Disponibilidad", corto: "Horarios", href: "/dashboard/admin/disponibilidad", icon: <Clock3 /> },
      { label: "Servicios", href: "/dashboard/admin/servicios", icon: <Tags /> },
      { label: "Inventario", href: "/dashboard/admin/inventario", icon: <Boxes /> },
      { grupo: "Negocio", label: "Caja y finanzas", corto: "Caja", href: "/dashboard/admin/caja", icon: <Wallet /> },
      { label: "Reportes", href: "/dashboard/admin/reportes", icon: <PieChart /> },
      { label: "Marketing", href: "/dashboard/admin/marketing", icon: <Megaphone /> },
      {
        label: "Lealtad",
        href: "/dashboard/admin/lealtad",
        icon: <Gift />,
        extra: !lealtadActiva ? <span className="chip" style={{ marginLeft: "auto", height: 20, fontSize: 10.5 }}>Apagado</span> : null,
      },
      { grupo: "Sistema", label: "Integraciones", corto: "Conexiones", href: "/dashboard/admin/integraciones", icon: <Plug /> },
      { label: "Configuración", corto: "Ajustes", href: "/dashboard/admin/configuracion", icon: <Settings /> },
    ];
  if (rol === "medico")
    return [
      { grupo: "Mi consulta", label: "Mi agenda", corto: "Agenda", href: "/dashboard/medico", icon: <CalendarDays /> },
      { label: "Confirmar llegada", corto: "Llegadas", href: "/dashboard/medico/confirmar", icon: <ScanLine /> },
      { label: "Expedientes", href: "/dashboard/medico/expedientes", icon: <FileHeart /> },
      { label: "Mis horarios", corto: "Horarios", href: "/dashboard/medico/horarios", icon: <Clock3 /> },
      { grupo: "Cuenta", label: "Google Calendar", corto: "Google", href: "/dashboard/medico/google", icon: <CalendarCheck2 /> },
      { label: "Mi perfil", corto: "Perfil", href: "/dashboard/medico/perfil", icon: <UserRound /> },
    ];
  return [
    { grupo: "Mi salud", label: "Inicio", href: "/cuenta", icon: <LayoutDashboard /> },
    { label: "Agendar cita", corto: "Agendar", href: "/reservar", icon: <CalendarPlus /> },
    { label: "Mis citas", corto: "Citas", href: "/cuenta/citas", icon: <CalendarDays /> },
    { label: "Expediente", href: "/cuenta/expediente", icon: <ClipboardList /> },
    { label: "Cartilla de vacunación", corto: "Vacunas", href: "/cuenta/vacunas", icon: <Syringe /> },
    { grupo: "Cuenta", label: "Pagos", href: "/cuenta/pagos", icon: <CreditCard /> },
    ...(lealtadActiva ? [{ label: "Mi tarjeta", corto: "Tarjeta", href: "/cuenta/tarjeta", icon: <Gift /> }] : []),
  ];
}

const PRINCIPALES: Record<Rol, string[]> = {
  admin: ["/dashboard/admin", "/dashboard/admin/citas", "/dashboard/admin/confirmar", "/dashboard/admin/pacientes"],
  medico: ["/dashboard/medico", "/dashboard/medico/confirmar", "/dashboard/medico/expedientes", "/dashboard/medico/horarios"],
  paciente: ["/cuenta", "/reservar", "/cuenta/citas", "/cuenta/vacunas"],
};

/** Marco de todas las pantallas privadas: barra lateral, barra superior y navegación móvil. */
export function PanelShell({ children, titulo }: { children: ReactNode; titulo?: string }) {
  const c = useClinica();
  const router = useRouter();
  const ruta = usePathname();
  const [mas, setMas] = useState(false);
  const [campana, setCampana] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (c.listo && !c.sesion) router.replace(`/login?siguiente=${encodeURIComponent(ruta)}`);
  }, [c.listo, c.sesion, router, ruta]);

  useEffect(() => {
    setMas(false);
    setCampana(false);
  }, [ruta]);

  useEffect(() => {
    if (!campana) return;
    const fuera = (e: MouseEvent) => panelRef.current && !panelRef.current.contains(e.target as Node) && setCampana(false);
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, [campana]);

  const items = useMemo(() => (c.sesion ? navDe(c.sesion.rol, c.recompensasConfig.activa) : []), [c.sesion, c.recompensasConfig.activa]);

  if (!c.listo || !c.sesion) {
    return (
      <div className="app">
        <Cargando />
      </div>
    );
  }

  const s = c.sesion;
  const activo = (href: string) => (href === ruta ? true : href !== "/cuenta" && href !== "/dashboard/admin" && href !== "/dashboard/medico" && ruta.startsWith(href));
  const principales = items.filter((i) => PRINCIPALES[s.rol].includes(i.href));
  const avisos = c.avisos.filter((a) => a.para === s.id || (s.rol === "admin" && a.para === "admin"));
  const sinLeer = avisos.filter((a) => !a.leido).length;
  const medico = s.rol === "medico" ? c.medicos.find((m) => m.id === s.id) : null;

  const salir = async () => {
    await c.logout();
    router.replace("/login");
  };

  const navegacion = (
    <>
      {items.map((i) => (
        <div key={i.href}>
          {i.grupo && <div className="app-nav-grupo">{i.grupo}</div>}
          <Link href={i.href} className={activo(i.href) ? "is-active" : ""}>
            {i.icon}
            <span>{i.label}</span>
            {i.extra}
          </Link>
        </div>
      ))}
    </>
  );

  return (
    <div className="app">
      <aside className="app-sidebar">
        <div className="app-sidebar-logo">
          <Link href="/" aria-label="Ir a la portada">
            <Logo alto={32} />
          </Link>
        </div>
        <nav className="app-nav">{navegacion}</nav>
        <div className="app-sidebar-foot">
          <div className="app-user">
            <Avatar nombre={s.nombre} color={medico?.color} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--navy)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.nombre}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{s.subtitulo}</div>
            </div>
            <button type="button" className="btn btn-ghost btn-icon" onClick={salir} aria-label="Cerrar sesión" title="Cerrar sesión">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-top">
          <Link href="/" className="lg:hidden" aria-label="Portada">
            <Logo alto={26} />
          </Link>
          {titulo && <span className="hidden text-sm lg:inline" style={{ color: "var(--muted)" }}>{titulo}</span>}
          <div className="ml-auto flex items-center gap-2">
            {s.rol !== "paciente" && (
              <Link href={s.rol === "admin" ? "/dashboard/admin/pacientes" : "/dashboard/medico/expedientes"} className="btn btn-ghost btn-sm hidden md:inline-flex" style={{ color: "var(--muted)", minWidth: 220, justifyContent: "flex-start" }}>
                <Search size={16} /> Buscar paciente…
              </Link>
            )}
            <span className="chip chip-mint hidden sm:inline-flex" title="Los datos viven en este navegador y en un servidor simulado">
              <HeartPulse size={13} /> Demo · {c.sincronizando ? "guardando…" : "datos simulados"}
            </span>
            <div style={{ position: "relative" }} ref={panelRef}>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                aria-label={`Avisos${sinLeer ? `, ${sinLeer} sin leer` : ""}`}
                onClick={() => {
                  setCampana((v) => !v);
                  if (!campana && sinLeer) c.marcarAvisosLeidos();
                }}
                style={{ position: "relative" }}
              >
                <Bell size={18} />
                {sinLeer > 0 && (
                  <span style={{ position: "absolute", top: 6, right: 7, width: 9, height: 9, borderRadius: 9, background: "var(--danger)", boxShadow: "0 0 0 2px #fff" }} />
                )}
              </button>
              {campana && (
                <div className="card anim-in" style={{ position: "absolute", right: 0, top: 48, width: 340, maxWidth: "calc(100vw - 32px)", zIndex: 60, boxShadow: "var(--shadow-lg)", padding: 8 }}>
                  <div style={{ padding: "10px 12px 6px", fontWeight: 600, color: "var(--navy)" }}>Avisos</div>
                  {avisos.length === 0 && <p style={{ padding: 12, color: "var(--muted)", fontSize: 14 }}>Sin avisos por ahora.</p>}
                  <div style={{ maxHeight: 360, overflowY: "auto" }}>
                    {avisos.slice(0, 12).map((a) => {
                      const cuerpo = (
                        <div style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 12 }} className="hover:bg-[var(--bg-2)]">
                          <span className="dot" style={{ marginTop: 7, color: a.leido ? "var(--line)" : "var(--teal)" }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, fontSize: 14, color: "var(--navy)" }}>{a.titulo}</div>
                            <div style={{ fontSize: 13, color: "var(--muted)" }}>{a.detalle}</div>
                            <div style={{ fontSize: 11.5, color: "var(--soft)", marginTop: 2 }}>{hace(a.creado_en)}</div>
                          </div>
                        </div>
                      );
                      return a.enlace ? (
                        <Link key={a.id} href={a.enlace}>
                          {cuerpo}
                        </Link>
                      ) : (
                        <div key={a.id}>{cuerpo}</div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <span className="lg:hidden">
              <Avatar nombre={s.nombre} color={medico?.color} size="is-sm" />
            </span>
          </div>
        </header>

        <main className="app-content">
          <TablasResponsivas />
          {children}
        </main>
      </div>

      <nav className="app-bottom" aria-label="Navegación principal">
        {principales.map((i) => (
          <Link key={i.href} href={i.href} className={activo(i.href) ? "is-active" : ""}>
            {i.icon}
            {i.corto ?? i.label}
          </Link>
        ))}
        <button type="button" onClick={() => setMas(true)} className={!principales.some((i) => activo(i.href)) ? "is-active" : ""}>
          <Grid2x2 />
          Más
        </button>
      </nav>

      {mas && (
        <>
          <div className="modal-fondo" style={{ zIndex: 110 }} onClick={() => setMas(false)} />
          <div className="app-hoja" role="dialog" aria-label="Más secciones">
            <div style={{ width: 44, height: 5, borderRadius: 9, background: "var(--line)", margin: "0 auto 12px" }} />
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <div className="flex items-center gap-3">
                <Avatar nombre={s.nombre} color={medico?.color} />
                <div>
                  <div style={{ fontWeight: 600, color: "var(--navy)" }}>{s.nombre}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>{s.subtitulo}</div>
                </div>
              </div>
              <button type="button" className="btn btn-ghost btn-icon" onClick={() => setMas(false)} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2" style={{ marginTop: 10 }}>
              {items.map((i) => (
                <Link key={i.href} href={i.href} className="card" style={{ display: "grid", justifyItems: "center", gap: 6, padding: "14px 6px", fontSize: 12.5, textAlign: "center", color: activo(i.href) ? "var(--teal-700)" : "var(--slate)", background: activo(i.href) ? "var(--teal-50)" : "#fff" }}>
                  <span className="icon-tile is-sm is-soft">{i.icon}</span>
                  {i.corto ?? i.label}
                </Link>
              ))}
            </div>
            <div className="grid gap-2" style={{ marginTop: 14 }}>
              <Link href="/" className="btn btn-ghost">
                <ExternalLink /> Ver portada de la clínica
              </Link>
              {s.rol === "admin" && (
                <button type="button" className="btn btn-ghost" onClick={() => void c.restablecerDemo()}>
                  <RotateCcw /> Restablecer datos de la demo
                </button>
              )}
              <button type="button" className="btn btn-danger" onClick={salir}>
                <LogOut /> Cerrar sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
