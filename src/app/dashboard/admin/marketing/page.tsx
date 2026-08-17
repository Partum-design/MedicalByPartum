"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BadgeDollarSign,
  CalendarCheck,
  CreditCard,
  Eye,
  Loader2,
  MousePointerClick,
  Search,
  ShieldCheck,
  Target,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react";
import { PanelShell, KpiPastel } from "@/components/shell/PanelShell";
import { useDemoStore } from "@/lib/demo-store";
import type { ResumenAds, ResumenAnalytics } from "@/lib/integrations/tipos";

type Pestana = "audiencia" | "campanas" | "atribucion";

const CATEGORICAL_LIGHT = ["#213A58", "#0C6478", "#15919B", "#09D1C7", "#46DFB1"];
const CATEGORICAL_DARK = ["#80EE98", "#46DFB1", "#09D1C7", "#15919B", "#0C6478"];
const INK_MUTED_LIGHT = "#617385";
const INK_MUTED_DARK = "#B9EBE3";
const GRID_LIGHT = "#DCE7E4";
const GRID_DARK = "#0C6478";

const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
const numero = new Intl.NumberFormat("es-MX");
const compacto = (valor: number) => {
  if (Math.abs(valor) >= 1000) return `${(valor / 1000).toFixed(1).replace(".", ",")} k`;
  return String(Math.round(valor));
};
const porcentaje = (valor: number, decimales = 1) => `${(valor * 100).toFixed(decimales).replace(".", ",")}%`;
const duracion = (segundos: number) => {
  const m = Math.floor(segundos / 60);
  const s = Math.round(segundos % 60);
  return `${m}:${String(s).padStart(2, "0")} min`;
};

