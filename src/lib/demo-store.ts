"use client";

import { useCallback, useEffect, useState } from "react";

// ============================================================================
// Almacén local de la demo: los datos viven en localStorage del navegador,
// por lo que agendar, cancelar, cobrar o dar de alta un médico funciona de
// verdad y persiste entre recargas. En producción este módulo se sustituye
// por Supabase.
// ============================================================================

export type RolDemo = "paciente" | "medico" | "admin";

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
  paciente_id: string;
  paciente_nombre: string;
  medico_id: string;
  medico_nombre: string;
  especialidad: string;
  inicio: string; // ISO
  fin: string;
  modalidad: "presencial" | "telemedicina";
  estado: "confirmada" | "asistida" | "cancelada";
  precio: number;
  enlace_videollamada: string | null;
  metodo_pago: MetodoPago;
  estado_pago: EstadoPago;
};

export type MedicoDemo = {
  id: string;
  nombre: string;
  especialidad: string;
  precio_consulta: number;
  duracion_cita_min: number;
  acepta_telemedicina: boolean;
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

export type ExpedienteDemo = {
  id: string;
  paciente_id: string;
  paciente_nombre: string;
  medico_id: string;
  diagnostico: string;
  notas: string;
  creado_en: string; // ISO
};

export type RecompensasConfig = {
  citas_requeridas: number;
  valor_descuento: number;
};

export type ClinicaConfig = {
  nombre: string;
  direccion: string;
  telefono: string;
};

export const CUENTAS_DEMO: Record<RolDemo, SesionDemo> = {
  paciente: { rol: "paciente", id: "pac-1", nombre: "Mariana Gutiérrez", subtitulo: "Paciente" },
  medico: { rol: "medico", id: "med-1", nombre: "Dra. Valeria Ortiz", subtitulo: "Ginecología y Obstetricia" },
  admin: { rol: "admin", id: "adm-1", nombre: "Bruno Salas", subtitulo: "Administrador · Clínica Partum" },
};

// Semilla inicial de médicos. Tras la primera carga viven en localStorage,
// así que dar de alta o desactivar un médico desde el panel persiste de verdad.
export const MEDICOS_DEMO: MedicoDemo[] = [
  {
    id: "med-1",
    nombre: "Dra. Valeria Ortiz",
    especialidad: "Ginecología y Obstetricia",
    precio_consulta: 850,
    duracion_cita_min: 30,
    acepta_telemedicina: true,
    biografia: "15 años de experiencia. Certificada por el Consejo Mexicano de Ginecología.",
    activo: true,
  },
  {
    id: "med-2",
    nombre: "Dr. Andrés Lira",
    especialidad: "Pediatría",
    precio_consulta: 700,
    duracion_cita_min: 30,
    acepta_telemedicina: true,
    biografia: "Especialista en desarrollo infantil y lactancia.",
    activo: true,
  },
  {
    id: "med-3",
    nombre: "Dra. Sofía Cantú",
    especialidad: "Medicina Interna",
    precio_consulta: 900,
    duracion_cita_min: 45,
    acepta_telemedicina: false,
    biografia: "Enfoque en pacientes con padecimientos crónicos.",
    activo: true,
  },
];

const KEY_CITAS = "mbp-demo-citas-v1";
const KEY_SESION = "mbp-demo-sesion-v1";
const KEY_MEDICOS = "mbp-demo-medicos-v1";
const KEY_HORARIOS = "mbp-demo-horarios-v1";
const KEY_EXPEDIENTES = "mbp-demo-expedientes-v1";
const KEY_RECOMPENSAS = "mbp-demo-recompensas-v1";
const KEY_CLINICA = "mbp-demo-clinica-v1";

function iso(diasDesdeHoy: number, hora: number, min = 0) {
  const d = new Date();
  d.setDate(d.getDate() + diasDesdeHoy);
  d.setHours(hora, min, 0, 0);
  return d.toISOString();
}

function seedCitas(): CitaDemo[] {
  return [
    // Historial de Mariana con la Dra. Ortiz (3 asistidas → lealtad 3/5)
    { id: "c-h1", paciente_id: "pac-1", paciente_nombre: "Mariana Gutiérrez", medico_id: "med-1", medico_nombre: "Dra. Valeria Ortiz", especialidad: "Ginecología y Obstetricia", inicio: iso(-45, 10), fin: iso(-45, 10, 30), modalidad: "presencial", estado: "asistida", precio: 850, enlace_videollamada: null, metodo_pago: "tarjeta", estado_pago: "pagado" },
    { id: "c-h2", paciente_id: "pac-1", paciente_nombre: "Mariana Gutiérrez", medico_id: "med-1", medico_nombre: "Dra. Valeria Ortiz", especialidad: "Ginecología y Obstetricia", inicio: iso(-30, 11), fin: iso(-30, 11, 30), modalidad: "telemedicina", estado: "asistida", precio: 850, enlace_videollamada: "https://meet.google.com/demo", metodo_pago: "tarjeta", estado_pago: "pagado" },
    { id: "c-h3", paciente_id: "pac-1", paciente_nombre: "Mariana Gutiérrez", medico_id: "med-1", medico_nombre: "Dra. Valeria Ortiz", especialidad: "Ginecología y Obstetricia", inicio: iso(-14, 9), fin: iso(-14, 9, 30), modalidad: "presencial", estado: "asistida", precio: 850, enlace_videollamada: null, metodo_pago: "efectivo", estado_pago: "pagado" },
    // Hoy, agenda de la Dra. Ortiz
    { id: "c-t1", paciente_id: "pac-2", paciente_nombre: "Carlos Reyna", medico_id: "med-1", medico_nombre: "Dra. Valeria Ortiz", especialidad: "Ginecología y Obstetricia", inicio: iso(0, 9), fin: iso(0, 9, 30), modalidad: "presencial", estado: "confirmada", precio: 850, enlace_videollamada: null, metodo_pago: "tarjeta", estado_pago: "pagado" },
    { id: "c-t2", paciente_id: "pac-1", paciente_nombre: "Mariana Gutiérrez", medico_id: "med-1", medico_nombre: "Dra. Valeria Ortiz", especialidad: "Ginecología y Obstetricia", inicio: iso(0, 10, 30), fin: iso(0, 11), modalidad: "telemedicina", estado: "confirmada", precio: 850, enlace_videollamada: "https://meet.google.com/demo", metodo_pago: "tarjeta", estado_pago: "pagado" },
    { id: "c-t3", paciente_id: "pac-3", paciente_nombre: "Lucía Mendoza", medico_id: "med-1", medico_nombre: "Dra. Valeria Ortiz", especialidad: "Ginecología y Obstetricia", inicio: iso(0, 12), fin: iso(0, 12, 30), modalidad: "presencial", estado: "confirmada", precio: 850, enlace_videollamada: null, metodo_pago: "efectivo", estado_pago: "pendiente" },
    // Próximos días
    { id: "c-f1", paciente_id: "pac-4", paciente_nombre: "Jorge Palacios", medico_id: "med-1", medico_nombre: "Dra. Valeria Ortiz", especialidad: "Ginecología y Obstetricia", inicio: iso(1, 9), fin: iso(1, 9, 30), modalidad: "telemedicina", estado: "confirmada", precio: 850, enlace_videollamada: "https://meet.google.com/demo", metodo_pago: "tarjeta", estado_pago: "pagado" },
    { id: "c-f2", paciente_id: "pac-5", paciente_nombre: "Ana Sosa", medico_id: "med-2", medico_nombre: "Dr. Andrés Lira", especialidad: "Pediatría", inicio: iso(1, 11), fin: iso(1, 11, 30), modalidad: "presencial", estado: "confirmada", precio: 700, enlace_videollamada: null, metodo_pago: "efectivo", estado_pago: "pendiente" },
    { id: "c-f3", paciente_id: "pac-6", paciente_nombre: "Elena Michel", medico_id: "med-3", medico_nombre: "Dra. Sofía Cantú", especialidad: "Medicina Interna", inicio: iso(2, 10), fin: iso(2, 10, 45), modalidad: "presencial", estado: "confirmada", precio: 900, enlace_videollamada: null, metodo_pago: "tarjeta", estado_pago: "pagado" },
  ];
}

function seedExpedientes(): ExpedienteDemo[] {
  return [
    {
      id: "exp-1",
      paciente_id: "pac-1",
      paciente_nombre: "Mariana Gutiérrez",
      medico_id: "med-1",
      diagnostico: "Control prenatal — 2° trimestre sin complicaciones",
      notas: "Presión arterial normal. Se indica ácido fólico y control en 4 semanas.",
      creado_en: iso(-30, 11, 30),
    },
    {
      id: "exp-2",
      paciente_id: "pac-1",
      paciente_nombre: "Mariana Gutiérrez",
      medico_id: "med-1",
      diagnostico: "Revisión de rutina",
      notas: "Paciente asintomática. Se solicita panel de laboratorio de rutina.",
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

function leerMedicos(): MedicoDemo[] {
  return leerJSON(KEY_MEDICOS, () => MEDICOS_DEMO);
}

function guardarMedicosLocal(lista: MedicoDemo[]) {
  window.localStorage.setItem(KEY_MEDICOS, JSON.stringify(lista));
}

function leerHorarios(): Record<string, HorarioSemanal> {
  return leerJSON(KEY_HORARIOS, () => ({}) as Record<string, HorarioSemanal>);
}

function guardarHorariosLocal(mapa: Record<string, HorarioSemanal>) {
  window.localStorage.setItem(KEY_HORARIOS, JSON.stringify(mapa));
}

function leerExpedientes(): ExpedienteDemo[] {
  return leerJSON(KEY_EXPEDIENTES, seedExpedientes);
}

function guardarExpedientesLocal(lista: ExpedienteDemo[]) {
  window.localStorage.setItem(KEY_EXPEDIENTES, JSON.stringify(lista));
}

function leerRecompensasConfig(): RecompensasConfig {
  return leerJSON(KEY_RECOMPENSAS, () => ({ citas_requeridas: 5, valor_descuento: 20 }));
}

function guardarRecompensasConfigLocal(cfg: RecompensasConfig) {
  window.localStorage.setItem(KEY_RECOMPENSAS, JSON.stringify(cfg));
}

function leerClinicaConfig(): ClinicaConfig {
  return leerJSON(KEY_CLINICA, () => ({
    nombre: "Clínica Partum",
    direccion: "Av. Reforma 123, Col. Juárez, CDMX",
    telefono: "+52 55 1234 5678",
  }));
}

function guardarClinicaConfigLocal(cfg: ClinicaConfig) {
  window.localStorage.setItem(KEY_CLINICA, JSON.stringify(cfg));
}

// Hook principal: estado reactivo + mutadores persistentes.
export function useDemoStore() {
  const [listo, setListo] = useState(false);
  const [citas, setCitas] = useState<CitaDemo[]>([]);
  const [sesion, setSesion] = useState<SesionDemo | null>(null);
  const [medicos, setMedicos] = useState<MedicoDemo[]>([]);
  const [horarios, setHorarios] = useState<Record<string, HorarioSemanal>>({});
  const [expedientes, setExpedientes] = useState<ExpedienteDemo[]>([]);
  const [recompensasConfig, setRecompensasConfig] = useState<RecompensasConfig>({
    citas_requeridas: 5,
    valor_descuento: 20,
  });
  const [clinicaConfig, setClinicaConfig] = useState<ClinicaConfig>({
    nombre: "Clínica Partum",
    direccion: "",
    telefono: "",
  });

  useEffect(() => {
    setCitas(leerCitas());
    setSesion(leerSesion());
    setMedicos(leerMedicos());
    setHorarios(leerHorarios());
    setExpedientes(leerExpedientes());
    setRecompensasConfig(leerRecompensasConfig());
    setClinicaConfig(leerClinicaConfig());
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
      medico_id: string;
      inicio: string;
      fin: string;
      modalidad: "presencial" | "telemedicina";
      metodo_pago: MetodoPago;
    }) => {
      const medico = leerMedicos().find((m) => m.id === datos.medico_id);
      const paciente = leerSesion() ?? CUENTAS_DEMO.paciente;
      const nueva: CitaDemo = {
        id: `c-${crypto.randomUUID().slice(0, 8)}`,
        paciente_id: paciente.rol === "paciente" ? paciente.id : CUENTAS_DEMO.paciente.id,
        paciente_nombre:
          paciente.rol === "paciente" ? paciente.nombre : CUENTAS_DEMO.paciente.nombre,
        medico_id: datos.medico_id,
        medico_nombre: medico?.nombre ?? "Médico",
        especialidad: medico?.especialidad ?? "",
        inicio: datos.inicio,
        fin: datos.fin,
        modalidad: datos.modalidad,
        estado: "confirmada",
        precio: medico?.precio_consulta ?? 0,
        enlace_videollamada:
          datos.modalidad === "telemedicina" ? "https://meet.google.com/demo" : null,
        metodo_pago: datos.metodo_pago,
        estado_pago: datos.metodo_pago === "efectivo" ? "pendiente" : "pagado",
      };
      guardar([...leerCitas(), nueva]);
      return nueva;
    },
    [guardar]
  );

  // El médico o recepción confirma que el paciente pagó en efectivo.
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

  const agregarMedico = useCallback((datos: Omit<MedicoDemo, "id" | "activo">) => {
    const nuevo: MedicoDemo = {
      id: `med-${crypto.randomUUID().slice(0, 8)}`,
      activo: true,
      ...datos,
    };
    const lista = [...leerMedicos(), nuevo];
    guardarMedicosLocal(lista);
    setMedicos(lista);
    return nuevo;
  }, []);

  const actualizarMedico = useCallback((id: string, cambios: Partial<MedicoDemo>) => {
    const lista = leerMedicos().map((m) => (m.id === id ? { ...m, ...cambios } : m));
    guardarMedicosLocal(lista);
    setMedicos(lista);
  }, []);

  const toggleActivoMedico = useCallback((id: string) => {
    const lista = leerMedicos().map((m) => (m.id === id ? { ...m, activo: !m.activo } : m));
    guardarMedicosLocal(lista);
    setMedicos(lista);
  }, []);

  const guardarHorarioDia = useCallback(
    (medicoId: string, dia: DiaSemana, cambios: Partial<BloqueHorario>) => {
      const mapa = leerHorarios();
      const actual = mapa[medicoId] ?? horarioPorDefecto();
      const nuevoMapa = {
        ...mapa,
        [medicoId]: { ...actual, [dia]: { ...actual[dia], ...cambios } },
      };
      guardarHorariosLocal(nuevoMapa);
      setHorarios(nuevoMapa);
    },
    []
  );

  const horarioDeMedico = useCallback(
    (medicoId: string): HorarioSemanal => horarios[medicoId] ?? horarioPorDefecto(),
    [horarios]
  );

  const agregarExpediente = useCallback(
    (datos: {
      paciente_id: string;
      paciente_nombre: string;
      medico_id: string;
      diagnostico: string;
      notas: string;
    }) => {
      const nuevo: ExpedienteDemo = {
        id: `exp-${crypto.randomUUID().slice(0, 8)}`,
        creado_en: new Date().toISOString(),
        ...datos,
      };
      const lista = [nuevo, ...leerExpedientes()];
      guardarExpedientesLocal(lista);
      setExpedientes(lista);
      return nuevo;
    },
    []
  );

  const actualizarRecompensasConfig = useCallback((cambios: Partial<RecompensasConfig>) => {
    const nuevo = { ...leerRecompensasConfig(), ...cambios };
    guardarRecompensasConfigLocal(nuevo);
    setRecompensasConfig(nuevo);
  }, []);

  const actualizarClinicaConfig = useCallback((cambios: Partial<ClinicaConfig>) => {
    const nuevo = { ...leerClinicaConfig(), ...cambios };
    guardarClinicaConfigLocal(nuevo);
    setClinicaConfig(nuevo);
  }, []);

  const reiniciarDemo = useCallback(() => {
    [KEY_CITAS, KEY_MEDICOS, KEY_HORARIOS, KEY_EXPEDIENTES, KEY_RECOMPENSAS, KEY_CLINICA].forEach(
      (k) => window.localStorage.removeItem(k)
    );
    setCitas(leerCitas());
    setMedicos(leerMedicos());
    setHorarios(leerHorarios());
    setExpedientes(leerExpedientes());
    setRecompensasConfig(leerRecompensasConfig());
    setClinicaConfig(leerClinicaConfig());
  }, []);

  return {
    listo,
    citas,
    sesion,
    medicos,
    expedientes,
    recompensasConfig,
    clinicaConfig,
    login,
    logout,
    crearCita,
    marcarAsistida,
    cancelarCita,
    cobrarEfectivo,
    agregarMedico,
    actualizarMedico,
    toggleActivoMedico,
    guardarHorarioDia,
    horarioDeMedico,
    agregarExpediente,
    actualizarRecompensasConfig,
    actualizarClinicaConfig,
    reiniciarDemo,
  };
}

// Lealtad: 1 punto por cita asistida; cada N puntos (config de la clínica,
// 5 por defecto) se gana una recompensa.
export function calcularLealtad(citas: CitaDemo[], pacienteId: string, citasRequeridas = 5) {
  const requerido = citasRequeridas > 0 ? citasRequeridas : 5;
  const puntos = citas.filter(
    (c) => c.paciente_id === pacienteId && c.estado === "asistida"
  ).length;
  return {
    puntos,
    progreso: puntos % requerido,
    recompensasGanadas: Math.floor(puntos / requerido),
    faltan: requerido - (puntos % requerido),
    requerido,
  };
}
