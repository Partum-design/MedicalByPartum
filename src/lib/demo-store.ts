"use client";

import { useCallback, useEffect, useState } from "react";

// ============================================================================
// Almacén local de la demo: los datos viven en localStorage del navegador,
// por lo que agendar, cancelar o marcar citas funciona de verdad y persiste
// entre recargas. En producción este módulo se sustituye por Supabase.
// ============================================================================

export type RolDemo = "paciente" | "medico" | "admin";

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
};

export const CUENTAS_DEMO: Record<RolDemo, SesionDemo> = {
  paciente: { rol: "paciente", id: "pac-1", nombre: "Mariana Gutiérrez", subtitulo: "Paciente" },
  medico: { rol: "medico", id: "med-1", nombre: "Dra. Valeria Ortiz", subtitulo: "Ginecología y Obstetricia" },
  admin: { rol: "admin", id: "adm-1", nombre: "Bruno Salas", subtitulo: "Administrador · Clínica Partum" },
};

export const MEDICOS_DEMO = [
  {
    id: "med-1",
    nombre: "Dra. Valeria Ortiz",
    especialidad: "Ginecología y Obstetricia",
    precio_consulta: 850,
    duracion_cita_min: 30,
    acepta_telemedicina: true,
    biografia: "15 años de experiencia. Certificada por el Consejo Mexicano de Ginecología.",
  },
  {
    id: "med-2",
    nombre: "Dr. Andrés Lira",
    especialidad: "Pediatría",
    precio_consulta: 700,
    duracion_cita_min: 30,
    acepta_telemedicina: true,
    biografia: "Especialista en desarrollo infantil y lactancia.",
  },
  {
    id: "med-3",
    nombre: "Dra. Sofía Cantú",
    especialidad: "Medicina Interna",
    precio_consulta: 900,
    duracion_cita_min: 45,
    acepta_telemedicina: false,
    biografia: "Enfoque en pacientes con padecimientos crónicos.",
  },
];

const KEY_CITAS = "mbp-demo-citas-v1";
const KEY_SESION = "mbp-demo-sesion-v1";

function iso(diasDesdeHoy: number, hora: number, min = 0) {
  const d = new Date();
  d.setDate(d.getDate() + diasDesdeHoy);
  d.setHours(hora, min, 0, 0);
  return d.toISOString();
}