const diaCorto = (iso: string) => {
  const limpia = iso.includes("-") ? iso : `${iso.slice(0, 4)}-${iso.slice(4, 6)}-${iso.slice(6, 8)}`;
  const d = new Date(`${limpia}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", timeZone: "UTC" });
};

function useEsDark() {
  const [esOscuro, setEsOscuro] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setEsOscuro(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setEsOscuro(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return esOscuro;
}

function TooltipCard({ active, payload, label, formatter }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string; formatter: (v: number) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-900/10 bg-white px-3 py-2 text-xs shadow-lg dark:border-white/10 dark:bg-slate-900">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-1.5" style={{ color: p.color }}>
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-600 dark:text-slate-300">{p.name}:</span>
          <span className="font-semibold">{formatter(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

/**
 * Panel de marketing: cómo se vería enlazar Google Analytics y Google Ads a
 * la clínica y cruzarlos con las citas reales. Si no hay credenciales
 * configuradas, las rutas de servidor devuelven un juego de demostración
 * marcado como tal, para que el panel se vea exactamente igual.
 */
export default function MarketingPage() {
  const store = useDemoStore();
  const { listo, sesion, citas } = store;
  const esOscuro = useEsDark();
  const [pestana, setPestana] = useState<Pestana>("audiencia");
  const [analytics, setAnalytics] = useState<ResumenAnalytics | null>(null);
  const [ads, setAds] = useState<ResumenAds | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vivo = true;
    Promise.all([
      fetch("/api/integrations/analytics").then((r) => r.json() as Promise<ResumenAnalytics>),
      fetch("/api/integrations/google-ads").then((r) => r.json() as Promise<ResumenAds>),
    ])
      .then(([a, g]) => {
        if (!vivo) return;
        setAnalytics(a);
        setAds(g);
      })
      .finally(() => vivo && setCargando(false));
    return () => {
      vivo = false;
    };
  }, []);

  const citasPeriodo = useMemo(() => {
    const desde = Date.now() - 28 * 24 * 3600 * 1000;
    return citas.filter((c) => c.estado !== "cancelada" && new Date(c.inicio).getTime() >= desde);
  }, [citas]);

  const ingresos = useMemo(
    () => citasPeriodo.reduce((acc, c) => acc + (c.estado_pago === "pagado" ? c.precio : 0), 0),
    [citasPeriodo]
  );

  if (!listo) return null;
  if (!sesion || sesion.rol !== "admin") return <SinSesion />;

  return (
    <PanelShell sesion={sesion} activo="Marketing" onLogout={store.logout}>
      <header className="anim-in mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Marketing</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-muted)" }}>
          Google Analytics y Google Ads en un mismo lugar, cruzados con las citas y los cobros
          reales de la clínica.
        </p>
      </header>

      <Tabs
        valor={pestana}
        onChange={setPestana}
        opciones={[
          { id: "audiencia", label: "Audiencia · GA4" },
          { id: "campanas", label: "Campañas · Google Ads" },
          { id: "atribucion", label: "Atribución" },
        ]}
      />

      {cargando && (
        <div
          className="mt-4 flex items-center justify-center gap-2 rounded-3xl py-10 text-sm shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10"
          style={{ background: "var(--card)", color: "var(--ink-muted)" }}
        >
          <Loader2 className="h-4 w-4 animate-spin" /> Consultando Google…
        </div>
      )}

      {!cargando && pestana === "audiencia" && analytics && (
        <Audiencia datos={analytics} esOscuro={esOscuro} />
      )}
      {!cargando && pestana === "campanas" && ads && <Campanas datos={ads} esOscuro={esOscuro} />}
      {!cargando && pestana === "atribucion" && analytics && ads && (
        <Atribucion
          analytics={analytics}
          ads={ads}
          citas={citasPeriodo.length}
          pagadas={citasPeriodo.filter((c) => c.estado_pago === "pagado").length}
          ingresos={ingresos}
          esOscuro={esOscuro}
        />
      )}
    </PanelShell>
  );
}

// --- Piezas compartidas ------------------------------------------------

function Tabs({
  valor,
  onChange,
  opciones,
}: {
  valor: Pestana;
  onChange: (v: Pestana) => void;
  opciones: { id: Pestana; label: string }[];
}) {
  return (
    <div className="anim-in anim-d1 mb-4 inline-flex flex-wrap gap-1 rounded-2xl p-1 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10" style={{ background: "var(--card)" }}>
      {opciones.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
            valor === o.id
              ? "bg-gradient-to-r from-brand-600 to-accent-500 text-white shadow"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function DataSourceNote({ origen, aviso }: { origen: "vivo" | "demostracion"; aviso?: string }) {
  return (
    <p
      className="anim-in mb-4 flex items-start gap-2 rounded-2xl px-4 py-3 text-xs shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10"
      style={{ background: "var(--card)", color: "var(--ink-muted)" }}
    >
      <span
        className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
          origen === "vivo"
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
            : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
        }`}
      >
        {origen === "vivo" ? "Datos en vivo" : "Demostración"}
      </span>
      <span>{aviso ?? "Cifras reales de la cuenta de Google conectada."}</span>
    </p>
  );
}

