// Modo demo: activo cuando no hay proyecto Supabase configurado.
// Permite navegar la plataforma desplegada sin credenciales reales.
export const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL;

const hoy = new Date();
const enHoras = (h: number, m = 0) => {
  const d = new Date(hoy);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const enDias = (dias: number, h: number) => {
  const d = new Date(hoy.getTime() + dias * 86_400_000);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
};

export const DEMO_CITAS = [
  {
    id: "demo-1",
    inicio: enHoras(9, 0),
    fin: enHoras(9, 30),
    modalidad: "presencial" as const,
    estado: "confirmada" as const,
    precio: 850,
    enlace_videollamada: null,
    paciente: { nombre: "Mariana", apellidos: "Gutiérrez", avatar_url: null },
  },
  {
    id: "demo-2",
    inicio: enHoras(10, 30),
    fin: enHoras(11, 0),
    modalidad: "telemedicina" as const,
    estado: "confirmada" as const,
    precio: 650,
    enlace_videollamada: "https://meet.google.com/demo-link",
    paciente: { nombre: "Carlos", apellidos: "Reyna", avatar_url: null },
  },
  {
    id: "demo-3",
    inicio: enHoras(12, 0),
    fin: enHoras(12, 30),
    modalidad: "presencial" as const,
    estado: "confirmada" as const,
    precio: 850,
    enlace_videollamada: null,
    paciente: { nombre: "Lucía", apellidos: "Mendoza", avatar_url: null },
  },
  {
    id: "demo-4",
    inicio: enDias(1, 9),
    fin: enDias(1, 10),
    modalidad: "telemedicina" as const,
    estado: "confirmada" as const,
    precio: 650,
    enlace_videollamada: "https://meet.google.com/demo-link",
    paciente: { nombre: "Jorge", apellidos: "Palacios", avatar_url: null },
  },
  {
    id: "demo-5",
    inicio: enDias(2, 11),
    fin: enDias(2, 12),
    modalidad: "presencial" as const,
    estado: "confirmada" as const,
    precio: 850,
    enlace_videollamada: null,
    paciente: { nombre: "Ana", apellidos: "Sosa", avatar_url: null },
  },
];

export const DEMO_MEDICOS = [
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

export const DEMO_ADMIN_STATS = {
  ingresosMes: 148_650,
  citasMes: 212,
  tasaAsistencia: 0.91,
  pacientesActivos: 486,
  recompensasCanjeadas: 34,
  medicos: [
    { nombre: "Dra. Valeria Ortiz", especialidad: "Ginecología", citas: 74, ingresos: 62_900, activo: true },
    { nombre: "Dr. Andrés Lira", especialidad: "Pediatría", citas: 68, ingresos: 47_600, activo: true },
    { nombre: "Dra. Sofía Cantú", especialidad: "Medicina Interna", citas: 43, ingresos: 38_150, activo: true },
    { nombre: "Dr. Raúl Peña", especialidad: "Dermatología", citas: 0, ingresos: 0, activo: false },
  ],
};
