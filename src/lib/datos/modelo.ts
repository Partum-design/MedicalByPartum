// ============================================================================
// Modelo de la clínica: tipos, valores por defecto y las operaciones que lo
// modifican. No depende del navegador ni del servidor, así que la misma
// función `aplicarOperacion` corre en los dos lados: en el navegador para que
// la pantalla responda al instante y en /api/datos, que es quien decide de
// verdad y guarda en Supabase.
// ============================================================================

import { horarioReservable, ZONA_HORARIA } from "@/lib/datos/disponibilidad";

export type Rol = "paciente" | "medico" | "admin";

/** Cómo se da la consulta: en el consultorio, por videollamada o en casa del paciente. */
export type Modalidad = "presencial" | "telemedicina" | "domicilio";

export const ETIQUETA_MODALIDAD: Record<Modalidad, string> = {
  presencial: "En consultorio",
  telemedicina: "Telemedicina",
  domicilio: "A domicilio",
};

export type MetodoPago = "tarjeta" | "efectivo";
export type EstadoPago = "pagado" | "pendiente";

export type Sesion = {
  rol: Rol;
  id: string;
  nombre: string;
  subtitulo: string;
  /** Administrador principal (dueño): el único que gestiona a otros administradores. */
  principal?: boolean;
};

export type Cita = {
  id: string;
  paciente_id: string;
  paciente_nombre: string;
  medico_id: string;
  medico_nombre: string;
  especialidad: string;
  inicio: string; // ISO
  fin: string;
  modalidad: Modalidad;
  estado: EstadoCita;
  precio: number;
  direccion_domicilio: string | null;
  metodo_pago: MetodoPago;
  estado_pago: EstadoPago;
  /** Momento en que se confirmó la llegada (escaneo del QR o botón) */
  llegada_en?: string | null;
  /** Nota interna del mostrador: motivo de reprogramación, etc. */
  notas?: string;
  /** Quién la registró: el propio paciente o el personal */
  creada_por?: "paciente" | "personal";
  /** Servicio contratado: de él salen el precio y la duración */
  servicio_id?: string | null;
  servicio_nombre?: string;
  /**
   * Comisión del médico (%) congelada al agendar, para que cambiar el
   * catálogo después no reescriba lo ya pagado. Sólo la ve el administrador.
   */
  comision_pct?: number;
  /** El paciente fue eliminado: la cita queda para caja y reportes, no en Pacientes */
  paciente_eliminado?: boolean;
  /** Motivo de consulta que escribe el paciente al reservar */
  motivo?: string;
  /** Sala de videollamada (sólo telemedicina) */
  enlace_video?: string | null;
  /** Evento espejo en el Google Calendar del médico, cuando está conectado */
  google_evento_id?: string | null;
};

export type EstadoCita = "confirmada" | "asistida" | "no_asistio" | "cancelada";

export const ETIQUETA_ESTADO_CITA: Record<EstadoCita, string> = {
  confirmada: "Agendada",
  asistida: "Asistió",
  no_asistio: "No asistió",
  cancelada: "Cancelada",
};

/** Cita que ocupa agenda y cuenta para ingresos: ni cancelada ni con falta. */
export const citaActiva = (c: Pick<Cita, "estado">) => c.estado === "confirmada" || c.estado === "asistida";

/** Contenido del QR de una cita: un enlace que el escáner o la cámara del teléfono abren. */
export function enlaceDeCita(id: string, origen = "") {
  return `${origen}/confirmar?cita=${encodeURIComponent(id)}`;
}

