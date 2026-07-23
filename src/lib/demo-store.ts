"use client";

import { useCallback, useEffect, useState } from "react";

// ============================================================================
// Almacén local de la demo: los datos viven en localStorage del navegador,
// por lo que agendar, cancelar, cobrar o dar de alta un barbero funciona de
// verdad y persiste entre recargas. En producción este módulo se sustituye
// por Supabase.
// ============================================================================

export type RolDemo = "cliente" | "barbero" | "admin";

export type MetodoPago = "tarjeta" | "efectivo";
export type EstadoPago = "pagado" | "pendiente";

export type SesionDemo = {
  rol: RolDemo;
  id: string;
  nombre: string;
  subtitulo: string;
};

export type CitaDemo = {
  id: string;
  cliente_id: string;
  cliente_nombre: string;
  barbero_id: string;
  barbero_nombre: string;
  especialidad: string;
  inicio: string; // ISO
  fin: string;
  modalidad: "presencial" | "domicilio";
  estado: "confirmada" | "asistida" | "cancelada";
  precio: number;
  direccion_domicilio: string | null;
  metodo_pago: MetodoPago;
  estado_pago: EstadoPago;
};

export type BarberoDemo = {
  id: string;
  nombre: string;
  especialidad: string;
  precio_servicio: number;
  duracion_cita_min: number;
  acepta_domicilio: boolean;
  biografia: string;
  activo: boolean;
};

export type DiaSemana = "lun" | "mar" | "mie" | "jue" | "vie" | "sab" | "dom";

export const DIAS_SEMANA: { id: DiaSemana; label: string }[] = [
  { id: "lun", label: "Lunes" },
  { id: "mar", label: "Martes" },
  { id: "mie", label: "Miércoles" },
  { id: "jue", label: "Jueves" },
  { id: "vie", label: "Viernes" },
  { id: "sab", label: "Sábado" },
  { id: "dom", label: "Domingo" },
];

export type BloqueHorario = { activo: boolean; inicio: string; fin: string };
export type HorarioSemanal = Record<DiaSemana, BloqueHorario>;

export type FichaDemo = {
  id: string;
  cliente_id: string;
  cliente_nombre: string;
  barbero_id: string;
  servicio: string;
  notas: string;
  creado_en: string; // ISO
};

export type RecompensasConfig = {
  citas_requeridas: number;
  valor_descuento: number;
};

export type BarberiaConfig = {
  nombre: string;
  direccion: string;
  telefono: string;
};

export const CUENTAS_DEMO: Record<RolDemo, SesionDemo> = {
  cliente: { rol: "cliente", id: "cli-1", nombre: "Mariana Gutiérrez", subtitulo: "Cliente" },
  barbero: { rol: "barbero", id: "bar-1", nombre: "Iván Rosales", subtitulo: "Fades y diseño de barba" },
  admin: { rol: "admin", id: "adm-1", nombre: "Bruno Salas", subtitulo: "Administrador · Barbería Partum" },
};

// Semilla inicial de barberos. Tras la primera carga viven en localStorage,
// así que dar de alta o desactivar un barbero desde el panel persiste de verdad.
export const BARBEROS_DEMO: BarberoDemo[] = [
  {
    id: "bar-1",
    nombre: "Iván Rosales",
    especialidad: "Fades y diseño de barba",
    precio_servicio: 250,
    duracion_cita_min: 30,
    acepta_domicilio: true,
    biografia: "12 años de experiencia. Especialista en fades y degradados de precisión.",
    activo: true,
  },
  {
    id: "bar-2",
    nombre: "Andrés Lira",
    especialidad: "Cortes infantiles",
    precio_servicio: 200,
    duracion_cita_min: 30,
    acepta_domicilio: true,
    biografia: "Especialista en cortes para niños y primeras visitas.",
    activo: true,
  },
  {
    id: "bar-3",
    nombre: "Sofía Cantú",
    especialidad: "Afeitado clásico y barbería tradicional",
    precio_servicio: 300,
    duracion_cita_min: 45,
    acepta_domicilio: false,
    biografia: "Enfoque en rituales de afeitado con navaja y toalla caliente.",
    activo: true,
  },
];

const KEY_CITAS = "bbp-demo-citas-v1";
const KEY_SESION = "bbp-demo-sesion-v1";
const KEY_BARBEROS = "bbp-demo-barberos-v1";
const KEY_HORARIOS = "bbp-demo-horarios-v1";
const KEY_FICHAS = "bbp-demo-fichas-v1";
const KEY_RECOMPENSAS = "bbp-demo-recompensas-v1";
const KEY_BARBERIA = "bbp-demo-barberia-v1";
const KEY_CANJES = "bbp-demo-canjes-v1";