function Panel({ titulo, descripcion, children, className = "" }: { titulo: string; descripcion?: string; children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`anim-in mb-4 rounded-3xl p-5 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10 ${className}`}
      style={{ background: "var(--card)" }}
    >
      <div className="mb-4">
        <h2 className="font-semibold">{titulo}</h2>
        {descripcion && (
          <p className="mt-0.5 text-xs" style={{ color: "var(--ink-muted)" }}>
            {descripcion}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function ShareBar({ valor, color }: { valor: number; color: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-900/5 dark:bg-white/10">
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${Math.min(100, Math.max(2, valor * 100))}%`, background: color }}
      />
    </div>
  );
}

function EmptyState({ texto }: { texto: string }) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-2 text-center text-sm" style={{ color: "var(--ink-muted)" }}>
      <Search className="h-5 w-5" />
      {texto}
    </div>
  );
}

// --- Audiencia -----------------------------------------------------------

function Audiencia({ datos, esOscuro }: { datos: ResumenAnalytics; esOscuro: boolean }) {
  const cat = esOscuro ? CATEGORICAL_DARK : CATEGORICAL_LIGHT;
  const inkMuted = esOscuro ? INK_MUTED_DARK : INK_MUTED_LIGHT;
  const grid = esOscuro ? GRID_DARK : GRID_LIGHT;
  const serie = datos.serie.map((p) => ({ ...p, etiqueta: diaCorto(p.fecha) }));
  const maxCanal = Math.max(1, ...datos.canales.map((c) => c.sesiones));
  const totalDispositivos = Math.max(1, datos.dispositivos.reduce((a, d) => a + d.sesiones, 0));

  return (
    <div>
      <DataSourceNote origen={datos.origen} aviso={datos.aviso} />

      <section className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiPastel tono="lila" delay="anim-d1" icon={<Users className="h-4 w-4" />} label="Usuarios activos" value={numero.format(datos.usuariosActivos)} nota={`${numero.format(datos.usuariosNuevos)} nuevos`} />
        <KpiPastel tono="azul" delay="anim-d2" icon={<Eye className="h-4 w-4" />} label="Sesiones" value={numero.format(datos.sesiones)} nota={`${numero.format(datos.vistas)} vistas de página`} />
        <KpiPastel tono="menta" delay="anim-d3" icon={<Timer className="h-4 w-4" />} label="Duración media" value={duracion(datos.duracionMediaSeg)} nota={`${porcentaje(datos.tasaInteraccion)} con interacción`} />
        <KpiPastel tono="durazno" delay="anim-d4" icon={<Target className="h-4 w-4" />} label="Conversiones" value={numero.format(datos.conversiones)} nota={`${porcentaje(datos.conversiones / Math.max(1, datos.sesiones), 2)} de las sesiones`} />
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel titulo="Usuarios y sesiones" descripcion="Últimos 28 días">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={serie} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradUsuarios" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={cat[4]} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={cat[4]} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gradSesiones" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={cat[0]} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={cat[0]} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={grid} />
                  <XAxis dataKey="etiqueta" tickLine={false} axisLine={{ stroke: grid }} tick={{ fill: inkMuted, fontSize: 11 }} interval="preserveStartEnd" minTickGap={28} />
                  <YAxis tickLine={false} axisLine={{ stroke: grid }} tick={{ fill: inkMuted, fontSize: 12 }} width={40} tickFormatter={compacto} />
                  <Tooltip content={<TooltipCard formatter={(v) => numero.format(v)} />} cursor={{ stroke: cat[0], strokeOpacity: 0.25 }} />
                  <Legend wrapperStyle={{ fontSize: "0.7rem", color: inkMuted }} />
                  <Area type="monotone" dataKey="sesiones" name="Sesiones" stroke={cat[0]} fill="url(#gradSesiones)" strokeWidth={1.6} />
                  <Area type="monotone" dataKey="usuarios" name="Usuarios" stroke={cat[4]} fill="url(#gradUsuarios)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel titulo="Páginas más vistas" descripcion="Dónde pasa el tiempo la gente antes de reservar">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr style={{ color: "var(--ink-muted)" }} className="text-xs">
                    <th className="pb-2 font-medium">Ruta</th>
                    <th className="pb-2 text-right font-medium">Vistas</th>
                    <th className="pb-2 text-right font-medium">Tiempo medio</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.paginas.map((p) => (
                    <tr key={p.ruta} className="border-t border-slate-900/5 dark:border-white/10">
                      <td className="py-2 font-medium">{p.ruta}</td>
                      <td className="py-2 text-right tabular-nums">{numero.format(p.vistas)}</td>
                      <td className="py-2 text-right tabular-nums" style={{ color: "var(--ink-muted)" }}>{duracion(p.duracionMediaSeg)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div>
          <Panel titulo="Canales de adquisición" descripcion="De dónde llega la gente">
            <div className="grid gap-3">
              {datos.canales.map((c, i) => (
                <div key={c.nombre}>
                  <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
                    <span>{c.nombre}</span>
                    <span className="tabular-nums" style={{ color: "var(--ink-muted)" }}>{numero.format(c.sesiones)}</span>
                  </div>
                  <ShareBar valor={c.sesiones / maxCanal} color={cat[i % cat.length]} />
                </div>
              ))}
            </div>
          </Panel>

          <Panel titulo="Dispositivos" descripcion="Desde dónde agendan los pacientes">
            <div className="grid gap-3">
              {datos.dispositivos.map((d, i) => (
                <div key={d.nombre}>
                  <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
                    <span>{d.nombre}</span>
                    <span className="tabular-nums" style={{ color: "var(--ink-muted)" }}>{porcentaje(d.sesiones / totalDispositivos, 0)}</span>
                  </div>
                  <ShareBar valor={d.sesiones / totalDispositivos} color={cat[(i + 1) % cat.length]} />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

// --- Campañas --------------------------------------------------------------

function Campanas({ datos, esOscuro }: { datos: ResumenAds; esOscuro: boolean }) {
  const cat = esOscuro ? CATEGORICAL_DARK : CATEGORICAL_LIGHT;
  const inkMuted = esOscuro ? INK_MUTED_DARK : INK_MUTED_LIGHT;
  const grid = esOscuro ? GRID_DARK : GRID_LIGHT;
  const serie = datos.serie.map((p) => ({ ...p, etiqueta: diaCorto(p.fecha) }));

  return (
    <div>
      <DataSourceNote origen={datos.origen} aviso={datos.aviso} />

      <section className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiPastel tono="lila" delay="anim-d1" icon={<BadgeDollarSign className="h-4 w-4" />} label="Inversión" value={mxn.format(datos.costo)} nota={`CPC medio ${mxn.format(datos.cpc)}`} />
        <KpiPastel tono="azul" delay="anim-d2" icon={<MousePointerClick className="h-4 w-4" />} label="Clics" value={numero.format(datos.clics)} nota={`CTR ${porcentaje(datos.ctr, 2)} sobre ${numero.format(datos.impresiones)} impresiones`} />
        <KpiPastel tono="menta" delay="anim-d3" icon={<Target className="h-4 w-4" />} label="Conversiones" value={numero.format(Math.round(datos.conversiones))} nota={`CPA ${mxn.format(datos.cpa)}`} />
        <KpiPastel tono="durazno" delay="anim-d4" icon={<TrendingUp className="h-4 w-4" />} label="ROAS" value={`${datos.roas.toFixed(2).replace(".", ",")}×`} nota={`${mxn.format(datos.valorConversion)} en valor de conversión`} />
      </section>

      <Panel titulo="Inversión y conversiones" descripcion="Últimos 28 días">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={serie} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={grid} />
              <XAxis dataKey="etiqueta" tickLine={false} axisLine={{ stroke: grid }} tick={{ fill: inkMuted, fontSize: 11 }} interval="preserveStartEnd" minTickGap={28} />
              <YAxis yAxisId="izq" tickLine={false} axisLine={{ stroke: grid }} tick={{ fill: inkMuted, fontSize: 12 }} width={46} tickFormatter={compacto} />
              <YAxis yAxisId="der" orientation="right" tickLine={false} axisLine={{ stroke: grid }} tick={{ fill: inkMuted, fontSize: 12 }} width={34} tickFormatter={compacto} />
              <Tooltip content={<TooltipCard formatter={(v) => numero.format(v)} />} cursor={{ fill: esOscuro ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)" }} />
              <Legend wrapperStyle={{ fontSize: "0.7rem", color: inkMuted }} />
              <Bar yAxisId="izq" dataKey="costo" name="Inversión" fill={cat[0]} radius={[4, 4, 0, 0]} maxBarSize={16} />
              <Line yAxisId="der" type="monotone" dataKey="conversiones" name="Conversiones" stroke={cat[4]} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel titulo="Campañas" descripcion={`Moneda de la cuenta: ${datos.moneda}`}>
        {datos.campanas.length === 0 ? (
          <EmptyState texto="No hay campañas con actividad en el periodo." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ color: "var(--ink-muted)" }} className="text-xs">
                  <th className="pb-2 font-medium">Campaña</th>
                  <th className="pb-2 font-medium">Estado</th>
                  <th className="pb-2 text-right font-medium">Impresiones</th>
                  <th className="pb-2 text-right font-medium">Clics</th>
                  <th className="pb-2 text-right font-medium">CTR</th>
                  <th className="pb-2 text-right font-medium">Inversión</th>
                  <th className="pb-2 text-right font-medium">Conv.</th>
                  <th className="pb-2 text-right font-medium">CPA</th>
                </tr>
              </thead>
              <tbody>
                {datos.campanas.map((c) => (
                  <tr key={c.id} className="border-t border-slate-900/5 dark:border-white/10">
                    <td className="py-2 pr-3">
                      <p className="font-medium">{c.nombre}</p>
                      <p className="text-[11px]" style={{ color: "var(--ink-muted)" }}>
                        {c.canal} · {mxn.format(c.presupuestoDiario)}/día
                      </p>
                    </td>
                    <td className="py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          c.estado === "activa"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : c.estado === "pausada"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                              : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                        }`}
                      >
                        {c.estado}
                      </span>
                    </td>
                    <td className="py-2 text-right tabular-nums">{numero.format(c.impresiones)}</td>
                    <td className="py-2 text-right tabular-nums">{numero.format(c.clics)}</td>
                    <td className="py-2 text-right tabular-nums" style={{ color: "var(--ink-muted)" }}>{porcentaje(c.ctr, 2)}</td>
                    <td className="py-2 text-right tabular-nums">{mxn.format(c.costo)}</td>
                    <td className="py-2 text-right tabular-nums">{numero.format(Math.round(c.conversiones))}</td>
                    <td className="py-2 text-right tabular-nums" style={{ color: "var(--ink-muted)" }}>{mxn.format(c.cpa)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {datos.terminos.length > 0 && (
        <Panel titulo="Términos de búsqueda" descripcion="Lo que la gente escribió antes de hacer clic">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datos.terminos} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid horizontal={false} stroke={grid} />
                <XAxis type="number" tickLine={false} axisLine={{ stroke: grid }} tick={{ fill: inkMuted, fontSize: 11 }} tickFormatter={compacto} />
                <YAxis type="category" dataKey="termino" width={160} tickLine={false} axisLine={{ stroke: grid }} tick={{ fill: inkMuted, fontSize: 11 }} />
                <Tooltip content={<TooltipCard formatter={(v) => numero.format(v)} />} cursor={{ fill: esOscuro ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)" }} />
                <Bar dataKey="clics" name="Clics" radius={[0, 4, 4, 0]} maxBarSize={14}>
                  {datos.terminos.map((_, i) => (
                    <Cell key={i} fill={cat[i % cat.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      )}
    </div>
  );
}

// --- Atribución ------------------------------------------------------------

function Atribucion({
  analytics,
  ads,
  citas,
  pagadas,
  ingresos,
  esOscuro,
}: {
  analytics: ResumenAnalytics;
  ads: ResumenAds;
  citas: number;
  pagadas: number;
  ingresos: number;
  esOscuro: boolean;
}) {
  const cat = esOscuro ? CATEGORICAL_DARK : CATEGORICAL_LIGHT;
  const pasos = [
    { icono: <Eye className="h-4 w-4" />, label: "Sesiones en el sitio", valor: analytics.sesiones },
    { icono: <MousePointerClick className="h-4 w-4" />, label: "Clics de campaña", valor: ads.clics },
    { icono: <CalendarCheck className="h-4 w-4" />, label: "Citas agendadas", valor: citas },
    { icono: <CreditCard className="h-4 w-4" />, label: "Citas cobradas", valor: pagadas },
  ];
  const tope = Math.max(1, ...pasos.map((p) => p.valor));

  const costoPorCita = citas > 0 ? ads.costo / citas : 0;
  const retorno = ads.costo > 0 ? ingresos / ads.costo : 0;
  const margen = ingresos - ads.costo;

  return (
    <div>
      <p
        className="anim-in mb-4 flex items-start gap-2 rounded-2xl px-4 py-3 text-xs shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10"
        style={{ background: "var(--card)", color: "var(--ink-muted)" }}
      >
        <TrendingUp className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          <b style={{ color: "var(--ink)" }}>Cruce de fuentes.</b> El tráfico y el gasto vienen de Google; las
          citas y los cobros salen de la operación real de la clínica. Es la única vista donde se ve si la
          publicidad está pagando el consultorio.
        </span>
      </p>

      <section className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiPastel tono="lila" delay="anim-d1" icon={<BadgeDollarSign className="h-4 w-4" />} label="Inversión publicitaria" value={mxn.format(ads.costo)} nota="Últimos 28 días" />
        <KpiPastel tono="azul" delay="anim-d2" icon={<CreditCard className="h-4 w-4" />} label="Ingresos cobrados" value={mxn.format(ingresos)} nota={`${pagadas} citas pagadas`} />
        <KpiPastel tono="menta" delay="anim-d3" icon={<Target className="h-4 w-4" />} label="Costo por cita" value={costoPorCita > 0 ? mxn.format(costoPorCita) : "—"} nota={`${citas} citas en el periodo`} />
        <KpiPastel
          tono="durazno"
          delay="anim-d4"
          icon={<TrendingUp className="h-4 w-4" />}
          label="Retorno sobre inversión"
          value={`${retorno.toFixed(2).replace(".", ",")}×`}
          nota={`${margen >= 0 ? "Margen" : "Pérdida"} de ${mxn.format(Math.abs(margen))}`}
        />
      </section>

      <Panel titulo="Del clic al consultorio" descripcion="Embudo completo, sin cortar en la reserva">
        <div className="grid gap-4">
          {pasos.map((p, i) => {
            const anterior = i === 0 ? null : pasos[i - 1].valor;
            const conversion = anterior && anterior > 0 ? p.valor / anterior : null;
            return (
              <div key={p.label} className="flex items-center gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: "var(--card)", color: cat[i % cat.length], boxShadow: "inset 0 0 0 1px rgba(33,58,88,0.1)" }}>
                  {p.icono}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-sm">{p.label}</p>
                  <ShareBar valor={p.valor / tope} color={cat[i === pasos.length - 1 ? 4 : i % cat.length]} />
                </div>
                <div className="w-28 shrink-0 text-right">
                  <p className="font-semibold tabular-nums">{numero.format(p.valor)}</p>
                  <p className="text-[11px]" style={{ color: "var(--ink-muted)" }}>
                    {conversion !== null ? `${porcentaje(conversion, 1)} del paso anterior` : "punto de partida"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel titulo="Aporte por canal" descripcion="Sesiones y conversiones registradas en Analytics">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ color: "var(--ink-muted)" }} className="text-xs">
                <th className="pb-2 font-medium">Canal</th>
                <th className="pb-2 text-right font-medium">Sesiones</th>
                <th className="pb-2 text-right font-medium">Conversiones</th>
                <th className="pb-2 text-right font-medium">Tasa</th>
                <th className="pb-2 font-medium">Peso</th>
              </tr>
            </thead>
            <tbody>
              {analytics.canales.map((c, i) => {
                const maximo = Math.max(1, ...analytics.canales.map((x) => x.sesiones));
                return (
                  <tr key={c.nombre} className="border-t border-slate-900/5 dark:border-white/10">
                    <td className="py-2 font-medium">{c.nombre}</td>
                    <td className="py-2 text-right tabular-nums">{numero.format(c.sesiones)}</td>
                    <td className="py-2 text-right tabular-nums">{numero.format(c.conversiones)}</td>
                    <td className="py-2 text-right tabular-nums" style={{ color: "var(--ink-muted)" }}>{porcentaje(c.conversiones / Math.max(1, c.sesiones), 2)}</td>
                    <td className="w-32 py-2">
                      <ShareBar valor={c.sesiones / maximo} color={cat[i % cat.length]} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function SinSesion() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <ShieldCheck className="h-8 w-8 text-accent-500" />
      <p className="anim-in text-lg font-semibold">Inicia sesión como administrador para ver este panel</p>
      <Link
        href="/login"
        className="anim-in anim-d1 rounded-full bg-gradient-to-r from-brand-600 to-accent-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md"
      >
        Entrar a la demo
      </Link>
    </main>
  );
}