function seedCitas(): CitaDemo[] {
  return [
    // Historial de Mariana con la Dra. Ortiz (3 asistidas → lealtad 3/5)
    { id: "c-h1", paciente_id: "pac-1", paciente_nombre: "Mariana Gutiérrez", medico_id: "med-1", medico_nombre: "Dra. Valeria Ortiz", especialidad: "Ginecología y Obstetricia", inicio: iso(-45, 10), fin: iso(-45, 10, 30), modalidad: "presencial", estado: "asistida", precio: 850, enlace_videollamada: null },
    { id: "c-h2", paciente_id: "pac-1", paciente_nombre: "Mariana Gutiérrez", medico_id: "med-1", medico_nombre: "Dra. Valeria Ortiz", especialidad: "Ginecología y Obstetricia", inicio: iso(-30, 11), fin: iso(-30, 11, 30), modalidad: "telemedicina", estado: "asistida", precio: 850, enlace_videollamada: "https://meet.google.com/demo" },
    { id: "c-h3", paciente_id: "pac-1", paciente_nombre: "Mariana Gutiérrez", medico_id: "med-1", medico_nombre: "Dra. Valeria Ortiz", especialidad: "Ginecología y Obstetricia", inicio: iso(-14, 9), fin: iso(-14, 9, 30), modalidad: "presencial", estado: "asistida", precio: 850, enlace_videollamada: null },
    // Hoy, agenda de la Dra. Ortiz
    { id: "c-t1", paciente_id: "pac-2", paciente_nombre: "Carlos Reyna", medico_id: "med-1", medico_nombre: "Dra. Valeria Ortiz", especialidad: "Ginecología y Obstetricia", inicio: iso(0, 9), fin: iso(0, 9, 30), modalidad: "presencial", estado: "confirmada", precio: 850, enlace_videollamada: null },
    { id: "c-t2", paciente_id: "pac-1", paciente_nombre: "Mariana Gutiérrez", medico_id: "med-1", medico_nombre: "Dra. Valeria Ortiz", especialidad: "Ginecología y Obstetricia", inicio: iso(0, 10, 30), fin: iso(0, 11), modalidad: "telemedicina", estado: "confirmada", precio: 850, enlace_videollamada: "https://meet.google.com/demo" },
    { id: "c-t3", paciente_id: "pac-3", paciente_nombre: "Lucía Mendoza", medico_id: "med-1", medico_nombre: "Dra. Valeria Ortiz", especialidad: "Ginecología y Obstetricia", inicio: iso(0, 12), fin: iso(0, 12, 30), modalidad: "presencial", estado: "confirmada", precio: 850, enlace_videollamada: null },
    // Próximos días
    { id: "c-f1", paciente_id: "pac-4", paciente_nombre: "Jorge Palacios", medico_id: "med-1", medico_nombre: "Dra. Valeria Ortiz", especialidad: "Ginecología y Obstetricia", inicio: iso(1, 9), fin: iso(1, 9, 30), modalidad: "telemedicina", estado: "confirmada", precio: 850, enlace_videollamada: "https://meet.google.com/demo" },
    { id: "c-f2", paciente_id: "pac-5", paciente_nombre: "Ana Sosa", medico_id: "med-2", medico_nombre: "Dr. Andrés Lira", especialidad: "Pediatría", inicio: iso(1, 11), fin: iso(1, 11, 30), modalidad: "presencial", estado: "confirmada", precio: 700, enlace_videollamada: null },
    { id: "c-f3", paciente_id: "pac-6", paciente_nombre: "Elena Michel", medico_id: "med-3", medico_nombre: "Dra. Sofía Cantú", especialidad: "Medicina Interna", inicio: iso(2, 10), fin: iso(2, 10, 45), modalidad: "presencial", estado: "confirmada", precio: 900, enlace_videollamada: null },
  ];
}

function leerCitas(): CitaDemo[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(KEY_CITAS);
  if (raw) {
    try {
      return JSON.parse(raw) as CitaDemo[];
    } catch {
      /* re-seed */
    }
  }
  const seed = seedCitas();
  window.localStorage.setItem(KEY_CITAS, JSON.stringify(seed));
  return seed;
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

// Hook principal: estado reactivo + mutadores persistentes.
export function useDemoStore() {
  const [listo, setListo] = useState(false);
  const [citas, setCitas] = useState<CitaDemo[]>([]);
  const [sesion, setSesion] = useState<SesionDemo | null>(null);

  useEffect(() => {
    setCitas(leerCitas());
    setSesion(leerSesion());
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
    }) => {
      const medico = MEDICOS_DEMO.find((m) => m.id === datos.medico_id);
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
      };
      guardar([...leerCitas(), nueva]);
      return nueva;
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

  const reiniciarDemo = useCallback(() => {
    window.localStorage.removeItem(KEY_CITAS);
    setCitas(leerCitas());
  }, []);

  return { listo, citas, sesion, login, logout, crearCita, marcarAsistida, cancelarCita, reiniciarDemo };
}

// Lealtad: 1 punto por cita asistida; cada 5 puntos se gana una recompensa.
export function calcularLealtad(citas: CitaDemo[], pacienteId: string) {
  const puntos = citas.filter(
    (c) => c.paciente_id === pacienteId && c.estado === "asistida"
  ).length;
  return {
    puntos,
    progreso: puntos % 5,
    recompensasGanadas: Math.floor(puntos / 5),
    faltan: 5 - (puntos % 5),
  };
}