function iso(diasDesdeHoy: number, hora: number, min = 0) {
  const d = new Date();
  d.setDate(d.getDate() + diasDesdeHoy);
  d.setHours(hora, min, 0, 0);
  return d.toISOString();
}

function seedCitas(): CitaDemo[] {
  return [
    // Historial de Mariana con Iván (3 asistidas → lealtad 3/5)
    { id: "c-h1", cliente_id: "cli-1", cliente_nombre: "Mariana Gutiérrez", barbero_id: "bar-1", barbero_nombre: "Iván Rosales", especialidad: "Fades y diseño de barba", inicio: iso(-45, 10), fin: iso(-45, 10, 30), modalidad: "presencial", estado: "asistida", precio: 250, direccion_domicilio: null, metodo_pago: "tarjeta", estado_pago: "pagado" },
    { id: "c-h2", cliente_id: "cli-1", cliente_nombre: "Mariana Gutiérrez", barbero_id: "bar-1", barbero_nombre: "Iván Rosales", especialidad: "Fades y diseño de barba", inicio: iso(-30, 11), fin: iso(-30, 11, 30), modalidad: "domicilio", estado: "asistida", precio: 400, direccion_domicilio: "Av. Insurgentes Sur 1421, CDMX", metodo_pago: "tarjeta", estado_pago: "pagado" },
    { id: "c-h3", cliente_id: "cli-1", cliente_nombre: "Mariana Gutiérrez", barbero_id: "bar-1", barbero_nombre: "Iván Rosales", especialidad: "Fades y diseño de barba", inicio: iso(-14, 9), fin: iso(-14, 9, 30), modalidad: "presencial", estado: "asistida", precio: 250, direccion_domicilio: null, metodo_pago: "efectivo", estado_pago: "pagado" },
    // Hoy, agenda de Iván
    { id: "c-t1", cliente_id: "cli-2", cliente_nombre: "Carlos Reyna", barbero_id: "bar-1", barbero_nombre: "Iván Rosales", especialidad: "Fades y diseño de barba", inicio: iso(0, 9), fin: iso(0, 9, 30), modalidad: "presencial", estado: "confirmada", precio: 250, direccion_domicilio: null, metodo_pago: "tarjeta", estado_pago: "pagado" },
    { id: "c-t2", cliente_id: "cli-1", cliente_nombre: "Mariana Gutiérrez", barbero_id: "bar-1", barbero_nombre: "Iván Rosales", especialidad: "Fades y diseño de barba", inicio: iso(0, 10, 30), fin: iso(0, 11), modalidad: "domicilio", estado: "confirmada", precio: 400, direccion_domicilio: "Av. Insurgentes Sur 1421, CDMX", metodo_pago: "tarjeta", estado_pago: "pagado" },
    { id: "c-t3", cliente_id: "cli-3", cliente_nombre: "Lucía Mendoza", barbero_id: "bar-1", barbero_nombre: "Iván Rosales", especialidad: "Fades y diseño de barba", inicio: iso(0, 12), fin: iso(0, 12, 30), modalidad: "presencial", estado: "confirmada", precio: 250, direccion_domicilio: null, metodo_pago: "efectivo", estado_pago: "pendiente" },
    // Próximos días
    { id: "c-f1", cliente_id: "cli-4", cliente_nombre: "Jorge Palacios", barbero_id: "bar-1", barbero_nombre: "Iván Rosales", especialidad: "Fades y diseño de barba", inicio: iso(1, 9), fin: iso(1, 9, 30), modalidad: "domicilio", estado: "confirmada", precio: 400, direccion_domicilio: "Calle Amsterdam 88, CDMX", metodo_pago: "tarjeta", estado_pago: "pagado" },
    { id: "c-f2", cliente_id: "cli-5", cliente_nombre: "Ana Sosa", barbero_id: "bar-2", barbero_nombre: "Andrés Lira", especialidad: "Cortes infantiles", inicio: iso(1, 11), fin: iso(1, 11, 30), modalidad: "presencial", estado: "confirmada", precio: 200, direccion_domicilio: null, metodo_pago: "efectivo", estado_pago: "pendiente" },
    { id: "c-f3", cliente_id: "cli-6", cliente_nombre: "Elena Michel", barbero_id: "bar-3", barbero_nombre: "Sofía Cantú", especialidad: "Afeitado clásico y barbería tradicional", inicio: iso(2, 10), fin: iso(2, 10, 45), modalidad: "presencial", estado: "confirmada", precio: 300, direccion_domicilio: null, metodo_pago: "tarjeta", estado_pago: "pagado" },
  ];
}