/** Saca el id de cita de lo que lea el escáner (enlace completo, ruta o el id solo). */
export function idDeCitaEnTexto(texto: string): string | null {
  const limpio = texto.trim();
  const m = limpio.match(/[?&]cita=([^&#\s]+)/);
  if (m) return decodeURIComponent(m[1]);
  if (/^c-[0-9a-f]{8}$/i.test(limpio) || /^cita-[\w-]{4,40}$/i.test(limpio)) return limpio;
  return null;
}

export type Medico = {
  /** Mismo id que su usuario de Supabase Auth */
  id: string;
  nombre: string;
  especialidad: string;
  /** Obsoleto: el precio ahora es del servicio. Se conserva para datos viejos. */
  precio_servicio?: number;
  /** Duración base de su agenda cuando la cita no lleva servicio */
  duracion_cita_min: number;
  acepta_domicilio: boolean;
  /** Da consulta por videollamada */
  telemedicina: boolean;
  /** Cédula profesional (se muestra en la portada y en recetas) */
  cedula: string;
  /** Color de su columna en la agenda */
  color: string;
  /** Años de experiencia, para su ficha pública */
  experiencia: number;
  /** Conexión simulada con su Google Calendar */
  google?: ConexionGoogle | null;
  biografia: string;
  activo: boolean;
  /** Lo que el administrador le permite hacer. Lo que falte toma el valor por defecto. */
  permisos?: Partial<PermisosMedico>;
  /**
   * Precio especial por servicio (id del servicio → MXN). Lo que no aparece
   * se cobra al precio de lista del catálogo. Sólo lo cambia el administrador.
   */
  precios?: Record<string, number>;
};

/** Lo que cobra este médico por el servicio: su precio especial o el de lista. */
export function precioDe(servicio: Pick<Servicio, "id" | "precio">, medico?: Pick<Medico, "precios"> | null) {
  const especial = medico?.precios?.[servicio.id];
  return typeof especial === "number" && Number.isFinite(especial) && especial >= 0 ? especial : servicio.precio;
}

/** Deja sólo precios válidos de servicios que existen y distintos del de lista. */
export function limpiarPrecios(precios: unknown, servicios: Pick<Servicio, "id" | "precio">[]): Record<string, number> {
  const limpio: Record<string, number> = {};
  if (!precios || typeof precios !== "object") return limpio;
  for (const sv of servicios) {
    const n = Number((precios as Record<string, unknown>)[sv.id]);
    if ((precios as Record<string, unknown>)[sv.id] === null || (precios as Record<string, unknown>)[sv.id] === "") continue;
    if (Number.isFinite(n) && n >= 0 && n <= 1_000_000 && Math.round(n) !== sv.precio) limpio[sv.id] = Math.round(n);
  }
  return limpio;
}

// --- Permisos del equipo ----------------------------------------------------

export type PermisosMedico = {
  /** Agendar citas en su propia agenda */
  crear_citas: boolean;
  /** Agendar citas en la agenda de otros médicos */
  agendar_otros: boolean;
  /** Ver con nombre las citas de todo el equipo (si no, sólo el hueco ocupado) */
  ver_agenda_completa: boolean;
  /** Confirmar llegadas (escáner o botón «Llegó») */
  confirmar_llegadas: boolean;
  /** Registrar cobros en efectivo o tarjeta */
  cobrar: boolean;
  /** Dar de alta pacientes nuevos */
  registrar_pacientes: boolean;
  /** Corregir los datos de los pacientes */
  editar_pacientes: boolean;
  /** Ver el nombre de los pacientes */
  ver_nombres_pacientes: boolean;
  /** Ver teléfono y correo de todos los pacientes (siempre ve los que él dio de alta) */
  ver_contacto_pacientes: boolean;
  /** Poner sellos de visitas sin cita */
  ajustar_sellos: boolean;
};

export const PERMISOS_POR_DEFECTO: PermisosMedico = {
  crear_citas: true,
  agendar_otros: false,
  ver_agenda_completa: false,
  confirmar_llegadas: true,
  cobrar: true,
  registrar_pacientes: true,
  editar_pacientes: false,
  ver_nombres_pacientes: true,
  ver_contacto_pacientes: false,
  ajustar_sellos: true,
};

export const ETIQUETAS_PERMISOS: { id: keyof PermisosMedico; label: string; ayuda: string; grupo: string }[] = [
  { id: "crear_citas", grupo: "Agenda", label: "Crear citas", ayuda: "Agenda pacientes en su propia agenda." },
  { id: "agendar_otros", grupo: "Agenda", label: "Agendar a otros médicos", ayuda: "Puede meter citas en la agenda de sus compañeros." },
  { id: "ver_agenda_completa", grupo: "Agenda", label: "Ver la agenda de todo el equipo", ayuda: "Ve quién viene con cada médico. Si no, sólo ve los horarios ocupados." },
  { id: "confirmar_llegadas", grupo: "Recepción", label: "Confirmar llegadas", ayuda: "Escanea el QR o marca «Llegó» en sus citas." },
  { id: "cobrar", grupo: "Recepción", label: "Registrar cobros", ayuda: "Marca sus citas como pagadas en efectivo o tarjeta." },
  { id: "ajustar_sellos", grupo: "Recepción", label: "Poner sellos de lealtad", ayuda: "Suma visitas sin cita a la tarjeta del paciente." },
  { id: "registrar_pacientes", grupo: "Pacientes", label: "Dar de alta pacientes", ayuda: "Registra pacientes nuevos desde su panel." },
  { id: "editar_pacientes", grupo: "Pacientes", label: "Editar datos de pacientes", ayuda: "Corrige nombre y contacto de los pacientes." },
  { id: "ver_nombres_pacientes", grupo: "Privacidad", label: "Ver el nombre de los pacientes", ayuda: "Si lo apagas, sólo verá sus iniciales." },
  { id: "ver_contacto_pacientes", grupo: "Privacidad", label: "Ver teléfono y correo de todos", ayuda: "Si está apagado, sólo ve el número de los pacientes que dio de alta." },
];

export function permisosDe(medico: Pick<Medico, "permisos"> | null | undefined): PermisosMedico {
  return { ...PERMISOS_POR_DEFECTO, ...(medico?.permisos ?? {}) };
}

/** ¿La sesión puede hacer esto? El administrador puede todo; el paciente nada de esto. */
export function puede(estado: Pick<Estado, "medicos">, s: Sesion | null | undefined, permiso: keyof PermisosMedico) {
  if (!s) return false;
  if (s.rol === "admin") return true;
  if (s.rol !== "medico") return false;
  return permisosDe(estado.medicos.find((b) => b.id === s.id))[permiso];
}

/** ¿Esta sesión ve el teléfono y correo de este paciente? */
export function veContactoDe(estado: Pick<Estado, "medicos">, s: Sesion | null | undefined, paciente: Pick<Paciente, "id" | "registrado_por">) {
  if (!s) return false;
  if (s.rol === "admin") return true;
  if (s.rol === "paciente") return paciente.id === s.id;
  return paciente.registrado_por === s.id || puede(estado, s, "ver_contacto_pacientes");
}

/** "Juan Pérez" → "J. P." */
export function iniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return partes.length ? partes.map((p) => `${p.charAt(0).toUpperCase()}.`).join(" ") : "Paciente";
}

/** Últimos 10 dígitos: así "+52 55 1234 5678" y "5512345678" son el mismo número. */
export function normalizarTelefono(valor: string) {
  const d = String(valor ?? "").replace(/\D/g, "");
  return d.length > 10 ? d.slice(-10) : d;
}

/**
 * ¿Parece un celular mexicano real? 10 dígitos, sin empezar en 0 ni 1 (las
 * claves de área van de 2 a 9) y sin patrones de relleno como 5555555555 o
 * 1234567890, que es lo primero que escribe un bot o alguien que prueba.
 */
export function celularValido(valor: string) {
  const d = normalizarTelefono(valor);
  if (!/^[2-9]\d{9}$/.test(d)) return false;
  if (/^(\d)\1{9}$/.test(d)) return false;
  // Sus 8 últimos dígitos todos iguales (55 0000 0000) o en escalera.
  if (/^(\d)\1{7}$/.test(d.slice(2))) return false;
  const escalera = "01234567890123456789";
  const bajada = "98765432109876543210";
  if (escalera.includes(d.slice(2)) || bajada.includes(d.slice(2))) return false;
  return true;
}

/** Vínculo del médico con su Google Calendar (OAuth simulado en esta demo). */
export type ConexionGoogle = {
  email: string;
  calendario: string;
  conectado_en: string;
  ultimo_sync: string | null;
  /** Crear y actualizar eventos solos al agendar, mover o cancelar */
  auto: boolean;
};

/** Evento del calendario de Google: los de la clínica y los personales del médico. */
export type EventoGoogle = {
  id: string;
  medico_id: string;
  titulo: string;
  inicio: string;
  fin: string;
  origen: "medical-os" | "personal";
  cita_id?: string | null;
  /** Bloquea la agenda: no se ofrecen horas encimadas */
  ocupado: boolean;
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

/** Signos vitales de la consulta. Todo opcional: se captura lo que se midió. */
export type SignosVitales = {
  peso_kg?: number | null;
  talla_cm?: number | null;
  temperatura_c?: number | null;
  presion?: string;
  frecuencia_cardiaca?: number | null;
  saturacion?: number | null;
  perimetro_cefalico_cm?: number | null;
};

/** Nota clínica del expediente (formato SOAP simplificado). */
export type Ficha = {
  id: string;
  paciente_id: string;
  paciente_nombre: string;
  medico_id: string;
  medico_nombre?: string;
  cita_id?: string | null;
  servicio: string;
  motivo?: string;
  exploracion?: string;
  diagnostico?: string;
  tratamiento?: string;
  receta?: string;
  signos?: SignosVitales;
  notas: string;
  creado_en: string; // ISO
};

/** Dosis aplicada en la cartilla de vacunación del paciente. */
export type VacunaAplicada = {
  id: string;
  paciente_id: string;
  vacuna: string;
  dosis: string;
  fecha: string; // ISO
  lote: string;
  aplicada_por: string;
};

/** Esquema básico de vacunación (referencia simplificada para la demo). */
export const ESQUEMA_VACUNACION: { vacuna: string; dosis: string; edad: string; meses: number }[] = [
  { vacuna: "BCG", dosis: "Única", edad: "Al nacer", meses: 0 },
  { vacuna: "Hepatitis B", dosis: "1ª", edad: "Al nacer", meses: 0 },
  { vacuna: "Hexavalente", dosis: "1ª", edad: "2 meses", meses: 2 },
  { vacuna: "Rotavirus", dosis: "1ª", edad: "2 meses", meses: 2 },
  { vacuna: "Neumocócica conjugada", dosis: "1ª", edad: "2 meses", meses: 2 },
  { vacuna: "Hexavalente", dosis: "2ª", edad: "4 meses", meses: 4 },
  { vacuna: "Rotavirus", dosis: "2ª", edad: "4 meses", meses: 4 },
  { vacuna: "Neumocócica conjugada", dosis: "2ª", edad: "4 meses", meses: 4 },
  { vacuna: "Hexavalente", dosis: "3ª", edad: "6 meses", meses: 6 },
  { vacuna: "Influenza", dosis: "1ª", edad: "6 meses", meses: 6 },
  { vacuna: "SRP (triple viral)", dosis: "1ª", edad: "12 meses", meses: 12 },
  { vacuna: "Neumocócica conjugada", dosis: "Refuerzo", edad: "12 meses", meses: 12 },
  { vacuna: "Hepatitis A", dosis: "Única", edad: "12 meses", meses: 12 },
  { vacuna: "Varicela", dosis: "1ª", edad: "12 meses", meses: 12 },
  { vacuna: "Hexavalente", dosis: "Refuerzo", edad: "18 meses", meses: 18 },
  { vacuna: "DPT", dosis: "Refuerzo", edad: "4 años", meses: 48 },
  { vacuna: "SRP (triple viral)", dosis: "2ª", edad: "6 años", meses: 72 },
];

export type RecompensasConfig = {
  /** Interruptor del programa de lealtad. Apagado, desaparece de la portada y de la cuenta del paciente. */
  activa: boolean;
  citas_requeridas: number;
  valor_descuento: number;
};

/** Ajustes de integraciones de la clínica (todas simuladas en esta demo). */
export type IntegracionesConfig = {
  google_login: boolean;
  whatsapp_recordatorios: boolean;
  recordatorio_horas: number;
  pagos_en_linea: boolean;
  telemedicina_proveedor: "Google Meet" | "Zoom" | "Sala propia";
};

/** Aviso interno del panel (campana). */
export type Aviso = {
  id: string;
  para: string; // "admin" o id del médico / paciente
  titulo: string;
  detalle: string;
  creado_en: string;
  leido: boolean;
  enlace?: string;
};

export type ClinicaConfig = {
  nombre: string;
  /** Frase corta bajo el nombre en la portada */
  eslogan: string;
  /** Quiénes son: el párrafo de la sección "Nosotros" de la portada */
  descripcion: string;
  direccion: string;
  /** Enlace de Google Maps para el botón "Cómo llegar" */
  mapa_url: string;
  telefono: string;
  whatsapp: string;
  email: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  anio_fundacion: string;
  /** Horario de atención al público, mostrado en la portada */
  horario: HorarioSemanal;
};

// --- Pacientes y tarjetas de lealtad ----------------------------------------

export type Paciente = {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  creado_en: string; // ISO
  /** Quién lo dio de alta (id del personal). El médico que lo registró siempre ve su número. */
  registrado_por?: string;
  /** Id de su cuenta de acceso (Supabase Auth) cuando ya activó su acceso */
  cuenta_id?: string;
  /** Vinculó su cuenta de Google */
  google?: boolean;
  /** Sólo en la vista del personal: ya tiene acceso propio (sin exponer el id de la cuenta) */
  cuenta?: boolean;
  fecha_nacimiento?: string; // YYYY-MM-DD
  sexo?: "F" | "M" | "";
  /** Madre, padre o tutor (pacientes pediátricos) */
  tutor?: string;
  alergias?: string;
  tipo_sangre?: string;
  antecedentes?: string;
};

export type EstadoTarjeta = "activa" | "suspendida";

/**
 * Tarjeta de lealtad: una por paciente, con número propio para identificarla
 * en mostrador (código QR) y en Google Wallet.
 *
 * Los sellos salen de dos fuentes: las citas asistidas del paciente, que se
 * cuentan solas, y los `sellos_extra` que el mostrador pone a mano para las
 * visitas sin cita. Así nunca hay que llevar dos contadores sincronizados.
 */
export type TarjetaLealtad = {
  id: string;
  numero: string;
  paciente_id: string;
  emitida_en: string; // ISO
  sellos_extra: number;
  estado: EstadoTarjeta;
  /** Última vez que el paciente la guardó en Google Wallet */
  wallet_guardada_en: string | null;
};

// --- Catálogo, inventario y caja -------------------------------------------

/** Secciones del menú. Barba, Color y Ritual quedan por datos anteriores al menú impreso. */
export const CATEGORIAS_SERVICIO = ["Consulta", "Pediatría", "Vacunación", "Estudios", "Especialidad", "Telemedicina", "Paquete"] as const;

export type Servicio = {
  id: string;
  nombre: string;
  categoria: (typeof CATEGORIAS_SERVICIO)[number];
  /** Qué incluye, p. ej. "Corte y facial" en los paquetes */
  descripcion?: string;
  /** El precio es mínimo ("A partir de $250"): sube según largo o diseño */
  desde?: boolean;
  precio: number;
  duracion_min: number;
  /** Porcentaje del servicio que se lleva el médico */
  comision_pct: number;
  activo: boolean;
  /** Médicos que lo ofrecen. Vacío = cualquiera del equipo. */
  medicos?: string[];
};

export const CATEGORIAS_PRODUCTO = ["Vacuna", "Medicamento", "Material de curación", "Consumible"] as const;

export type Producto = {
  id: string;
  nombre: string;
  categoria: (typeof CATEGORIAS_PRODUCTO)[number];
  existencias: number;
  lote?: string;
  caducidad?: string; // YYYY-MM-DD
  minimo: number;
  costo: number;
  precio_venta: number;
  unidad: string;
};

export const CATEGORIAS_GASTO = ["Renta", "Insumos médicos", "Nómina", "Publicidad", "Servicios", "Equipo", "Otros"] as const;

export type Gasto = {
  id: string;
  concepto: string;
  categoria: (typeof CATEGORIAS_GASTO)[number];
  monto: number;
  fecha: string; // ISO
};

// --- Estado completo ---------------------------------------------------------

export type Estado = {
  citas: Cita[];
  medicos: Medico[];
  horarios: Record<string, HorarioSemanal>;
  fichas: Ficha[];
  recompensas: RecompensasConfig;
  clinica: ClinicaConfig;
  canjes: Record<string, number>;
  servicios: Servicio[];
  productos: Producto[];
  gastos: Gasto[];
  pacientes: Paciente[];
  tarjetas: TarjetaLealtad[];
  vacunas: VacunaAplicada[];
  eventos_google: EventoGoogle[];
  integraciones: IntegracionesConfig;
  avisos: Aviso[];
};

export type Clave = keyof Estado;

export function horarioPorDefecto(): HorarioSemanal {
  const finde: DiaSemana[] = ["sab", "dom"];
  return DIAS_SEMANA.reduce((acc, d) => {
    acc[d.id] = { activo: !finde.includes(d.id), inicio: "09:00", fin: "14:00" };
    return acc;
  }, {} as HorarioSemanal);
}

/** Horario del local sin configurar: todo cerrado hasta que el admin lo llene. */
function horarioLocalVacio(): HorarioSemanal {
  return DIAS_SEMANA.reduce((acc, d) => {
    acc[d.id] = { activo: false, inicio: "10:00", fin: "20:00" };
    return acc;
  }, {} as HorarioSemanal);
}

export const CLINICA_VACIA: ClinicaConfig = {
  nombre: "",
  eslogan: "",
  descripcion: "",
  direccion: "",
  mapa_url: "",
  telefono: "",
  whatsapp: "",
  email: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  anio_fundacion: "",
  horario: horarioLocalVacio(),
};

export function estadoVacio(): Estado {
  return {
    citas: [],
    medicos: [],
    horarios: {},
    fichas: [],
    recompensas: { activa: false, citas_requeridas: 5, valor_descuento: 15 },
    clinica: CLINICA_VACIA,
    canjes: {},
    servicios: [],
    productos: [],
    gastos: [],
    pacientes: [],
    tarjetas: [],
    vacunas: [],
    eventos_google: [],
    integraciones: INTEGRACIONES_POR_DEFECTO,
    avisos: [],
  };
}

export const INTEGRACIONES_POR_DEFECTO: IntegracionesConfig = {
  google_login: true,
  whatsapp_recordatorios: true,
  recordatorio_horas: 24,
  pagos_en_linea: false,
  telemedicina_proveedor: "Google Meet",
};

/** Mezcla lo guardado con la forma vacía para no dejar huecos `undefined`. */
export function normalizarEstado(parcial: Partial<Estado>): Estado {
  const base = estadoVacio();
  const clinica = { ...CLINICA_VACIA, ...(parcial.clinica ?? {}) };
  clinica.horario = { ...CLINICA_VACIA.horario, ...(parcial.clinica?.horario ?? {}) };
  return {
    ...base,
    ...parcial,
    clinica,
    recompensas: { ...base.recompensas, ...(parcial.recompensas ?? {}) },
    integraciones: { ...base.integraciones, ...(parcial.integraciones ?? {}) },
  };
}

/**
 * Nombre comercial para logotipos y títulos. Cae a la variable de entorno y,
 * si tampoco existe, a un genérico: nunca a una marca de ejemplo.
 */
export const NOMBRE_POR_DEFECTO = process.env.NEXT_PUBLIC_NOMBRE_NEGOCIO || "Medical OS";

export function nombreDelNegocio(cfg: Pick<ClinicaConfig, "nombre">) {
  return cfg.nombre.trim() || NOMBRE_POR_DEFECTO;
}

/**
 * Número legible de tarjeta: un prefijo fijo y ocho cifras aleatorias
 * agrupadas para dictarlo en voz alta.
 */
export function numeroDeTarjeta(existentes: Set<string>) {
  let numero = "";
  do {
    const cifras = Array.from(crypto.getRandomValues(new Uint32Array(2)))
      .map((n) => String(n % 10_000).padStart(4, "0"))
      .join("-");
    numero = `MOS-${cifras}`;
  } while (existentes.has(numero));
  return numero;
}

function tarjetaNueva(estado: Estado, id: string, numero: string, pacienteId: string): TarjetaLealtad {
  const usados = new Set(estado.tarjetas.map((t) => t.numero));
  return {
    id,
    numero: usados.has(numero) ? numeroDeTarjeta(usados) : numero,
    paciente_id: pacienteId,
    emitida_en: new Date().toISOString(),
    sellos_extra: 0,
    estado: "activa",
    wallet_guardada_en: null,
  };
}

export function nuevoId(prefijo: string) {
  return `${prefijo}-${crypto.randomUUID().slice(0, 8)}`;
}

// ---------------------------------------------------------------------------
// Operaciones
// ---------------------------------------------------------------------------

export type Operacion =
  | {
      tipo: "crearCita";
      id: string;
      medico_id: string;
      servicio_id?: string | null;
      inicio: string;
      fin: string;
      modalidad: Modalidad;
      metodo_pago: MetodoPago;
      direccion_domicilio?: string;
      motivo?: string;
    }
  | {
      tipo: "crearCitaPersonal";
      id: string;
      paciente_id: string;
      medico_id: string;
      servicio_id?: string | null;
      inicio: string;
      modalidad: Modalidad;
      direccion_domicilio?: string;
      precio?: number;
      notas?: string;
      motivo?: string;
      /** El administrador puede agendar fuera de horario o encimar citas */
      forzar?: boolean;
    }
  | {
      tipo: "actualizarCita";
      id: string;
      cambios: Partial<
        Pick<
          Cita,
          "inicio" | "medico_id" | "servicio_id" | "estado" | "precio" | "estado_pago" | "metodo_pago" | "notas" | "modalidad" | "direccion_domicilio"
        >
      >;
      forzar?: boolean;
    }
  | { tipo: "cobrarEfectivo"; id: string }
  | { tipo: "cobrarCita"; id: string; metodo: MetodoPago }
  | { tipo: "marcarAsistida"; id: string }
  | { tipo: "cancelarCita"; id: string }
  | { tipo: "eliminarCita"; id: string }
  | { tipo: "eliminarTodasLasCitas" }
  | { tipo: "agregarMedico"; medico: Medico }
  | { tipo: "actualizarMedico"; id: string; cambios: Partial<Omit<Medico, "id">> }
  | { tipo: "toggleActivoMedico"; id: string }
  | { tipo: "eliminarMedico"; id: string }
  | { tipo: "eliminarPaciente"; id: string }
  | { tipo: "eliminarServicio"; id: string }
  | { tipo: "guardarHorarioDia"; medicoId: string; dia: DiaSemana; cambios: Partial<BloqueHorario> }
  | { tipo: "agregarFicha"; ficha: Ficha }
  | { tipo: "actualizarRecompensasConfig"; cambios: Partial<RecompensasConfig> }
  | { tipo: "actualizarClinicaConfig"; cambios: Partial<ClinicaConfig> }
  | { tipo: "canjearRecompensa"; pacienteId: string }
  | { tipo: "agregarServicio"; servicio: Servicio }
  | { tipo: "agregarServicios"; servicios: Servicio[] }
  | { tipo: "actualizarServicio"; id: string; cambios: Partial<Omit<Servicio, "id">> }
  | { tipo: "agregarProducto"; producto: Producto }
  | { tipo: "ajustarExistencias"; id: string; delta: number }
  | { tipo: "actualizarProducto"; id: string; cambios: Partial<Omit<Producto, "id">> }
  | { tipo: "eliminarProducto"; id: string }
  | { tipo: "agregarGasto"; gasto: Gasto }
  | { tipo: "eliminarGasto"; id: string }
  | { tipo: "registrarPaciente"; paciente: Paciente; tarjetaId: string; numeroTarjeta: string }
  | { tipo: "actualizarPaciente"; id: string; cambios: Partial<Omit<Paciente, "id">> }
  | { tipo: "ajustarSellos"; tarjetaId: string; delta: number }
  | { tipo: "cambiarEstadoTarjeta"; tarjetaId: string; estado: EstadoTarjeta }
  | { tipo: "marcarWalletGuardada"; tarjetaId: string; fecha: string }
  /** Lo usa el servidor al activar el acceso de un paciente (teléfono o Google) */
  | { tipo: "vincularCuentaPaciente"; pacienteId: string; cuentaId: string; google?: boolean; email?: string }
  /**
   * Reserva sin cuenta (sólo nombre y celular). La usa /api/reservas con la
   * sesión del sistema: si el número es nuevo crea la ficha, su tarjeta de
   * lealtad y la cita en una sola escritura; si ya existe, agenda en su ficha.
   */
  | {
      tipo: "reservarInvitado";
      id: string;
      nombre: string;
      telefono: string;
      medico_id: string;
      servicio_id?: string | null;
      inicio: string;
      modalidad: Modalidad;
      direccion_domicilio?: string;
      pacienteId: string;
      tarjetaId: string;
      numeroTarjeta: string;
      motivo?: string;
    }
  | { tipo: "agregarVacuna"; vacuna: VacunaAplicada }
  | { tipo: "eliminarVacuna"; id: string }
  | { tipo: "conectarGoogle"; medicoId: string; email: string; calendario?: string }
  | { tipo: "desconectarGoogle"; medicoId: string }
  | { tipo: "sincronizarGoogle"; medicoId: string }
  | { tipo: "ajustarGoogle"; medicoId: string; auto: boolean }
  | { tipo: "agregarEventoGoogle"; evento: EventoGoogle }
  | { tipo: "eliminarEventoGoogle"; id: string }
  | { tipo: "actualizarIntegraciones"; cambios: Partial<IntegracionesConfig> }
  | { tipo: "marcarAvisosLeidos" };

/** Error de negocio: el servidor lo devuelve tal cual al navegador. */
export class ErrorOperacion extends Error {
  constructor(
    message: string,
    public status = 400
  ) {
    super(message);
  }
}

const esStaff = (s: Sesion) => s.rol === "admin" || s.rol === "medico";

/**
 * Servicio elegido para una cita y lo que define: precio, duración y comisión.
 * Sin catálogo (clínica recién abierta) la cita va sin servicio, precio 0 y
 * la duración base del médico.
 */
function servicioParaCita(estado: Estado, servicioId: string | null | undefined, medico: Medico) {
  const activos = estado.servicios.filter((x) => x.activo);
  if (!servicioId) {
    if (activos.length > 0) throw new ErrorOperacion("Elige el servicio.", 400);
    return { servicio: null, precio: 0, duracion: Math.max(5, medico.duracion_cita_min), comision: 0 };
  }
  const servicio = estado.servicios.find((x) => x.id === servicioId);
  if (!servicio) throw new ErrorOperacion("Ese servicio ya no existe.", 400);
  return {
    servicio,
    precio: precioDe(servicio, medico),
    duracion: Math.max(5, servicio.duracion_min),
    comision: Math.min(100, Math.max(0, servicio.comision_pct)),
  };
}

function precioValido(valor: unknown, porDefecto: number) {
  const n = Number(valor);
  return Number.isFinite(n) && n >= 0 && n <= 1_000_000 ? Math.round(n) : porDefecto;
}

/**
 * Comprueba que el médico esté libre en [inicio, fin). Con `forzar` (sólo el
 * administrador) se aceptan horas fuera de horario o encimadas: es el
 * mostrador quien decide, por ejemplo, meter a alguien de última hora.
 */
function validarHueco(estado: Estado, medico: Medico, inicio: number, fin: number, ignorar: string | null, forzar: boolean) {
  if (forzar) return;
  if (!medico.activo) throw new ErrorOperacion(`${medico.nombre} está desactivado.`, 409);
  const choque = estado.citas.find(
    (c) =>
      c.id !== ignorar &&
      c.medico_id === medico.id &&
      citaActiva(c) &&
      inicio < new Date(c.fin).getTime() &&
      fin > new Date(c.inicio).getTime()
  );
  if (choque) {
    throw new ErrorOperacion(`${medico.nombre} ya tiene una cita a esa hora (${choque.paciente_nombre || "otro paciente"}).`, 409);
  }
}

/** Citas por venir que puede tener un mismo paciente al reservar en línea. */
export const MAX_CITAS_FUTURAS = 2;

function exigirCupoDeCitas(estado: Estado, pacienteId: string) {
  const ahora = Date.now();
  const futuras = estado.citas.filter(
    (c) => c.paciente_id === pacienteId && c.estado === "confirmada" && new Date(c.fin).getTime() > ahora
  ).length;
  if (futuras >= MAX_CITAS_FUTURAS) {
    throw new ErrorOperacion(
      `Ya tienes ${futuras} citas por venir. Para agendar otra, llama o escribe por WhatsApp a la clínica.`,
      409
    );
  }
}

/**
 * Cita que agenda el propio paciente (con o sin cuenta). Precio y duración los
 * pone el servicio, no el navegador; el hueco debe seguir libre al guardar.
 */
function citaDePaciente(
  estado: Estado,
  datos: { id: string; medico_id: string; servicio_id?: string | null; inicio: string; modalidad: Modalidad; direccion_domicilio?: string; motivo?: string },
  paciente: { id: string; nombre: string }
): Cita {
  idNuevo(estado.citas, datos.id);
  const medico = estado.medicos.find((b) => b.id === datos.medico_id);
  if (!medico) throw new ErrorOperacion("El médico no está disponible.", 400);
  const inicio = new Date(datos.inicio).getTime();
  if (!Number.isFinite(inicio)) throw new ErrorOperacion("Horario inválido.", 400);
  const sv = servicioParaCita(estado, datos.servicio_id, medico);
  if (sv.servicio && !sv.servicio.activo) throw new ErrorOperacion("Ese servicio no está disponible.", 400);
  const fin = inicio + sv.duracion * 60_000;
  const problema = horarioReservable(
    {
      medico: { ...medico, duracion_cita_min: sv.duracion },
      horario: estado.horarios[medico.id] ?? horarioPorDefecto(),
      clinica: estado.clinica,
      citas: estado.citas,
      eventos: estado.eventos_google,
    },
    inicio
  );
  if (problema) throw new ErrorOperacion(problema, 409);
  const domicilio = datos.modalidad === "domicilio" && medico.acepta_domicilio;
  const video = datos.modalidad === "telemedicina" && medico.telemedicina;
  return {
    id: datos.id,
    paciente_id: paciente.id,
    paciente_nombre: paciente.nombre,
    medico_id: medico.id,
    medico_nombre: medico.nombre,
    especialidad: medico.especialidad,
    inicio: new Date(inicio).toISOString(),
    fin: new Date(fin).toISOString(),
    modalidad: video ? "telemedicina" : domicilio ? "domicilio" : "presencial",
    enlace_video: video ? salaDeVideo(datos.id) : null,
    motivo: String(datos.motivo ?? "").slice(0, 400),
    estado: "confirmada",
    precio: sv.precio,
    servicio_id: sv.servicio?.id ?? null,
    servicio_nombre: sv.servicio?.nombre ?? "",
    comision_pct: sv.comision,
    direccion_domicilio: domicilio ? String(datos.direccion_domicilio || "Domicilio del paciente").slice(0, 300) : null,
    // El pago se registra en recepción: el cobro en línea es una simulación.
    metodo_pago: "efectivo",
    estado_pago: "pendiente",
    creada_por: "paciente",
  };
}

function exigir(condicion: unknown, mensaje = "No tienes permiso para esta acción."): asserts condicion {
  if (!condicion) throw new ErrorOperacion(mensaje, 403);
}

function buscar<T extends { id: string }>(lista: T[], id: string, que: string): T {
  const item = lista.find((x) => x.id === id);
  if (!item) throw new ErrorOperacion(`${que} no encontrado.`, 404);
  return item;
}

function idNuevo(lista: { id: string }[], id: string) {
  if (typeof id !== "string" || id.length < 4 || id.length > 64 || lista.some((x) => x.id === id)) {
    throw new ErrorOperacion("Identificador inválido.", 400);
  }
}

/**
 * Aplica una operación y devuelve sólo las colecciones que cambian. Lanza
 * `ErrorOperacion` si la sesión no tiene permiso o los datos no cuadran.
 */
/** Sala de videollamada simulada para las consultas de telemedicina. */
export function salaDeVideo(id: string) {
  const limpio = id.replace(/[^a-z0-9]/gi, "").slice(-9).padEnd(9, "x").toLowerCase();
  return `https://meet.google.com/${limpio.slice(0, 3)}-${limpio.slice(3, 7)}-${limpio.slice(7)}x`;
}

/**
 * Aplica una operación y, de paso, mantiene lo que se deriva de las citas:
 * los eventos espejo en Google Calendar de los médicos con sincronización
 * automática y los avisos de la campana.
 */
export function aplicarOperacion(estado: Estado, op: Operacion, s: Sesion): Partial<Estado> {
  const cambios = aplicarOperacionBase(estado, op, s);
  if (!cambios.citas) return cambios;
  const despues = { ...estado, ...cambios };
  const espejo = espejarGoogle(despues, false);
  if (espejo) Object.assign(cambios, espejo);
  const avisos = avisosDe(estado, { ...estado, ...cambios }, op, s);
  if (avisos.length) cambios.avisos = [...avisos, ...(cambios.avisos ?? estado.avisos)].slice(0, 80);
  return cambios;
}

/** Duplica las citas activas como eventos de Google en los calendarios conectados. */
export function espejarGoogle(estado: Estado, forzarTodos: boolean, soloMedico?: string): Partial<Estado> | null {
  const conectados = new Set(
    estado.medicos.filter((m) => m.google && (m.google.auto || forzarTodos) && (!soloMedico || m.id === soloMedico)).map((m) => m.id)
  );
  const desconectados = new Set(estado.medicos.filter((m) => !m.google).map((m) => m.id));
  const activos = new Map(estado.citas.filter((c) => citaActiva(c) && conectados.has(c.medico_id)).map((c) => [c.id, c]));
  let cambio = false;
  const eventos: EventoGoogle[] = [];
  for (const e of estado.eventos_google) {
    if (e.origen !== "medical-os") {
      eventos.push(e);
      continue;
    }
    if (desconectados.has(e.medico_id)) {
      cambio = true;
      continue;
    }
    if (!conectados.has(e.medico_id)) {
      eventos.push(e);
      continue;
    }
    const cita = e.cita_id ? activos.get(e.cita_id) : undefined;
    if (!cita) {
      cambio = true;
      continue;
    }
    const titulo = tituloEvento(cita);
    if (e.inicio !== cita.inicio || e.fin !== cita.fin || e.titulo !== titulo) cambio = true;
    eventos.push({ ...e, inicio: cita.inicio, fin: cita.fin, titulo });
    activos.delete(cita.id);
  }
  for (const cita of activos.values()) {
    cambio = true;
    eventos.push({
      id: `gev-${cita.id}`,
      medico_id: cita.medico_id,
      titulo: tituloEvento(cita),
      inicio: cita.inicio,
      fin: cita.fin,
      origen: "medical-os",
      cita_id: cita.id,
      ocupado: true,
    });
  }
  const conEvento = new Set(eventos.filter((e) => e.cita_id).map((e) => e.cita_id));
  let citasCambian = false;
  const citas = estado.citas.map((c) => {
    const id = conEvento.has(c.id) ? `gev-${c.id}` : null;
    if ((c.google_evento_id ?? null) === id) return c;
    citasCambian = true;
    return { ...c, google_evento_id: id };
  });
  if (!cambio && !citasCambian) return null;
  const ahora = new Date().toISOString();
  const medicos = estado.medicos.map((m) => (conectados.has(m.id) && m.google ? { ...m, google: { ...m.google, ultimo_sync: ahora } } : m));
  return { eventos_google: eventos, citas, medicos };
}

function tituloEvento(c: Cita) {
  return `${c.servicio_nombre || "Consulta"} · ${c.paciente_nombre || "Paciente"}`;
}

function avisosDe(antes: Estado, despues: Estado, op: Operacion, s: Sesion): Aviso[] {
  const out: Aviso[] = [];
  const ahora = new Date().toISOString();
  const fecha = (iso: string) =>
    new Date(iso).toLocaleString("es-MX", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: ZONA_HORARIA });
  const previas = new Set(antes.citas.map((c) => c.id));
  for (const c of despues.citas) {
    if (previas.has(c.id)) continue;
    const titulo = c.creada_por === "paciente" ? "Nueva cita en línea" : "Cita agendada";
    const detalle = `${c.paciente_nombre} · ${c.servicio_nombre || "Consulta"} · ${fecha(c.inicio)}`;
    out.push({ id: nuevoId("av"), para: "admin", titulo, detalle, creado_en: ahora, leido: false, enlace: "/dashboard/admin/citas" });
    if (s.id !== c.medico_id) {
      out.push({ id: nuevoId("av"), para: c.medico_id, titulo, detalle, creado_en: ahora, leido: false, enlace: "/dashboard/medico" });
    }
  }
  if (op.tipo === "cancelarCita" && s.rol === "paciente") {
    const c = despues.citas.find((x) => x.id === op.id);
    if (c) {
      const detalle = `${c.paciente_nombre} canceló ${c.servicio_nombre || "su consulta"} del ${fecha(c.inicio)}`;
      out.push({ id: nuevoId("av"), para: "admin", titulo: "Cita cancelada", detalle, creado_en: ahora, leido: false });
      out.push({ id: nuevoId("av"), para: c.medico_id, titulo: "Cita cancelada", detalle, creado_en: ahora, leido: false });
    }
  }
  return out;
}

function aplicarOperacionBase(estado: Estado, op: Operacion, s: Sesion): Partial<Estado> {
  switch (op.tipo) {
    case "crearCita": {
      exigir(s.rol === "paciente", "Sólo los pacientes pueden reservar.");
      exigirCupoDeCitas(estado, s.id);
      const nueva = citaDePaciente(estado, op, { id: s.id, nombre: s.nombre });
      return { citas: [...estado.citas, nueva] };
    }

    case "reservarInvitado": {
      // Sólo el servidor (sesión del sistema) la ejecuta, tras sus límites.
      exigir(s.rol === "admin" && s.id === "sistema", "Operación reservada al servidor.");
      const telefono = normalizarTelefono(op.telefono);
      if (!celularValido(telefono)) throw new ErrorOperacion("Escribe un celular válido de 10 dígitos.", 400);
      const nombre = String(op.nombre ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
      if (nombre.length < 2) throw new ErrorOperacion("Escribe tu nombre.", 400);

      const existente = estado.pacientes.find((c) => normalizarTelefono(c.telefono) === telefono);
      if (existente) {
        exigirCupoDeCitas(estado, existente.id);
        const nueva = citaDePaciente(estado, op, { id: existente.id, nombre: existente.nombre });
        const cambios: Partial<Estado> = { citas: [...estado.citas, nueva] };
        // Ficha sin tarjeta (datos viejos): se le emite de paso.
        if (!estado.tarjetas.some((t) => t.paciente_id === existente.id)) {
          idNuevo(estado.tarjetas, op.tarjetaId);
          cambios.tarjetas = [...estado.tarjetas, tarjetaNueva(estado, op.tarjetaId, op.numeroTarjeta, existente.id)];
        }
        return cambios;
      }

      idNuevo(estado.pacientes, op.pacienteId);
      idNuevo(estado.tarjetas, op.tarjetaId);
      const creado = new Date().toISOString();
      const paciente: Paciente = { id: op.pacienteId, nombre, telefono, email: "", creado_en: creado };
      const nueva = citaDePaciente(estado, op, { id: paciente.id, nombre });
      return {
        pacientes: [...estado.pacientes, paciente],
        tarjetas: [...estado.tarjetas, tarjetaNueva(estado, op.tarjetaId, op.numeroTarjeta, paciente.id)],
        citas: [...estado.citas, nueva],
      };
    }

    case "crearCitaPersonal": {
      exigir(esStaff(s), "Sólo el personal agenda a nombre de un paciente.");
      exigir(puede(estado, s, "crear_citas"), "No tienes permiso para crear citas. Pídeselo al administrador.");
      exigir(
        s.rol === "admin" || op.medico_id === s.id || puede(estado, s, "agendar_otros"),
        "Sólo puedes agendar en tu propia agenda."
      );
      idNuevo(estado.citas, op.id);
      const paciente = buscar(estado.pacientes, op.paciente_id, "Paciente");
      const medico = buscar(estado.medicos, op.medico_id, "Médico");
      const inicio = new Date(op.inicio).getTime();
      if (!Number.isFinite(inicio)) throw new ErrorOperacion("Horario inválido.", 400);
      const sv = servicioParaCita(estado, op.servicio_id, medico);
      const fin = inicio + sv.duracion * 60_000;
      validarHueco(estado, medico, inicio, fin, null, Boolean(op.forzar) && s.rol === "admin");
      const domicilio = op.modalidad === "domicilio";
      const video = op.modalidad === "telemedicina";
      const nueva: Cita = {
        id: op.id,
        paciente_id: paciente.id,
        paciente_nombre: paciente.nombre,
        medico_id: medico.id,
        medico_nombre: medico.nombre,
        especialidad: medico.especialidad,
        inicio: new Date(inicio).toISOString(),
        fin: new Date(fin).toISOString(),
        modalidad: video ? "telemedicina" : domicilio ? "domicilio" : "presencial",
        enlace_video: video ? salaDeVideo(op.id) : null,
        motivo: String(op.motivo ?? "").slice(0, 400),
        estado: "confirmada",
        precio: s.rol === "admin" ? precioValido(op.precio, sv.precio) : sv.precio,
        servicio_id: sv.servicio?.id ?? null,
        servicio_nombre: sv.servicio?.nombre ?? "",
        comision_pct: sv.comision,
        direccion_domicilio: domicilio ? String(op.direccion_domicilio || "Domicilio del paciente").slice(0, 300) : null,
        metodo_pago: "efectivo",
        estado_pago: "pendiente",
        notas: String(op.notas ?? "").slice(0, 500),
        creada_por: "personal",
        llegada_en: null,
      };
      return { citas: [...estado.citas, nueva] };
    }

    case "actualizarCita": {
      const cita = buscar(estado.citas, op.id, "Cita");
      exigir(s.rol === "admin" || (s.rol === "medico" && cita.medico_id === s.id));
      const c = op.cambios ?? {};
      const siguiente: Cita = { ...cita };

      if (c.medico_id !== undefined && c.medico_id !== cita.medico_id) {
        exigir(s.rol === "admin", "Sólo el administrador cambia quién atiende la cita.");
        const otro = buscar(estado.medicos, c.medico_id, "Médico");
        siguiente.medico_id = otro.id;
        siguiente.medico_nombre = otro.nombre;
        siguiente.especialidad = otro.especialidad;
        // Si el precio era el del médico anterior, pasa al del nuevo.
        const sv = estado.servicios.find((x) => x.id === cita.servicio_id);
        const anterior = estado.medicos.find((b) => b.id === cita.medico_id);
        if (sv && cita.precio === precioDe(sv, anterior)) siguiente.precio = precioDe(sv, otro);
      }
      let duracion = Math.max(5 * 60_000, new Date(cita.fin).getTime() - new Date(cita.inicio).getTime());
      if (c.servicio_id !== undefined && c.servicio_id !== (cita.servicio_id ?? null)) {
        const sv = servicioParaCita(estado, c.servicio_id, buscar(estado.medicos, siguiente.medico_id, "Médico"));
        siguiente.servicio_id = sv.servicio?.id ?? null;
        siguiente.servicio_nombre = sv.servicio?.nombre ?? "";
        siguiente.comision_pct = sv.comision;
        siguiente.precio = sv.precio;
        duracion = sv.duracion * 60_000;
        siguiente.fin = new Date(new Date(siguiente.inicio).getTime() + duracion).toISOString();
      }
      if (c.inicio !== undefined && c.inicio !== cita.inicio) {
        const inicio = new Date(c.inicio).getTime();
        if (!Number.isFinite(inicio)) throw new ErrorOperacion("Horario inválido.", 400);
        siguiente.inicio = new Date(inicio).toISOString();
        siguiente.fin = new Date(inicio + duracion).toISOString();
      }
      // Al mover la cita (de hora o de médico) el hueco nuevo debe estar libre.
      const seMueve =
        siguiente.inicio !== cita.inicio || siguiente.medico_id !== cita.medico_id || siguiente.fin !== cita.fin;
      const estadoFinal = c.estado ?? cita.estado;
      if (seMueve && estadoFinal === "confirmada") {
        const medico = buscar(estado.medicos, siguiente.medico_id, "Médico");
        validarHueco(
          estado,
          medico,
          new Date(siguiente.inicio).getTime(),
          new Date(siguiente.fin).getTime(),
          cita.id,
          Boolean(op.forzar) && s.rol === "admin"
        );
      }
      if (c.estado !== undefined) {
        exigir(c.estado in ETIQUETA_ESTADO_CITA, "Estado inválido.");
        if (c.estado === "asistida" && cita.estado !== "asistida") {
          exigir(puede(estado, s, "confirmar_llegadas"), "No tienes permiso para confirmar llegadas.");
        }
        siguiente.estado = c.estado;
        siguiente.llegada_en = c.estado === "asistida" ? (cita.llegada_en ?? new Date().toISOString()) : null;
      }
      if (c.precio !== undefined) {
        exigir(s.rol === "admin", "Sólo el administrador cambia el precio.");
        siguiente.precio = precioValido(c.precio, cita.precio);
      }
      if (c.estado_pago !== undefined && c.estado_pago !== cita.estado_pago) {
        exigir(puede(estado, s, "cobrar"), "No tienes permiso para registrar cobros.");
        siguiente.estado_pago = c.estado_pago === "pagado" ? "pagado" : "pendiente";
      }
      if (c.metodo_pago !== undefined && c.metodo_pago !== cita.metodo_pago) {
        exigir(puede(estado, s, "cobrar"), "No tienes permiso para registrar cobros.");
        siguiente.metodo_pago = c.metodo_pago === "tarjeta" ? "tarjeta" : "efectivo";
      }
      if (c.notas !== undefined) siguiente.notas = String(c.notas).slice(0, 500);
      if (c.modalidad !== undefined) {
        siguiente.modalidad = c.modalidad === "domicilio" ? "domicilio" : c.modalidad === "telemedicina" ? "telemedicina" : "presencial";
        siguiente.enlace_video = siguiente.modalidad === "telemedicina" ? (cita.enlace_video ?? salaDeVideo(cita.id)) : null;
        siguiente.direccion_domicilio =
          siguiente.modalidad === "domicilio"
            ? String(c.direccion_domicilio ?? cita.direccion_domicilio ?? "Domicilio del paciente").slice(0, 300)
            : null;
      } else if (c.direccion_domicilio !== undefined && siguiente.modalidad === "domicilio") {
        siguiente.direccion_domicilio = String(c.direccion_domicilio).slice(0, 300);
      }
      return { citas: estado.citas.map((x) => (x.id === op.id ? siguiente : x)) };
    }

    case "cobrarEfectivo":
    case "cobrarCita":
    case "marcarAsistida":
    case "cancelarCita": {
      const cita = buscar(estado.citas, op.id, "Cita");
      const propiaDelMedico = s.rol === "medico" && cita.medico_id === s.id;
      const propiaDelPaciente = s.rol === "paciente" && cita.paciente_id === s.id;
      if (op.tipo === "cancelarCita") exigir(s.rol === "admin" || propiaDelMedico || propiaDelPaciente);
      else exigir(s.rol === "admin" || propiaDelMedico);
      if (op.tipo === "cobrarEfectivo" || op.tipo === "cobrarCita") {
        exigir(puede(estado, s, "cobrar"), "No tienes permiso para registrar cobros.");
      }
      if (op.tipo === "marcarAsistida") {
        exigir(puede(estado, s, "confirmar_llegadas"), "No tienes permiso para confirmar llegadas.");
      }
      if (op.tipo === "marcarAsistida" && cita.estado === "cancelada") {
        throw new ErrorOperacion("La cita está cancelada. Reactívala antes de confirmar la llegada.", 409);
      }
      if (op.tipo === "cancelarCita" && s.rol === "paciente" && cita.estado !== "confirmada") {
        throw new ErrorOperacion("Esta cita ya no se puede cancelar.", 409);
      }
      const cambios: Partial<Cita> =
        op.tipo === "cobrarEfectivo"
          ? { estado_pago: "pagado", metodo_pago: "efectivo" }
          : op.tipo === "cobrarCita"
            ? { estado_pago: "pagado", metodo_pago: op.metodo === "tarjeta" ? "tarjeta" : "efectivo" }
            : op.tipo === "marcarAsistida"
              ? { estado: "asistida", llegada_en: cita.llegada_en ?? new Date().toISOString() }
              : { estado: "cancelada" };
      return { citas: estado.citas.map((c) => (c.id === op.id ? { ...c, ...cambios } : c)) };
    }

    case "eliminarCita":
      // Borrar no es cancelar: la cita desaparece de agenda, caja, reportes y sellos.
      exigir(s.rol === "admin", "Sólo el administrador elimina citas.");
      buscar(estado.citas, op.id, "Cita");
      return { citas: estado.citas.filter((c) => c.id !== op.id) };

    case "eliminarTodasLasCitas":
      exigir(s.rol === "admin", "Sólo el administrador elimina citas.");
      return { citas: [] };

    case "agregarMedico":
      // Lo usa /api/admin/usuarios tras crear la cuenta: el id es el del usuario.
      exigir(s.rol === "admin");
      idNuevo(estado.medicos, op.medico.id);
      return { medicos: [...estado.medicos, op.medico] };

    case "actualizarMedico": {
      exigir(s.rol === "admin" || (s.rol === "medico" && op.id === s.id));
      buscar(estado.medicos, op.id, "Médico");
      const cambios = { ...op.cambios };
      // El médico edita su perfil, pero su alta y baja la decide el admin.
      if (s.rol !== "admin") {
        delete cambios.activo;
        delete cambios.permisos;
        delete cambios.precios;
      } else if (cambios.permisos) {
        // Sólo se guardan permisos conocidos y como booleanos.
        const limpio: Partial<PermisosMedico> = {};
        for (const k of Object.keys(PERMISOS_POR_DEFECTO) as (keyof PermisosMedico)[]) {
          if (typeof cambios.permisos[k] === "boolean") limpio[k] = cambios.permisos[k];
        }
        cambios.permisos = limpio;
      }
      if (cambios.precios !== undefined) cambios.precios = limpiarPrecios(cambios.precios, estado.servicios);
      const resultado: Partial<Estado> = {
        medicos: estado.medicos.map((b) => (b.id === op.id ? { ...b, ...cambios, id: b.id } : b)),
      };
      const nombre = cambios.nombre?.trim();
      if (nombre) {
        resultado.citas = estado.citas.map((c) => (c.medico_id === op.id ? { ...c, medico_nombre: nombre } : c));
      }
      return resultado;
    }

    case "toggleActivoMedico": {
      exigir(s.rol === "admin");
      buscar(estado.medicos, op.id, "Médico");
      return { medicos: estado.medicos.map((b) => (b.id === op.id ? { ...b, activo: !b.activo } : b)) };
    }

    case "eliminarMedico": {
      exigir(s.rol === "admin", "Sólo el administrador elimina médicos.");
      const medico = buscar(estado.medicos, op.id, "Médico");
      const horarios = { ...estado.horarios };
      delete horarios[op.id];
      // Su historial se queda (con su nombre); lo que tenía agendado se cancela.
      return {
        medicos: estado.medicos.filter((b) => b.id !== op.id),
        horarios,
        citas: estado.citas.map((c) =>
          c.medico_id === op.id && c.estado === "confirmada"
            ? { ...c, estado: "cancelada" as const, notas: `${c.notas ? `${c.notas} · ` : ""}Cancelada: ${medico.nombre} ya no está en el equipo.` }
            : c
        ),
      };
    }

    case "eliminarPaciente": {
      exigir(s.rol === "admin", "Sólo el administrador elimina pacientes.");
      const enFicha = estado.pacientes.some((c) => c.id === op.id);
      const conCitas = estado.citas.some((c) => c.paciente_id === op.id);
      if (!enFicha && !conCitas) throw new ErrorOperacion("Paciente no encontrado.", 404);
      const canjes = { ...estado.canjes };
      delete canjes[op.id];
      return {
        pacientes: estado.pacientes.filter((c) => c.id !== op.id),
        tarjetas: estado.tarjetas.filter((t) => t.paciente_id !== op.id),
        canjes,
        // Las citas atendidas siguen contando en caja y reportes; las pendientes se cancelan.
        citas: estado.citas.map((c) =>
          c.paciente_id !== op.id
            ? c
            : c.estado === "confirmada"
              ? { ...c, paciente_eliminado: true, estado: "cancelada" as const, notas: `${c.notas ? `${c.notas} · ` : ""}Cancelada: paciente eliminado.` }
              : { ...c, paciente_eliminado: true }
        ),
        fichas: estado.fichas.filter((f) => f.paciente_id !== op.id),
      };
    }

    case "eliminarServicio": {
      exigir(s.rol === "admin");
      buscar(estado.servicios, op.id, "Servicio");
      return { servicios: estado.servicios.filter((x) => x.id !== op.id) };
    }

    case "guardarHorarioDia": {
      exigir(s.rol === "admin" || (s.rol === "medico" && op.medicoId === s.id));
      exigir(DIAS_SEMANA.some((d) => d.id === op.dia), "Día inválido.");
      const actual = estado.horarios[op.medicoId] ?? horarioPorDefecto();
      return {
        horarios: {
          ...estado.horarios,
          [op.medicoId]: { ...actual, [op.dia]: { ...actual[op.dia], ...op.cambios } },
        },
      };
    }

    case "agregarFicha": {
      exigir(s.rol === "admin" || (s.rol === "medico" && op.ficha.medico_id === s.id));
      idNuevo(estado.fichas, op.ficha.id);
      return { fichas: [op.ficha, ...estado.fichas] };
    }

    case "actualizarRecompensasConfig":
      exigir(s.rol === "admin");
      return { recompensas: { ...estado.recompensas, ...op.cambios } };

    case "actualizarClinicaConfig":
      exigir(s.rol === "admin");
      return { clinica: { ...estado.clinica, ...op.cambios } };

    case "canjearRecompensa": {
      exigir(s.rol === "admin" || (s.rol === "paciente" && op.pacienteId === s.id));
      const tarjeta = estado.tarjetas.find((t) => t.paciente_id === op.pacienteId);
      const { recompensasGanadas } = calcularLealtad(
        estado.citas,
        op.pacienteId,
        estado.recompensas.citas_requeridas,
        tarjeta?.sellos_extra ?? 0
      );
      const actual = estado.canjes[op.pacienteId] ?? 0;
      if (actual >= recompensasGanadas) throw new ErrorOperacion("No hay recompensas por canjear.", 400);
      return { canjes: { ...estado.canjes, [op.pacienteId]: actual + 1 } };
    }

    case "agregarServicio":
      exigir(s.rol === "admin");
      idNuevo(estado.servicios, op.servicio.id);
      return { servicios: [...estado.servicios, op.servicio] };

    case "agregarServicios": {
      // Carga del menú impreso: sólo entra lo que aún no está (por nombre).
      exigir(s.rol === "admin");
      const nombres = new Set(estado.servicios.map((x) => x.nombre.trim().toLowerCase()));
      const nuevos = (op.servicios ?? []).filter((x) => !nombres.has(x.nombre.trim().toLowerCase()));
      for (const x of nuevos) idNuevo(estado.servicios, x.id);
      return nuevos.length > 0 ? { servicios: [...estado.servicios, ...nuevos] } : {};
    }

    case "actualizarServicio":
      exigir(s.rol === "admin");
      buscar(estado.servicios, op.id, "Servicio");
      return { servicios: estado.servicios.map((x) => (x.id === op.id ? { ...x, ...op.cambios, id: x.id } : x)) };

    case "agregarProducto":
      exigir(s.rol === "admin");
      idNuevo(estado.productos, op.producto.id);
      return { productos: [...estado.productos, op.producto] };

    case "ajustarExistencias":
      exigir(s.rol === "admin");
      buscar(estado.productos, op.id, "Producto");
      return {
        productos: estado.productos.map((p) =>
          p.id === op.id ? { ...p, existencias: Math.max(0, p.existencias + Number(op.delta || 0)) } : p
        ),
      };

    case "actualizarProducto": {
      exigir(s.rol === "admin");
      buscar(estado.productos, op.id, "Producto");
      const c = { ...(op.cambios ?? {}) };
      if (c.nombre !== undefined) {
        c.nombre = String(c.nombre).trim();
        exigir(c.nombre.length > 0, "El producto necesita nombre.");
      }
      for (const k of ["existencias", "minimo", "costo", "precio_venta"] as const) {
        if (c[k] !== undefined) c[k] = Math.max(0, Number(c[k]) || 0);
      }
      return { productos: estado.productos.map((p) => (p.id === op.id ? { ...p, ...c, id: p.id } : p)) };
    }

    case "eliminarProducto":
      exigir(s.rol === "admin");
      buscar(estado.productos, op.id, "Producto");
      return { productos: estado.productos.filter((p) => p.id !== op.id) };

    case "agregarGasto":
      exigir(s.rol === "admin");
      idNuevo(estado.gastos, op.gasto.id);
      return { gastos: [op.gasto, ...estado.gastos] };

    case "eliminarGasto":
      exigir(s.rol === "admin");
      return { gastos: estado.gastos.filter((g) => g.id !== op.id) };

    case "registrarPaciente": {
      // El personal da de alta a cualquiera; un paciente sólo a sí mismo.
      exigir(esStaff(s) || (s.rol === "paciente" && op.paciente.id === s.id));
      const nuevo = !estado.pacientes.some((c) => c.id === op.paciente.id);
      if (nuevo && esStaff(s)) {
        exigir(puede(estado, s, "registrar_pacientes"), "No tienes permiso para dar de alta pacientes.");
      }
      const cambios: Partial<Estado> = {};
      if (nuevo) {
        idNuevo(estado.pacientes, op.paciente.id);
        const telefono = normalizarTelefono(op.paciente.telefono);
        if (telefono.length === 10 && estado.pacientes.some((c) => normalizarTelefono(c.telefono) === telefono)) {
          throw new ErrorOperacion("Ya hay un paciente con ese teléfono.", 409);
        }
        const paciente: Paciente = {
          id: op.paciente.id,
          nombre: String(op.paciente.nombre ?? "").trim().slice(0, 120),
          telefono: String(op.paciente.telefono ?? "").trim().slice(0, 30),
          email: String(op.paciente.email ?? "").trim().slice(0, 200),
          creado_en: op.paciente.creado_en || new Date().toISOString(),
          fecha_nacimiento: String(op.paciente.fecha_nacimiento ?? "").slice(0, 10),
          sexo: op.paciente.sexo === "F" || op.paciente.sexo === "M" ? op.paciente.sexo : "",
          tutor: String(op.paciente.tutor ?? "").slice(0, 120),
          alergias: String(op.paciente.alergias ?? "").slice(0, 300),
          tipo_sangre: String(op.paciente.tipo_sangre ?? "").slice(0, 5),
          antecedentes: String(op.paciente.antecedentes ?? "").slice(0, 500),
          ...(op.paciente.google && s.rol === "paciente" ? { google: true } : {}),
          // Lo pone el servidor, no el navegador: así nadie se adjudica pacientes ajenos.
          ...(esStaff(s) ? { registrado_por: s.id } : {}),
          ...(s.rol === "paciente"
            ? { cuenta_id: s.id }
            : s.rol === "admin" && op.paciente.cuenta_id
              ? { cuenta_id: String(op.paciente.cuenta_id) }
              : {}),
        };
        cambios.pacientes = [...estado.pacientes, paciente];
      }
      if (!estado.tarjetas.some((t) => t.paciente_id === op.paciente.id)) {
        idNuevo(estado.tarjetas, op.tarjetaId);
        const numero = estado.tarjetas.some((t) => t.numero === op.numeroTarjeta)
          ? numeroDeTarjeta(new Set(estado.tarjetas.map((t) => t.numero)))
          : op.numeroTarjeta;
        cambios.tarjetas = [
          ...estado.tarjetas,
          {
            id: op.tarjetaId,
            numero,
            paciente_id: op.paciente.id,
            emitida_en: op.paciente.creado_en,
            sellos_extra: 0,
            estado: "activa",
            wallet_guardada_en: null,
          },
        ];
      }
      return cambios;
    }

    case "actualizarPaciente": {
      exigir(esStaff(s));
      exigir(puede(estado, s, "editar_pacientes"), "No tienes permiso para editar pacientes.");
      const actual = buscar(estado.pacientes, op.id, "Paciente");
      const permitidos: Partial<Paciente> = {};
      if (typeof op.cambios.nombre === "string") permitidos.nombre = op.cambios.nombre.trim().slice(0, 120);
      for (const k of ["fecha_nacimiento", "tutor", "alergias", "tipo_sangre", "antecedentes"] as const) {
        if (typeof op.cambios[k] === "string") permitidos[k] = String(op.cambios[k]).trim().slice(0, 500);
      }
      if (op.cambios.sexo === "F" || op.cambios.sexo === "M" || op.cambios.sexo === "") permitidos.sexo = op.cambios.sexo;
      // Quien no ve el contacto tampoco lo puede pisar.
      if (veContactoDe(estado, s, actual)) {
        if (typeof op.cambios.telefono === "string") permitidos.telefono = op.cambios.telefono.trim().slice(0, 30);
        if (typeof op.cambios.email === "string") permitidos.email = op.cambios.email.trim().slice(0, 200);
      }
      const telefono = normalizarTelefono(permitidos.telefono ?? "");
      if (
        telefono.length === 10 &&
        estado.pacientes.some((c) => c.id !== op.id && normalizarTelefono(c.telefono) === telefono)
      ) {
        throw new ErrorOperacion("Ya hay otro paciente con ese teléfono.", 409);
      }
      const cambios: Partial<Estado> = {
        pacientes: estado.pacientes.map((c) => (c.id === op.id ? { ...c, ...permitidos, id: c.id } : c)),
      };
      // El nombre corregido también se ve en su agenda.
      const nombre = permitidos.nombre?.trim();
      if (nombre && nombre !== actual.nombre) {
        cambios.citas = estado.citas.map((c) => (c.paciente_id === op.id ? { ...c, paciente_nombre: nombre } : c));
      }
      return cambios;
    }

    case "ajustarSellos":
      exigir(esStaff(s));
      exigir(puede(estado, s, "ajustar_sellos"), "No tienes permiso para poner sellos.");
      buscar(estado.tarjetas, op.tarjetaId, "Tarjeta");
      return {
        tarjetas: estado.tarjetas.map((t) =>
          t.id === op.tarjetaId ? { ...t, sellos_extra: Math.max(0, t.sellos_extra + Number(op.delta || 0)) } : t
        ),
      };

    case "cambiarEstadoTarjeta":
      exigir(s.rol === "admin");
      buscar(estado.tarjetas, op.tarjetaId, "Tarjeta");
      return {
        tarjetas: estado.tarjetas.map((t) =>
          t.id === op.tarjetaId ? { ...t, estado: op.estado === "suspendida" ? "suspendida" : "activa" } : t
        ),
      };

    case "marcarWalletGuardada": {
      const tarjeta = buscar(estado.tarjetas, op.tarjetaId, "Tarjeta");
      exigir(esStaff(s) || tarjeta.paciente_id === s.id);
      return {
        tarjetas: estado.tarjetas.map((t) => (t.id === op.tarjetaId ? { ...t, wallet_guardada_en: op.fecha } : t)),
      };
    }

    case "vincularCuentaPaciente": {
      exigir(s.rol === "admin");
      buscar(estado.pacientes, op.pacienteId, "Paciente");
      return {
        pacientes: estado.pacientes.map((c) =>
          c.id === op.pacienteId
            ? {
                ...c,
                cuenta_id: op.cuentaId,
                ...(op.google ? { google: true } : {}),
                ...(op.email && !c.email ? { email: op.email } : {}),
              }
            : c
        ),
      };
    }

    case "agregarVacuna": {
      exigir(esStaff(s), "Sólo el personal registra vacunas.");
      buscar(estado.pacientes, op.vacuna.paciente_id, "Paciente");
      idNuevo(estado.vacunas, op.vacuna.id);
      const v: VacunaAplicada = {
        ...op.vacuna,
        vacuna: String(op.vacuna.vacuna).slice(0, 80),
        dosis: String(op.vacuna.dosis).slice(0, 40),
        lote: String(op.vacuna.lote ?? "").slice(0, 40),
      };
      // Descuenta una dosis del inventario si hay una vacuna con ese nombre.
      const clave = v.vacuna.toLowerCase().split(" ")[0];
      const prod = estado.productos.find((p) => p.categoria === "Vacuna" && p.existencias > 0 && p.nombre.toLowerCase().includes(clave));
      return {
        vacunas: [v, ...estado.vacunas],
        ...(prod ? { productos: estado.productos.map((p) => (p.id === prod.id ? { ...p, existencias: p.existencias - 1 } : p)) } : {}),
      };
    }

    case "eliminarVacuna":
      exigir(esStaff(s));
      return { vacunas: estado.vacunas.filter((v) => v.id !== op.id) };

    case "conectarGoogle": {
      exigir(s.rol === "admin" || (s.rol === "medico" && op.medicoId === s.id));
      buscar(estado.medicos, op.medicoId, "Médico");
      const email = String(op.email ?? "").trim().slice(0, 120);
      exigir(/.+@.+\..+/.test(email), "Cuenta de Google inválida.");
      const conexion: ConexionGoogle = {
        email,
        calendario: String(op.calendario || "Consultorio").slice(0, 60),
        conectado_en: new Date().toISOString(),
        ultimo_sync: null,
        auto: true,
      };
      const medicos = estado.medicos.map((m) => (m.id === op.medicoId ? { ...m, google: conexion } : m));
      return { medicos, ...(espejarGoogle({ ...estado, medicos }, true, op.medicoId) ?? {}) };
    }

    case "desconectarGoogle": {
      exigir(s.rol === "admin" || (s.rol === "medico" && op.medicoId === s.id));
      return {
        medicos: estado.medicos.map((m) => (m.id === op.medicoId ? { ...m, google: null } : m)),
        eventos_google: estado.eventos_google.filter((e) => e.medico_id !== op.medicoId || e.origen === "personal"),
      };
    }

    case "sincronizarGoogle": {
      exigir(s.rol === "admin" || (s.rol === "medico" && op.medicoId === s.id));
      const m = buscar(estado.medicos, op.medicoId, "Médico");
      exigir(m.google, "Primero conecta Google Calendar.");
      const base = espejarGoogle(estado, true, op.medicoId) ?? {};
      const ahora = new Date().toISOString();
      const medicos = (base.medicos ?? estado.medicos).map((x) =>
        x.id === m.id && x.google ? { ...x, google: { ...x.google, ultimo_sync: ahora } } : x
      );
      return { ...base, medicos };
    }

    case "ajustarGoogle":
      exigir(s.rol === "admin" || (s.rol === "medico" && op.medicoId === s.id));
      return {
        medicos: estado.medicos.map((m) => (m.id === op.medicoId && m.google ? { ...m, google: { ...m.google, auto: Boolean(op.auto) } } : m)),
      };

    case "agregarEventoGoogle": {
      exigir(s.rol === "admin" || (s.rol === "medico" && op.evento.medico_id === s.id));
      idNuevo(estado.eventos_google, op.evento.id);
      return { eventos_google: [...estado.eventos_google, { ...op.evento, origen: "personal", cita_id: null }] };
    }

    case "eliminarEventoGoogle": {
      const e = buscar(estado.eventos_google, op.id, "Evento");
      exigir(s.rol === "admin" || (s.rol === "medico" && e.medico_id === s.id));
      return { eventos_google: estado.eventos_google.filter((x) => x.id !== op.id) };
    }

    case "actualizarIntegraciones":
      exigir(s.rol === "admin");
      return { integraciones: { ...estado.integraciones, ...op.cambios } };

    case "marcarAvisosLeidos":
      return {
        avisos: estado.avisos.map((a) => (a.para === s.id || (s.rol === "admin" && a.para === "admin") ? { ...a, leido: true } : a)),
      };

    default:
      throw new ErrorOperacion("Operación desconocida.", 400);
  }
}

/**
 * Lo que cada quien puede ver. El personal ve todo; un paciente ve el catálogo
 * público, sus propios registros y, de las citas ajenas, sólo el hueco que
 * ocupan (para que el calendario de reservas no ofrezca horas tomadas).
 */
export function vistaPara(estado: Estado, s: Sesion | null): Estado {
  if (s?.rol === "admin") return estado;
  // Las comisiones sólo las ve el administrador.
  const servicios = estado.servicios.map((x) => ({ ...x, comision_pct: 0 }));
  const sinComision = (c: Cita): Cita => {
    const { comision_pct: _c, ...resto } = c;
    void _c;
    return resto;
  };
  if (s && esStaff(s)) {
    const p = permisosDe(estado.medicos.find((b) => b.id === s.id));
    const nombreVisible = (nombre: string) => (p.ver_nombres_pacientes ? nombre : iniciales(nombre));
    const citas = estado.citas.map((c) => {
      const base = sinComision(c);
      if (c.medico_id === s.id || p.ver_agenda_completa) return { ...base, paciente_nombre: nombreVisible(c.paciente_nombre) };
      // De la agenda ajena sólo se ve el hueco ocupado.
      return { ...base, paciente_id: "", paciente_nombre: "Ocupado", precio: 0, direccion_domicilio: null, notas: "" };
    });
    const pacientes = estado.pacientes.map((c) => {
      const { cuenta_id: _cuenta, ...resto } = c;
      void _cuenta;
      const visible = { ...resto, nombre: nombreVisible(c.nombre), cuenta: Boolean(c.cuenta_id) };
      return veContactoDe(estado, s, c) ? visible : { ...visible, telefono: "", email: "" };
    });
    const fichas = p.ver_nombres_pacientes
      ? estado.fichas
      : estado.fichas.map((f) => ({ ...f, paciente_nombre: iniciales(f.paciente_nombre) }));
    const avisos = estado.avisos.filter((a) => a.para === s.id);
    const eventos_google = estado.eventos_google.filter((e) => e.medico_id === s.id || e.ocupado);
    return { ...estado, servicios, citas, pacientes, fichas, avisos, eventos_google, gastos: [] };
  }

  const citas = estado.citas
    .filter((c) => citaActiva(c) || c.paciente_id === s?.id)
    .map((c) =>
      s && c.paciente_id === s.id
        ? c
        : {
            ...c,
            paciente_id: "",
            paciente_nombre: "",
            precio: 0,
            direccion_domicilio: null,
            estado_pago: "pendiente" as const,
          }
    );

  const propio = <T,>(lista: T[], clave: (x: T) => string) => (s ? lista.filter((x) => clave(x) === s.id) : []);

  return {
    ...estado,
    servicios,
    citas: citas.map(sinComision),
    // El paciente ve sus notas (diagnóstico, receta) pero no las notas internas.
    fichas: propio(estado.fichas, (f) => f.paciente_id).map((f) => ({ ...f, notas: "" })),
    vacunas: propio(estado.vacunas, (v) => v.paciente_id),
    eventos_google: estado.eventos_google.filter((e) => e.ocupado).map((e) => ({ ...e, titulo: "Ocupado" })),
    avisos: propio(estado.avisos, (a) => a.para),
    productos: [],
    medicos: estado.medicos.map((m) => ({ ...m, google: m.google ? { ...m.google, email: "" } : null, permisos: undefined })),
    gastos: [],
    pacientes: propio(estado.pacientes, (c) => c.id),
    tarjetas: propio(estado.tarjetas, (t) => t.paciente_id),
    canjes: s && estado.canjes[s.id] ? { [s.id]: estado.canjes[s.id] } : {},
  };
}

// ---------------------------------------------------------------------------
// Derivaciones de negocio
// ---------------------------------------------------------------------------

export type PacienteResumen = {
  id: string;
  nombre: string;
  /** Visitas reales: citas con la llegada confirmada (Asistió) */
  visitas: number;
  /** Veces que no se presentó */
  faltas: number;
  /** Lo que ha consumido: suma de sus citas atendidas */
  gastoTotal: number;
  /** De lo consumido, lo que ya pagó */
  pagado: number;
  ticketMedio: number;
  ultimaVisita: string | null;
  proximaCita: string | null;
  medicoPreferido: string;
  diasDesdeUltima: number | null;
  cadenciaDias: number | null;
  /** Riesgo de fuga: lleva más del doble de su cadencia habitual sin volver */
  enRiesgo: boolean;
};

const suma = (lista: Cita[], f: (c: Cita) => number = (c) => c.precio) => lista.reduce((a, c) => a + f(c), 0);

/**
 * Construye la ficha 360 de cada paciente a partir de las citas. Una visita es
 * una cita con la llegada confirmada (escaneo del QR o «Llegó»): en cuanto se
 * confirma, sube su número de visitas, su gasto y su médico de confianza.
 */
export function resumirPacientes(citas: Cita[]): PacienteResumen[] {
  const ahora = Date.now();
  const porPaciente = new Map<string, Cita[]>();

  for (const c of citas) {
    if (!c.paciente_id || c.estado === "cancelada" || c.paciente_eliminado) continue;
    const lista = porPaciente.get(c.paciente_id) ?? [];
    lista.push(c);
    porPaciente.set(c.paciente_id, lista);
  }

  const resumen: PacienteResumen[] = [];

  for (const [id, lista] of porPaciente) {
    const ordenadas = [...lista].sort((a, b) => a.inicio.localeCompare(b.inicio));
    const atendidas = ordenadas.filter((c) => c.estado === "asistida");
    const futuras = ordenadas.filter((c) => c.estado === "confirmada" && new Date(c.fin).getTime() > ahora);

    const gastoTotal = suma(atendidas);
    const pagado = suma(atendidas.filter((c) => c.estado_pago === "pagado"));

    // Médico preferido: el que más veces lo ha atendido.
    const conteo = new Map<string, number>();
    for (const c of atendidas) conteo.set(c.medico_nombre, (conteo.get(c.medico_nombre) ?? 0) + 1);
    const medicoPreferido = [...conteo.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    const ultima = atendidas.at(-1) ?? null;
    const diasDesdeUltima = ultima ? Math.floor((ahora - new Date(ultima.inicio).getTime()) / 86_400_000) : null;

    // Cadencia: media de días entre visitas consecutivas.
    let cadenciaDias: number | null = null;
    if (atendidas.length > 1) {
      let total = 0;
      for (let i = 1; i < atendidas.length; i++) {
        total += (new Date(atendidas[i].inicio).getTime() - new Date(atendidas[i - 1].inicio).getTime()) / 86_400_000;
      }
      cadenciaDias = Math.round(total / (atendidas.length - 1));
    }

    resumen.push({
      id,
      nombre: ordenadas.at(-1)!.paciente_nombre,
      visitas: atendidas.length,
      faltas: ordenadas.filter((c) => c.estado === "no_asistio").length,
      gastoTotal,
      pagado,
      ticketMedio: atendidas.length > 0 ? Math.round(gastoTotal / atendidas.length) : 0,
      ultimaVisita: ultima?.inicio ?? null,
      proximaCita: futuras[0]?.inicio ?? null,
      medicoPreferido,
      diasDesdeUltima,
      cadenciaDias,
      enRiesgo:
        futuras.length === 0 && cadenciaDias !== null && diasDesdeUltima !== null && diasDesdeUltima > cadenciaDias * 2,
    });
  }

  return resumen.sort((a, b) => b.gastoTotal - a.gastoTotal);
}

/** Números de una lista de citas: lo que todos los paneles muestran igual. */
export function resumirCitas(citas: Cita[]) {
  const ahora = Date.now();
  const atendidas = citas.filter((c) => c.estado === "asistida");
  const faltas = citas.filter((c) => c.estado === "no_asistio");
  const porVenir = citas.filter((c) => c.estado === "confirmada");
  const cobradas = citas.filter((c) => citaActiva(c) && c.estado_pago === "pagado");
  const porCobrar = atendidas.filter((c) => c.estado_pago === "pendiente");
  // Asistencia: de las citas cuya hora ya pasó, cuántas llegaron.
  const vencidas = citas.filter(
    (c) => c.estado === "asistida" || c.estado === "no_asistio" || (c.estado === "confirmada" && new Date(c.fin).getTime() < ahora)
  );
  const ingresos = suma(atendidas);
  const comisiones = Math.round(suma(atendidas, (c) => (c.precio * (c.comision_pct ?? 0)) / 100));
  return {
    /** Parte del médico sobre lo atendido (sólo tiene datos para el administrador) */
    comisiones,
    total: citas.filter((c) => c.estado !== "cancelada").length,
    atendidas: atendidas.length,
    faltas: faltas.length,
    porVenir: porVenir.length,
    canceladas: citas.filter((c) => c.estado === "cancelada").length,
    /** Valor de los servicios realizados */
    ingresos,
    cobrado: suma(cobradas),
    porCobrar: suma(porCobrar),
    porCobrarCitas: porCobrar.length,
    /** Lo que suman las citas agendadas que aún no llegan */
    agendado: suma(porVenir),
    ticketMedio: atendidas.length > 0 ? ingresos / atendidas.length : 0,
    asistencia: vencidas.length > 0 ? atendidas.length / vencidas.length : 0,
    pacientes: new Set(atendidas.map((c) => c.paciente_id).filter(Boolean)).size,
  };
}

export type MedicoResumen = ReturnType<typeof resumirCitas> & { id: string; nombre: string; activo: boolean };

/** Desempeño de cada médico: atendidas, pacientes, ingresos y faltas. */
export function resumirMedicos(citas: Cita[], medicos: Pick<Medico, "id" | "nombre" | "activo">[]): MedicoResumen[] {
  return medicos.map((b) => ({
    id: b.id,
    nombre: b.nombre,
    activo: b.activo,
    ...resumirCitas(citas.filter((c) => c.medico_id === b.id)),
  }));
}

// Lealtad: 1 sello por cita asistida más los sellos puestos a mano en la
// tarjeta; cada N sellos (config de la clínica, 5 por defecto) se gana una
// recompensa.
export function calcularLealtad(
  citas: Cita[],
  pacienteId: string,
  citasRequeridas = 5,
  sellosExtra = 0
) {
  const requerido = citasRequeridas > 0 ? citasRequeridas : 5;
  const puntos =
    citas.filter((c) => c.paciente_id === pacienteId && c.estado === "asistida").length +
    Math.max(0, sellosExtra);
  return {
    puntos,
    progreso: puntos % requerido,
    recompensasGanadas: Math.floor(puntos / requerido),
    faltan: requerido - (puntos % requerido),
    requerido,
  };
}