function seedFichas(): FichaDemo[] {
  return [
    {
      id: "ficha-1",
      cliente_id: "cli-1",
      cliente_nombre: "Mariana Gutiérrez",
      barbero_id: "bar-1",
      servicio: "Corte + diseño de barba",
      notas: "Tijera en los costados, máquina #2 en la nuca. Barba con línea recta, sin navaja en el cuello.",
      creado_en: iso(-30, 11, 30),
    },
    {
      id: "ficha-2",
      cliente_id: "cli-1",
      cliente_nombre: "Mariana Gutiérrez",
      barbero_id: "bar-1",
      servicio: "Retoque de fade",
      notas: "Fade bajo. Piel sensible: usar loción after-shave sin alcohol.",
      creado_en: iso(-14, 9, 30),
    },
  ];
}

function horarioPorDefecto(): HorarioSemanal {
  const finde: DiaSemana[] = ["sab", "dom"];
  return DIAS_SEMANA.reduce((acc, d) => {
    acc[d.id] = { activo: !finde.includes(d.id), inicio: "09:00", fin: "14:00" };
    return acc;
  }, {} as HorarioSemanal);
}

function leerJSON<T>(key: string, fallback: () => T): T {
  if (typeof window === "undefined") return fallback();
  const raw = window.localStorage.getItem(key);
  if (raw) {
    try {
      return JSON.parse(raw) as T;
    } catch {
      /* re-seed */
    }
  }
  const seed = fallback();
  window.localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

function leerCitas(): CitaDemo[] {
  return leerJSON(KEY_CITAS, seedCitas);
}

function leerSesion(): SesionDemo | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY_SESION);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SesionDemo;
  } catch {
    return null;
  }
}

function leerBarberos(): BarberoDemo[] {
  return leerJSON(KEY_BARBEROS, () => BARBEROS_DEMO);
}

function guardarBarberosLocal(lista: BarberoDemo[]) {
  window.localStorage.setItem(KEY_BARBEROS, JSON.stringify(lista));
}

function leerHorarios(): Record<string, HorarioSemanal> {
  return leerJSON(KEY_HORARIOS, () => ({}) as Record<string, HorarioSemanal>);
}

function guardarHorariosLocal(mapa: Record<string, HorarioSemanal>) {
  window.localStorage.setItem(KEY_HORARIOS, JSON.stringify(mapa));
}

function leerFichas(): FichaDemo[] {
  return leerJSON(KEY_FICHAS, seedFichas);
}

function guardarFichasLocal(lista: FichaDemo[]) {
  window.localStorage.setItem(KEY_FICHAS, JSON.stringify(lista));
}

function leerRecompensasConfig(): RecompensasConfig {
  return leerJSON(KEY_RECOMPENSAS, () => ({ citas_requeridas: 5, valor_descuento: 20 }));
}

function guardarRecompensasConfigLocal(cfg: RecompensasConfig) {
  window.localStorage.setItem(KEY_RECOMPENSAS, JSON.stringify(cfg));
}

function leerBarberiaConfig(): BarberiaConfig {
  return leerJSON(KEY_BARBERIA, () => ({
    nombre: "Barbería Partum",
    direccion: "Av. Reforma 123, Col. Juárez, CDMX",
    telefono: "+52 55 1234 5678",
  }));
}

function guardarBarberiaConfigLocal(cfg: BarberiaConfig) {
  window.localStorage.setItem(KEY_BARBERIA, JSON.stringify(cfg));
}

function leerCanjes(): Record<string, number> {
  return leerJSON(KEY_CANJES, () => ({}) as Record<string, number>);
}

function guardarCanjesLocal(mapa: Record<string, number>) {
  window.localStorage.setItem(KEY_CANJES, JSON.stringify(mapa));
}

// Hook principal: estado reactivo + mutadores persistentes.
export function useDemoStore() {
  const [listo, setListo] = useState(false);
  const [citas, setCitas] = useState<CitaDemo[]>([]);
  const [sesion, setSesion] = useState<SesionDemo | null>(null);
  const [barberos, setBarberos] = useState<BarberoDemo[]>([]);
  const [horarios, setHorarios] = useState<Record<string, HorarioSemanal>>({});
  const [fichas, setFichas] = useState<FichaDemo[]>([]);
  const [recompensasConfig, setRecompensasConfig] = useState<RecompensasConfig>({
    citas_requeridas: 5,
    valor_descuento: 20,
  });
  const [barberiaConfig, setBarberiaConfig] = useState<BarberiaConfig>({
    nombre: "Barbería Partum",
    direccion: "",
    telefono: "",
  });
  const [canjes, setCanjes] = useState<Record<string, number>>({});

  useEffect(() => {
    setCitas(leerCitas());
    setSesion(leerSesion());
    setBarberos(leerBarberos());
    setHorarios(leerHorarios());
    setFichas(leerFichas());
    setRecompensasConfig(leerRecompensasConfig());
    setBarberiaConfig(leerBarberiaConfig());
    setCanjes(leerCanjes());
    setListo(true);
  }, []);

  const guardar = useCallback((nuevas: CitaDemo[]) => {
    setCitas(nuevas);
    window.localStorage.setItem(KEY_CITAS, JSON.stringify(nuevas));
  }, []);

  const login = useCallback((rol: RolDemo) => {
    const s = CUENTAS_DEMO[rol];
    setSesion(s);
    window.localStorage.setItem(KEY_SESION, JSON.stringify(s));
    return s;
  }, []);

  const logout = useCallback(() => {
    setSesion(null);
    window.localStorage.removeItem(KEY_SESION);
  }, []);

  const crearCita = useCallback(
    (datos: {
      barbero_id: string;
      inicio: string;
      fin: string;
      modalidad: "presencial" | "domicilio";
      metodo_pago: MetodoPago;
    }) => {
      const barbero = leerBarberos().find((m) => m.id === datos.barbero_id);
      const cliente = leerSesion() ?? CUENTAS_DEMO.cliente;
      const nueva: CitaDemo = {
        id: `c-${crypto.randomUUID().slice(0, 8)}`,
        cliente_id: cliente.rol === "cliente" ? cliente.id : CUENTAS_DEMO.cliente.id,
        cliente_nombre:
          cliente.rol === "cliente" ? cliente.nombre : CUENTAS_DEMO.cliente.nombre,
        barbero_id: datos.barbero_id,
        barbero_nombre: barbero?.nombre ?? "Barbero",
        especialidad: barbero?.especialidad ?? "",
        inicio: datos.inicio,
        fin: datos.fin,
        modalidad: datos.modalidad,
        estado: "confirmada",
        precio: barbero?.precio_servicio ?? 0,
        direccion_domicilio:
          datos.modalidad === "domicilio" ? "Domicilio del cliente" : null,
        metodo_pago: datos.metodo_pago,
        estado_pago: datos.metodo_pago === "efectivo" ? "pendiente" : "pagado",
      };
      guardar([...leerCitas(), nueva]);
      return nueva;
    },
    [guardar]
  );

  // El barbero o recepción confirma que el cliente pagó en efectivo.
  const cobrarEfectivo = useCallback(
    (id: string) => {
      guardar(
        leerCitas().map((c) => (c.id === id ? { ...c, estado_pago: "pagado" as const } : c))
      );
    },
    [guardar]
  );

  const marcarAsistida = useCallback(
    (id: string) => {
      guardar(
        leerCitas().map((c) => (c.id === id ? { ...c, estado: "asistida" as const } : c))
      );
    },
    [guardar]
  );

  const cancelarCita = useCallback(
    (id: string) => {
      guardar(
        leerCitas().map((c) => (c.id === id ? { ...c, estado: "cancelada" as const } : c))
      );
    },
    [guardar]
  );

  const agregarBarbero = useCallback((datos: Omit<BarberoDemo, "id" | "activo">) => {
    const nuevo: BarberoDemo = {
      id: `bar-${crypto.randomUUID().slice(0, 8)}`,
      activo: true,
      ...datos,
    };
    const lista = [...leerBarberos(), nuevo];
    guardarBarberosLocal(lista);
    setBarberos(lista);
    return nuevo;
  }, []);

  const actualizarBarbero = useCallback((id: string, cambios: Partial<BarberoDemo>) => {
    const lista = leerBarberos().map((m) => (m.id === id ? { ...m, ...cambios } : m));
    guardarBarberosLocal(lista);
    setBarberos(lista);
  }, []);

  const toggleActivoBarbero = useCallback((id: string) => {
    const lista = leerBarberos().map((m) => (m.id === id ? { ...m, activo: !m.activo } : m));
    guardarBarberosLocal(lista);
    setBarberos(lista);
  }, []);

  const guardarHorarioDia = useCallback(
    (barberoId: string, dia: DiaSemana, cambios: Partial<BloqueHorario>) => {
      const mapa = leerHorarios();
      const actual = mapa[barberoId] ?? horarioPorDefecto();
      const nuevoMapa = {
        ...mapa,
        [barberoId]: { ...actual, [dia]: { ...actual[dia], ...cambios } },
      };
      guardarHorariosLocal(nuevoMapa);
      setHorarios(nuevoMapa);
    },
    []
  );

  const horarioDeBarbero = useCallback(
    (barberoId: string): HorarioSemanal => horarios[barberoId] ?? horarioPorDefecto(),
    [horarios]
  );

  const agregarFicha = useCallback(
    (datos: {
      cliente_id: string;
      cliente_nombre: string;
      barbero_id: string;
      servicio: string;
      notas: string;
    }) => {
      const nuevo: FichaDemo = {
        id: `ficha-${crypto.randomUUID().slice(0, 8)}`,
        creado_en: new Date().toISOString(),
        ...datos,
      };
      const lista = [nuevo, ...leerFichas()];
      guardarFichasLocal(lista);
      setFichas(lista);
      return nuevo;
    },
    []
  );

  const actualizarRecompensasConfig = useCallback((cambios: Partial<RecompensasConfig>) => {
    const nuevo = { ...leerRecompensasConfig(), ...cambios };
    guardarRecompensasConfigLocal(nuevo);
    setRecompensasConfig(nuevo);
  }, []);

  const actualizarBarberiaConfig = useCallback((cambios: Partial<BarberiaConfig>) => {
    const nuevo = { ...leerBarberiaConfig(), ...cambios };
    guardarBarberiaConfigLocal(nuevo);
    setBarberiaConfig(nuevo);
  }, []);

  // El cliente canjea una recompensa desbloqueada (tope: las que tenga ganadas).
  const canjearRecompensa = useCallback(
    (clienteId: string, ganadas: number) => {
      const mapa = leerCanjes();
      const actual = mapa[clienteId] ?? 0;
      if (actual >= ganadas) return;
      const nuevoMapa = { ...mapa, [clienteId]: actual + 1 };
      guardarCanjesLocal(nuevoMapa);
      setCanjes(nuevoMapa);
    },
    []
  );

  const reiniciarDemo = useCallback(() => {
    [
      KEY_CITAS,
      KEY_BARBEROS,
      KEY_HORARIOS,
      KEY_FICHAS,
      KEY_RECOMPENSAS,
      KEY_BARBERIA,
      KEY_CANJES,
    ].forEach((k) => window.localStorage.removeItem(k));
    setCitas(leerCitas());
    setBarberos(leerBarberos());
    setHorarios(leerHorarios());
    setFichas(leerFichas());
    setRecompensasConfig(leerRecompensasConfig());
    setBarberiaConfig(leerBarberiaConfig());
    setCanjes(leerCanjes());
  }, []);

  return {
    listo,
    citas,
    sesion,
    barberos,
    fichas,
    recompensasConfig,
    barberiaConfig,
    canjes,
    login,
    logout,
    crearCita,
    marcarAsistida,
    cancelarCita,
    cobrarEfectivo,
    agregarBarbero,
    actualizarBarbero,
    toggleActivoBarbero,
    guardarHorarioDia,
    horarioDeBarbero,
    agregarFicha,
    actualizarRecompensasConfig,
    actualizarBarberiaConfig,
    canjearRecompensa,
    reiniciarDemo,
  };
}

// Lealtad: 1 punto por cita asistida; cada N puntos (config de la barbería,
// 5 por defecto) se gana una recompensa.
export function calcularLealtad(citas: CitaDemo[], clienteId: string, citasRequeridas = 5) {
  const requerido = citasRequeridas > 0 ? citasRequeridas : 5;
  const puntos = citas.filter(
    (c) => c.cliente_id === clienteId && c.estado === "asistida"
  ).length;
  return {
    puntos,
    progreso: puntos % requerido,
    recompensasGanadas: Math.floor(puntos / requerido),
    faltan: requerido - (puntos % requerido),
    requerido,
  };
}
