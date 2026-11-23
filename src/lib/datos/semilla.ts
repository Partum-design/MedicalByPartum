// ============================================================================
// Datos de ejemplo de la demo.
//
// No hay base de datos conectada: este archivo genera una clínica completa
// (médicos, catálogo, pacientes, dos meses de citas, expedientes, cartillas de
// vacunación, inventario y gastos) con un generador pseudoaleatorio con semilla
// fija. Así el servidor (/api/datos) y el navegador producen exactamente los
// mismos datos, y las fechas siempre quedan alrededor de "hoy".
// ============================================================================

import { enZona, instante } from "@/lib/datos/disponibilidad";
import {
  ESQUEMA_VACUNACION,
  INTEGRACIONES_POR_DEFECTO,
  type Aviso,
  type Cita,
  type ClinicaConfig,
  type DiaSemana,
  type Estado,
  type EventoGoogle,
  type Ficha,
  type Gasto,
  type HorarioSemanal,
  type Medico,
  type Paciente,
  type Producto,
  type Servicio,
  type TarjetaLealtad,
  type VacunaAplicada,
} from "@/lib/datos/modelo";

/** Versión de la semilla: al cambiarla, los navegadores regeneran su copia. */
export const VERSION_SEMILLA = 5;

function generador(semilla: number) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const horario = (dias: Partial<Record<DiaSemana, [string, string]>>): HorarioSemanal => {
  const todos: DiaSemana[] = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];
  return Object.fromEntries(
    todos.map((d) => [d, dias[d] ? { activo: true, inicio: dias[d]![0], fin: dias[d]![1] } : { activo: false, inicio: "09:00", fin: "14:00" }])
  ) as HorarioSemanal;
};

export const CLINICA_DEMO: ClinicaConfig = {
  nombre: "Clínica Vitalia",
  eslogan: "Cuidamos a tu familia en cada etapa",
  descripcion:
    "Somos una clínica familiar con pediatría, medicina general, ginecología, nutrición y un módulo de vacunación con red de frío certificada. Agenda en línea en menos de un minuto, recordatorios por WhatsApp y tu expediente siempre a la mano.",
  direccion: "Av. Insurgentes Sur 1458, piso 3, Col. Actipan, Benito Juárez, CDMX",
  mapa_url: "https://maps.google.com/?q=Av.+Insurgentes+Sur+1458+CDMX",
  telefono: "55 4170 2290",
  whatsapp: "55 4170 2290",
  email: "hola@clinicavitalia.mx",
  instagram: "clinicavitalia",
  facebook: "clinicavitalia",
  tiktok: "",
  anio_fundacion: "2016",
  horario: horario({
    lun: ["08:00", "20:00"],
    mar: ["08:00", "20:00"],
    mie: ["08:00", "20:00"],
    jue: ["08:00", "20:00"],
    vie: ["08:00", "20:00"],
    sab: ["09:00", "15:00"],
  }),
};

const MEDICOS: Medico[] = [
  {
    id: "med-mariana",
    nombre: "Dra. Mariana Torres",
    especialidad: "Pediatría",
    cedula: "8456213",
    color: "#009D9D",
    experiencia: 12,
    duracion_cita_min: 30,
    acepta_domicilio: true,
    telemedicina: true,
    biografia: "Pediatra certificada por el Consejo Mexicano de Pediatría. Niño sano, crecimiento y desarrollo, lactancia.",
    activo: true,
  },
  {
    id: "med-alejandro",
    nombre: "Dr. Alejandro Ruiz",
    especialidad: "Medicina general",
    cedula: "6721984",
    color: "#2C506D",
    experiencia: 9,
    duracion_cita_min: 30,
    acepta_domicilio: true,
    telemedicina: true,
    biografia: "Médico general con enfoque en medicina preventiva, chequeos anuales y control de enfermedades crónicas.",
    activo: true,
  },
  {
    id: "med-sofia",
    nombre: "Dra. Sofía Hernández",
    especialidad: "Ginecología y obstetricia",
    cedula: "7390442",
    color: "#7C5CFA",
    experiencia: 15,
    duracion_cita_min: 40,
    acepta_domicilio: false,
    telemedicina: true,
    biografia: "Ginecóloga y obstetra. Control prenatal, salud de la mujer, planificación familiar y colposcopía.",
    activo: true,
  },
  {
    id: "med-daniel",
    nombre: "Dr. Daniel Ortega",
    especialidad: "Nutriología clínica",
    cedula: "9012375",
    color: "#F08A4B",
    experiencia: 7,
    duracion_cita_min: 45,
    acepta_domicilio: false,
    telemedicina: true,
    biografia: "Nutriólogo clínico. Nutrición pediátrica, control de peso, diabetes y planes de alimentación familiares.",
    activo: true,
  },
  {
    id: "med-valeria",
    nombre: "Enf. Valeria Méndez",
    especialidad: "Enfermería y vacunación",
    cedula: "10234567",
    color: "#55C99A",
    experiencia: 10,
    duracion_cita_min: 15,
    acepta_domicilio: true,
    telemedicina: false,
    biografia: "Licenciada en enfermería. Responsable del módulo de vacunación, red de frío y toma de muestras.",
    activo: true,
    permisos: { ver_agenda_completa: true },
  },
];

const HORARIOS: Record<string, HorarioSemanal> = {
  "med-mariana": horario({ lun: ["09:00", "17:00"], mar: ["09:00", "17:00"], mie: ["09:00", "17:00"], jue: ["09:00", "17:00"], vie: ["09:00", "15:00"], sab: ["09:00", "13:00"] }),
  "med-alejandro": horario({ lun: ["08:00", "16:00"], mar: ["08:00", "16:00"], mie: ["12:00", "20:00"], jue: ["08:00", "16:00"], vie: ["08:00", "16:00"] }),
  "med-sofia": horario({ lun: ["10:00", "18:00"], mie: ["10:00", "18:00"], jue: ["10:00", "18:00"], vie: ["10:00", "16:00"] }),
  "med-daniel": horario({ mar: ["11:00", "19:00"], jue: ["11:00", "19:00"], sab: ["09:00", "14:00"] }),
  "med-valeria": horario({ lun: ["08:00", "15:00"], mar: ["08:00", "15:00"], mie: ["08:00", "15:00"], jue: ["08:00", "15:00"], vie: ["08:00", "15:00"], sab: ["09:00", "14:00"] }),
};

const sv = (
  id: string,
  nombre: string,
  categoria: Servicio["categoria"],
  precio: number,
  duracion_min: number,
  medicos: string[],
  descripcion: string,
  extra: Partial<Servicio> = {}
): Servicio => ({ id, nombre, categoria, precio, duracion_min, medicos, descripcion, comision_pct: 40, activo: true, ...extra });

const SERVICIOS: Servicio[] = [
  sv("srv-revision-ped", "Revisión pediátrica (niño sano)", "Pediatría", 650, 30, ["med-mariana"], "Peso, talla, perímetro cefálico, desarrollo y orientación a padres."),
  sv("srv-recien-nacido", "Control del recién nacido", "Pediatría", 750, 30, ["med-mariana"], "Primera revisión, ictericia, lactancia y tamiz."),
  sv("srv-desarrollo", "Valoración de crecimiento y desarrollo", "Pediatría", 700, 30, ["med-mariana"], "Curvas de la OMS, hitos del desarrollo y alimentación complementaria."),
  sv("srv-vacuna-1anio", "Vacuna de primer año", "Vacunación", 1450, 15, ["med-valeria", "med-mariana"], "SRP, varicela, hepatitis A y refuerzo de neumococo según cartilla."),
  sv("srv-hexavalente", "Vacuna hexavalente", "Vacunación", 1250, 15, ["med-valeria"], "Difteria, tos ferina, tétanos, polio, Hib y hepatitis B."),
  sv("srv-influenza", "Vacuna contra influenza", "Vacunación", 380, 15, ["med-valeria"], "Temporada 2026–2027, niños desde 6 meses y adultos."),
  sv("srv-neumococo", "Vacuna neumocócica conjugada", "Vacunación", 1100, 15, ["med-valeria"], "Esquema de 2, 4 y 12 meses."),
  sv("srv-rotavirus", "Vacuna contra rotavirus", "Vacunación", 950, 15, ["med-valeria"], "Vía oral, 2 y 4 meses."),
  sv("srv-general", "Consulta de medicina general", "Consulta", 550, 30, ["med-alejandro"], "Valoración completa, diagnóstico y receta."),
  sv("srv-seguimiento", "Consulta de seguimiento", "Consulta", 400, 30, ["med-alejandro", "med-mariana"], "Revisión de evolución y resultados dentro de los 15 días."),
  sv("srv-chequeo", "Chequeo anual preventivo", "Paquete", 1900, 60, ["med-alejandro"], "Consulta, electrocardiograma y orden de laboratorios básicos."),
  sv("srv-gineco", "Consulta ginecológica", "Especialidad", 900, 40, ["med-sofia"], "Exploración, Papanicolaou y orientación anticonceptiva."),
  sv("srv-prenatal", "Control prenatal", "Especialidad", 950, 40, ["med-sofia"], "Seguimiento del embarazo con ultrasonido básico."),
  sv("srv-nutricion", "Consulta de nutrición", "Especialidad", 700, 45, ["med-daniel"], "Composición corporal y plan de alimentación personalizado."),
  sv("srv-nutri-ped", "Nutrición pediátrica", "Especialidad", 750, 45, ["med-daniel"], "Alimentación complementaria, selectividad y control de peso infantil."),
  sv("srv-ecg", "Electrocardiograma", "Estudios", 650, 30, ["med-alejandro"], "Trazo de 12 derivaciones con interpretación."),
  sv("srv-laboratorio", "Toma de muestras de laboratorio", "Estudios", 250, 15, ["med-valeria"], "Biometría, química sanguínea y más; resultados en tu cuenta."),
  sv("srv-teleconsulta", "Teleconsulta", "Telemedicina", 450, 30, ["med-alejandro", "med-mariana", "med-daniel", "med-sofia"], "Consulta por videollamada con receta digital."),
];

const NOMBRES_F = ["Fernanda", "Carolina", "Valentina", "Regina", "Camila", "Ximena", "Daniela", "Andrea", "Paola", "Renata", "Gabriela", "Mariana", "Natalia", "Isabel", "Sofía"];
const NOMBRES_M = ["Santiago", "Julián", "Emiliano", "Diego", "Leonardo", "Sebastián", "Iker", "Jorge", "Ricardo", "Luis", "Andrés", "Carlos", "Rodrigo", "Pablo", "Tomás"];
const APELLIDOS = ["Ramírez", "García", "López", "Martínez", "Hernández", "González", "Pérez", "Sánchez", "Flores", "Rivera", "Morales", "Jiménez", "Vargas", "Castillo", "Romero", "Aguilar", "Navarro", "Domínguez"];
const ALERGIAS = ["", "", "", "Penicilina", "", "Polen", "", "Mariscos", "", "Ninguna conocida"];
const SANGRE = ["O+", "O+", "A+", "B+", "O-", "A-", "AB+"];

const TELEFONOS = [
  "5541726630", "5532198874", "5561043387", "5527745519", "5578320946", "5512864403", "5539902168", "5586473125",
  "5547291836", "5523658791", "5590147258", "5568421937", "5514785296", "5576932418", "5531849672", "5542718395",
  "5529386147", "5583917264", "5517462938", "5564829173", "5538271946", "5571936284", "5548162739", "5526391847",
  "5582749163", "5519374826", "5567291483", "5535817264",
];

/** Cuentas de demostración para el acceso local. */
export const PACIENTE_DEMO_ADULTO = "pac-lucia";
export const PACIENTE_DEMO_BEBE = "pac-mateo";

function fechaNacimiento(ahora: number, meses: number) {
  const d = new Date(ahora - meses * 30.44 * 86_400_000);
  return d.toISOString().slice(0, 10);
}

export function crearSemilla(ahora = Date.now()): Estado {
  const rnd = generador(20261123);
  const elegir = <T,>(lista: T[]) => lista[Math.floor(rnd() * lista.length)];

  // --- Pacientes -------------------------------------------------------------
  const pacientes: Paciente[] = [];
  const creado = new Date(ahora - 200 * 86_400_000).toISOString();
  pacientes.push({
    id: PACIENTE_DEMO_ADULTO,
    nombre: "Lucía Ramírez",
    telefono: "5541726630",
    email: "lucia.ramirez@ejemplo.mx",
    creado_en: creado,
    fecha_nacimiento: "1993-04-18",
    sexo: "F",
    alergias: "Penicilina",
    tipo_sangre: "O+",
    antecedentes: "Cesárea 2025. Sin enfermedades crónicas.",
    cuenta_id: PACIENTE_DEMO_ADULTO,
    google: true,
  });
  pacientes.push({
    id: PACIENTE_DEMO_BEBE,
    nombre: "Mateo Ramírez",
    telefono: "5541726631",
    email: "",
    creado_en: creado,
    fecha_nacimiento: fechaNacimiento(ahora, 11.6),
    sexo: "M",
    tutor: "Lucía Ramírez (madre)",
    alergias: "",
    tipo_sangre: "O+",
    antecedentes: "Nacido a término, 3.2 kg. Lactancia mixta.",
    cuenta_id: PACIENTE_DEMO_BEBE,
  });
  for (let i = 0; i < 26; i++) {
    const mujer = rnd() < 0.55;
    const nombre = `${elegir(mujer ? NOMBRES_F : NOMBRES_M)} ${elegir(APELLIDOS)} ${elegir(APELLIDOS)}`;
    const pediatrico = i < 11;
    const meses = pediatrico ? Math.floor(1 + rnd() * 90) : Math.floor(18 * 12 + rnd() * 50 * 12);
    pacientes.push({
      id: `pac-${String(i + 1).padStart(3, "0")}`,
      nombre,
      telefono: TELEFONOS[i + 1] ?? `55${String(10000000 + i * 7919).slice(0, 8)}`,
      email: pediatrico ? "" : `${nombre.split(" ")[0].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}.${i + 1}@ejemplo.mx`,
      creado_en: new Date(ahora - (i < 4 ? 3 + i * 6 : 45 + rnd() * 300) * 86_400_000).toISOString(),
      fecha_nacimiento: fechaNacimiento(ahora, meses),
      sexo: mujer ? "F" : "M",
      tutor: pediatrico ? `${elegir(NOMBRES_F)} ${nombre.split(" ")[1]} (madre)` : "",
      alergias: elegir(ALERGIAS),
      tipo_sangre: elegir(SANGRE),
      antecedentes: "",
      registrado_por: "admin",
    });
  }
  const edadMeses = (p: Paciente) =>
    p.fecha_nacimiento ? (ahora - new Date(p.fecha_nacimiento).getTime()) / (30.44 * 86_400_000) : 360;
  const esDemo = (p: Paciente) => p.id === PACIENTE_DEMO_ADULTO || p.id === PACIENTE_DEMO_BEBE;
  const ninos = pacientes.filter((p) => edadMeses(p) < 15 * 12);
  const adultos = pacientes.filter((p) => edadMeses(p) >= 15 * 12 && !esDemo(p));
  const ninosAzar = ninos.filter((p) => !esDemo(p));
  const mujeres = adultos.filter((p) => p.sexo === "F");

  const serviciosDe = (medicoId: string) => SERVICIOS.filter((s) => s.medicos?.includes(medicoId) && s.categoria !== "Telemedicina");
  const pacientesPara = (medicoId: string) =>
    medicoId === "med-mariana" ? ninosAzar : medicoId === "med-sofia" ? mujeres : medicoId === "med-valeria" ? [...ninosAzar, ...ninosAzar, ...adultos] : medicoId === "med-daniel" ? [...adultos, ...ninosAzar] : adultos;

  // --- Citas ------------------------------------------------------------------
  const citas: Cita[] = [];
  let n = 0;
  const hoy = enZona(ahora);
  const inicioHoy = instante(hoy.anio, hoy.mes, hoy.dia, 0);
  for (let d = -62; d <= 16; d++) {
    const t = inicioHoy + d * 86_400_000 + 12 * 3_600_000;
    const z = enZona(t);
    for (const m of MEDICOS) {
      const bloque = HORARIOS[m.id][z.diaSemana];
      if (!bloque.activo) continue;
      const [ha, ma] = bloque.inicio.split(":").map(Number);
      const [hb, mb] = bloque.fin.split(":").map(Number);
      const desde = ha * 60 + ma;
      const hasta = hb * 60 + mb;
      // Futuro con menos ocupación: deja huecos para probar la reserva.
      const ocupacion = d < 0 ? 0.42 : d === 0 ? 0.5 : Math.max(0.12, 0.38 - d * 0.02);
      let minuto = desde;
      while (minuto < hasta) {
        const servicio = elegir(serviciosDe(m.id));
        const dur = servicio.duracion_min;
        if (minuto + dur > hasta) break;
        if (rnd() < ocupacion) {
          const inicio = instante(z.anio, z.mes, z.dia, minuto);
          const fin = inicio + dur * 60_000;
          const paciente = elegir(pacientesPara(m.id));
          let estado: Cita["estado"] = "confirmada";
          let pago: Cita["estado_pago"] = "pendiente";
          if (fin < ahora) {
            const r = rnd();
            estado = r < 0.84 ? "asistida" : r < 0.92 ? "no_asistio" : "cancelada";
            pago = estado === "asistida" && rnd() < 0.96 ? "pagado" : "pendiente";
          } else if (rnd() < 0.04) {
            estado = "cancelada";
          }
          const telemed = m.telemedicina && rnd() < 0.12;
          const domicilio = !telemed && m.acepta_domicilio && rnd() < 0.05;
          n++;
          const id = `c-${String(n).padStart(5, "0")}`;
          citas.push({
            id,
            paciente_id: paciente.id,
            paciente_nombre: paciente.nombre,
            medico_id: m.id,
            medico_nombre: m.nombre,
            especialidad: m.especialidad,
            inicio: new Date(inicio).toISOString(),
            fin: new Date(fin).toISOString(),
            modalidad: telemed ? "telemedicina" : domicilio ? "domicilio" : "presencial",
            enlace_video: telemed ? `https://meet.google.com/vit-${id.slice(2)}-mos` : null,
            estado,
            precio: servicio.precio,
            direccion_domicilio: domicilio ? "Calle Pilares 120, Col. del Valle" : null,
            metodo_pago: rnd() < 0.55 ? "tarjeta" : "efectivo",
            estado_pago: pago,
            llegada_en: estado === "asistida" ? new Date(inicio - 6 * 60_000).toISOString() : null,
            creada_por: rnd() < 0.62 ? "paciente" : "personal",
            servicio_id: servicio.id,
            servicio_nombre: servicio.nombre,
            comision_pct: servicio.comision_pct,
            motivo: "",
            notas: "",
          });
        }
        minuto += dur;
      }
    }
  }

  // Historia de la familia demo: así su cuenta tiene qué mostrar.
  const historia: [string, string, string, number, number, Cita["estado"]][] = [
    [PACIENTE_DEMO_BEBE, "med-mariana", "srv-revision-ped", -58, 10 * 60, "asistida"],
    [PACIENTE_DEMO_BEBE, "med-valeria", "srv-hexavalente", -58, 11 * 60, "asistida"],
    [PACIENTE_DEMO_BEBE, "med-mariana", "srv-desarrollo", -24, 9 * 60 + 30, "asistida"],
    [PACIENTE_DEMO_BEBE, "med-valeria", "srv-vacuna-1anio", 3, 10 * 60 + 15, "confirmada"],
    [PACIENTE_DEMO_BEBE, "med-mariana", "srv-revision-ped", 3, 11 * 60, "confirmada"],
    [PACIENTE_DEMO_ADULTO, "med-sofia", "srv-gineco", -40, 12 * 60, "asistida"],
    [PACIENTE_DEMO_ADULTO, "med-daniel", "srv-nutricion", -12, 12 * 60, "asistida"],
    [PACIENTE_DEMO_ADULTO, "med-alejandro", "srv-chequeo", 6, 9 * 60, "confirmada"],
  ];
  for (const [pid, mid, sid, dia, min, estado] of historia) {
    const z = enZona(inicioHoy + dia * 86_400_000 + 12 * 3_600_000);
    let fecha = { ...z };
    // Si el día cae en descanso del médico, se recorre al siguiente hábil.
    for (let k = 0; k < 7 && !HORARIOS[mid][fecha.diaSemana].activo; k++) {
      fecha = enZona(instante(fecha.anio, fecha.mes, fecha.dia, 12 * 60) + 86_400_000);
    }
    const servicio = SERVICIOS.find((s) => s.id === sid)!;
    const m = MEDICOS.find((x) => x.id === mid)!;
    const p = pacientes.find((x) => x.id === pid)!;
    const bloque = HORARIOS[mid][fecha.diaSemana];
    const minuto = Math.max(min, Number(bloque.inicio.slice(0, 2)) * 60);
    const inicio = instante(fecha.anio, fecha.mes, fecha.dia, minuto);
    const fin = inicio + servicio.duracion_min * 60_000;
    // Quita lo que se encime en la agenda del médico.
    for (let i = citas.length - 1; i >= 0; i--) {
      const c = citas[i];
      if (c.medico_id === mid && inicio < new Date(c.fin).getTime() && fin > new Date(c.inicio).getTime()) citas.splice(i, 1);
    }
    n++;
    citas.push({
      id: `c-${String(n).padStart(5, "0")}`,
      paciente_id: p.id,
      paciente_nombre: p.nombre,
      medico_id: m.id,
      medico_nombre: m.nombre,
      especialidad: m.especialidad,
      inicio: new Date(inicio).toISOString(),
      fin: new Date(fin).toISOString(),
      modalidad: "presencial",
      estado,
      precio: servicio.precio,
      direccion_domicilio: null,
      metodo_pago: "tarjeta",
      estado_pago: estado === "asistida" ? "pagado" : "pendiente",
      llegada_en: estado === "asistida" ? new Date(inicio - 5 * 60_000).toISOString() : null,
      creada_por: "paciente",
      servicio_id: servicio.id,
      servicio_nombre: servicio.nombre,
      comision_pct: servicio.comision_pct,
      motivo: sid === "srv-vacuna-1anio" ? "Le tocan sus vacunas del año." : "",
      notas: "",
    });
  }
  citas.sort((a, b) => a.inicio.localeCompare(b.inicio));

  // --- Expedientes -----------------------------------------------------------
  const DIAGNOSTICOS: Record<string, { motivo: string; dx: string; tx: string; receta: string }[]> = {
    Pediatría: [
      { motivo: "Revisión de rutina", dx: "Niño sano. Crecimiento en percentil 50.", tx: "Continuar alimentación complementaria. Próxima revisión en 2 meses.", receta: "Vitamina D 400 UI, 1 gota al día." },
      { motivo: "Fiebre de 38.5 °C y tos", dx: "Infección de vías respiratorias altas.", tx: "Hidratación, lavados nasales, vigilar datos de alarma.", receta: "Paracetamol 15 mg/kg cada 6 h si hay fiebre." },
      { motivo: "Evacuaciones disminuidas en consistencia", dx: "Gastroenteritis aguda sin deshidratación.", tx: "Vida Suero Oral a libre demanda.", receta: "Suero oral 50 ml por evacuación." },
    ],
    "Medicina general": [
      { motivo: "Dolor de garganta", dx: "Faringitis viral.", tx: "Reposo relativo, líquidos.", receta: "Ibuprofeno 400 mg cada 8 h por 3 días." },
      { motivo: "Control de presión arterial", dx: "Hipertensión arterial controlada.", tx: "Continuar tratamiento, dieta baja en sodio.", receta: "Losartán 50 mg cada 24 h." },
      { motivo: "Chequeo preventivo", dx: "Sin hallazgos patológicos.", tx: "Laboratorios de control anual.", receta: "" },
    ],
    "Ginecología y obstetricia": [
      { motivo: "Revisión anual", dx: "Exploración ginecológica normal. Papanicolaou tomado.", tx: "Resultado en 10 días.", receta: "" },
      { motivo: "Control prenatal, 24 SDG", dx: "Embarazo normoevolutivo.", tx: "Ultrasonido estructural en 2 semanas.", receta: "Ácido fólico 5 mg y hierro 60 mg diario." },
    ],
    "Nutriología clínica": [
      { motivo: "Control de peso", dx: "Sobrepeso grado I. IMC 27.4.", tx: "Plan de alimentación de 1,800 kcal.", receta: "Plan semanal enviado por correo." },
      { motivo: "Selectividad alimentaria (pediátrico)", dx: "Selectividad leve sin compromiso nutricional.", tx: "Exposición repetida, menú familiar.", receta: "" },
    ],
    "Enfermería y vacunación": [
      { motivo: "Aplicación de vacuna", dx: "Vacuna aplicada sin incidentes.", tx: "Observación 20 minutos. Compresas frías si hay dolor.", receta: "Paracetamol si presenta fiebre." },
    ],
  };
  const fichas: Ficha[] = [];
  let nf = 0;
  for (const c of citas) {
    if (c.estado !== "asistida") continue;
    const reciente = ahora - new Date(c.inicio).getTime() < 45 * 86_400_000;
    const demo = c.paciente_id === PACIENTE_DEMO_ADULTO || c.paciente_id === PACIENTE_DEMO_BEBE;
    if (!demo && (!reciente || rnd() > 0.55)) continue;
    const p = pacientes.find((x) => x.id === c.paciente_id);
    const adulto = p ? edadMeses(p) >= 15 * 12 : true;
    const opciones = (DIAGNOSTICOS[c.especialidad] ?? DIAGNOSTICOS["Medicina general"]).filter((d) => !adulto || !d.motivo.includes("pediátrico"));
    const plantilla = elegir(opciones.length ? opciones : DIAGNOSTICOS["Medicina general"]);
    const nino = p ? edadMeses(p) < 15 * 12 : false;
    const meses = p?.fecha_nacimiento ? (new Date(c.inicio).getTime() - new Date(p.fecha_nacimiento).getTime()) / (30.44 * 86_400_000) : 300;
    nf++;
    fichas.push({
      id: `fx-${String(nf).padStart(4, "0")}`,
      paciente_id: c.paciente_id,
      paciente_nombre: c.paciente_nombre,
      medico_id: c.medico_id,
      medico_nombre: c.medico_nombre,
      cita_id: c.id,
      servicio: c.servicio_nombre ?? "",
      motivo: plantilla.motivo,
      exploracion: "Consciente, hidratado, buena coloración. Ruidos cardiacos rítmicos, campos pulmonares limpios.",
      diagnostico: plantilla.dx,
      tratamiento: plantilla.tx,
      receta: plantilla.receta,
      signos: nino
        ? {
            peso_kg: Math.round((3.4 + Math.min(meses, 24) * 0.42 + Math.max(0, meses - 24) * 0.17) * 10) / 10,
            talla_cm: Math.round(50 + Math.min(meses, 24) * 1.5 + Math.max(0, meses - 24) * 0.55),
            temperatura_c: 36.4 + Math.round(rnd() * 8) / 10,
            frecuencia_cardiaca: 100 + Math.round(rnd() * 25),
            saturacion: 97 + Math.round(rnd() * 2),
            perimetro_cefalico_cm: meses < 36 ? Math.round((35 + Math.min(meses, 24) * 0.45) * 10) / 10 : null,
          }
        : {
            peso_kg: Math.round((55 + rnd() * 35) * 10) / 10,
            talla_cm: Math.round(152 + rnd() * 30),
            temperatura_c: 36.3 + Math.round(rnd() * 6) / 10,
            presion: `${110 + Math.round(rnd() * 25)}/${70 + Math.round(rnd() * 15)}`,
            frecuencia_cardiaca: 64 + Math.round(rnd() * 20),
            saturacion: 96 + Math.round(rnd() * 3),
          },
      notas: rnd() < 0.3 ? "Paciente refiere buena adherencia al tratamiento." : "",
      creado_en: c.fin,
    });
  }
  fichas.sort((a, b) => b.creado_en.localeCompare(a.creado_en));

  // --- Cartillas de vacunación ----------------------------------------------
  const vacunas: VacunaAplicada[] = [];
  let nv = 0;
  for (const p of ninos) {
    const meses = edadMeses(p);
    for (const v of ESQUEMA_VACUNACION) {
      if (v.meses > meses) continue;
      // Mateo tiene todo al corriente hasta los 6 meses: le falta el primer año.
      if (p.id !== PACIENTE_DEMO_BEBE && rnd() < 0.08) continue;
      nv++;
      const nacimiento = new Date(p.fecha_nacimiento!).getTime();
      vacunas.push({
        id: `vac-${String(nv).padStart(4, "0")}`,
        paciente_id: p.id,
        vacuna: v.vacuna,
        dosis: v.dosis,
        fecha: new Date(nacimiento + (v.meses * 30.44 + 3) * 86_400_000).toISOString(),
        lote: `L${String(Math.floor(rnd() * 90000) + 10000)}`,
        aplicada_por: "Enf. Valeria Méndez",
      });
    }
  }

  // --- Inventario -----------------------------------------------------------
  const cad = (dias: number) => new Date(ahora + dias * 86_400_000).toISOString().slice(0, 10);
  const productos: Producto[] = [
    { id: "prd-hexa", nombre: "Hexavalente acelular (jeringa prellenada)", categoria: "Vacuna", existencias: 18, minimo: 10, costo: 720, precio_venta: 1250, unidad: "dosis", lote: "HX24-0913", caducidad: cad(210) },
    { id: "prd-srp", nombre: "SRP triple viral", categoria: "Vacuna", existencias: 6, minimo: 8, costo: 410, precio_venta: 690, unidad: "dosis", lote: "SR25-0233", caducidad: cad(140) },
    { id: "prd-varicela", nombre: "Varicela atenuada", categoria: "Vacuna", existencias: 9, minimo: 6, costo: 560, precio_venta: 950, unidad: "dosis", lote: "VZ25-1108", caducidad: cad(25) },
    { id: "prd-hepa", nombre: "Hepatitis A pediátrica", categoria: "Vacuna", existencias: 11, minimo: 6, costo: 390, precio_venta: 680, unidad: "dosis", lote: "HA25-0471", caducidad: cad(320) },
    { id: "prd-neumo", nombre: "Neumocócica conjugada 13v", categoria: "Vacuna", existencias: 14, minimo: 8, costo: 640, precio_venta: 1100, unidad: "dosis", lote: "PN25-0388", caducidad: cad(180) },
    { id: "prd-influenza", nombre: "Influenza tetravalente 2026–27", categoria: "Vacuna", existencias: 42, minimo: 20, costo: 190, precio_venta: 380, unidad: "dosis", lote: "FL26-1002", caducidad: cad(150) },
    { id: "prd-rota", nombre: "Rotavirus oral", categoria: "Vacuna", existencias: 4, minimo: 6, costo: 520, precio_venta: 950, unidad: "dosis", lote: "RT25-0712", caducidad: cad(95) },
    { id: "prd-paracetamol", nombre: "Paracetamol suspensión 160 mg/5 ml", categoria: "Medicamento", existencias: 24, minimo: 10, costo: 38, precio_venta: 75, unidad: "frasco", lote: "PC2611", caducidad: cad(400) },
    { id: "prd-suero", nombre: "Vida Suero Oral 500 ml", categoria: "Medicamento", existencias: 30, minimo: 15, costo: 14, precio_venta: 30, unidad: "sobre", lote: "VS2608", caducidad: cad(500) },
    { id: "prd-vitd", nombre: "Vitamina D gotas 400 UI", categoria: "Medicamento", existencias: 7, minimo: 8, costo: 120, precio_venta: 210, unidad: "frasco", lote: "VD2605", caducidad: cad(260) },
    { id: "prd-jeringas", nombre: "Jeringa 3 ml con aguja 23G", categoria: "Material de curación", existencias: 340, minimo: 200, costo: 2.4, precio_venta: 0, unidad: "pieza", lote: "", caducidad: cad(900) },
    { id: "prd-gasas", nombre: "Gasas estériles 10×10", categoria: "Material de curación", existencias: 85, minimo: 100, costo: 1.2, precio_venta: 0, unidad: "pieza", lote: "", caducidad: cad(700) },
    { id: "prd-guantes", nombre: "Guantes de nitrilo M", categoria: "Consumible", existencias: 6, minimo: 4, costo: 165, precio_venta: 0, unidad: "caja", lote: "", caducidad: "" },
    { id: "prd-sabanas", nombre: "Sábana desechable para camilla", categoria: "Consumible", existencias: 3, minimo: 5, costo: 210, precio_venta: 0, unidad: "rollo", lote: "", caducidad: "" },
  ];

  // --- Gastos ----------------------------------------------------------------
  const gastos: Gasto[] = [];
  let ng = 0;
  for (let mes = 0; mes < 3; mes++) {
    const base = new Date(ahora);
    base.setUTCDate(1);
    base.setUTCMonth(base.getUTCMonth() - mes);
    const f = (dia: number) => {
      const d = new Date(base);
      d.setUTCDate(dia);
      d.setUTCHours(17);
      return d.getTime() > ahora ? new Date(ahora - 3_600_000).toISOString() : d.toISOString();
    };
    const lista: [string, Gasto["categoria"], number, number][] = [
      ["Renta del consultorio", "Renta", 32000, 1],
      ["Nómina recepción y enfermería", "Nómina", 38500, 15],
      ["Compra de vacunas (distribuidor)", "Insumos médicos", 18400 + Math.round(rnd() * 6000), 6],
      ["Material de curación", "Insumos médicos", 2900 + Math.round(rnd() * 900), 12],
      ["Campaña Meta Ads · vacunación", "Publicidad", 4500, 3],
      ["Luz, agua e internet", "Servicios", 3650 + Math.round(rnd() * 500), 9],
      ["Recolección RPBI", "Servicios", 1350, 20],
    ];
    for (const [concepto, categoria, monto, dia] of lista) {
      ng++;
      gastos.push({ id: `gto-${String(ng).padStart(3, "0")}`, concepto, categoria, monto, fecha: f(dia) });
    }
  }
  gastos.push({ id: "gto-eq01", concepto: "Termómetro digital de red de frío", categoria: "Equipo", monto: 2890, fecha: new Date(ahora - 18 * 86_400_000).toISOString() });
  gastos.sort((a, b) => b.fecha.localeCompare(a.fecha));

  // --- Tarjetas (el programa está apagado, pero cada paciente ya tiene la suya) ---
  const tarjetas: TarjetaLealtad[] = pacientes.map((p, i) => ({
    id: `tlc-${p.id}`,
    numero: `MOS-${String(1000 + i * 37).padStart(4, "0")}-${String(4821 + i * 113).slice(-4)}`,
    paciente_id: p.id,
    emitida_en: p.creado_en,
    sellos_extra: i % 4 === 0 ? 1 : 0,
    estado: "activa",
    wallet_guardada_en: null,
  }));

  // --- Google Calendar (simulado): la pediatra ya conectó el suyo ---------------
  const medicos: Medico[] = MEDICOS.map((m) =>
    m.id === "med-mariana"
      ? {
          ...m,
          google: {
            email: "mariana.torres.pediatra@gmail.com",
            calendario: "Consultorio Vitalia",
            conectado_en: new Date(ahora - 20 * 86_400_000).toISOString(),
            ultimo_sync: new Date(ahora - 7 * 60_000).toISOString(),
            auto: true,
          },
        }
      : m
  );
  const eventos_google: EventoGoogle[] = [];
  const personal = (dia: number, h: number, min: number, horas: number, titulo: string) => {
    const z = enZona(inicioHoy + dia * 86_400_000 + 12 * 3_600_000);
    const inicio = instante(z.anio, z.mes, z.dia, h * 60 + min);
    eventos_google.push({
      id: `gp-${eventos_google.length + 1}`,
      medico_id: "med-mariana",
      titulo,
      inicio: new Date(inicio).toISOString(),
      fin: new Date(inicio + horas * 3_600_000).toISOString(),
      origen: "personal",
      cita_id: null,
      ocupado: true,
    });
  };
  personal(1, 14, 0, 1.5, "Junta del Colegio de Pediatría");
  personal(4, 9, 0, 2, "Curso de actualización: lactancia");
  personal(8, 13, 0, 1, "Comida familiar");
  for (const c of citas) {
    if (c.medico_id !== "med-mariana" || !(c.estado === "confirmada" || c.estado === "asistida")) continue;
    c.google_evento_id = `gev-${c.id}`;
    eventos_google.push({
      id: `gev-${c.id}`,
      medico_id: c.medico_id,
      titulo: `${c.servicio_nombre} · ${c.paciente_nombre}`,
      inicio: c.inicio,
      fin: c.fin,
      origen: "medical-os",
      cita_id: c.id,
      ocupado: true,
    });
  }
  // --- Avisos -------------------------------------------------------------------
  const hace = (min: number) => new Date(ahora - min * 60_000).toISOString();
  const avisos: Aviso[] = [
    { id: "av-1", para: "admin", titulo: "Inventario bajo", detalle: "SRP triple viral: quedan 6 dosis (mínimo 8).", creado_en: hace(35), leido: false, enlace: "/dashboard/admin/inventario" },
    { id: "av-2", para: "admin", titulo: "Caducidad próxima", detalle: "Varicela atenuada (lote VZ25-1108) caduca en 25 días.", creado_en: hace(80), leido: false, enlace: "/dashboard/admin/inventario" },
    { id: "av-3", para: "admin", titulo: "Nueva cita en línea", detalle: "Mateo Ramírez · Vacuna de primer año", creado_en: hace(190), leido: false, enlace: "/dashboard/admin/citas" },
    { id: "av-4", para: "med-mariana", titulo: "Google Calendar sincronizado", detalle: "Tus citas de la semana ya están en tu calendario.", creado_en: hace(7), leido: false },
    { id: "av-5", para: PACIENTE_DEMO_ADULTO, titulo: "Recordatorio", detalle: "Mateo tiene su vacuna de primer año en 3 días.", creado_en: hace(60), leido: false, enlace: "/cuenta" },
  ];

  return {
    citas,
    medicos,
    horarios: HORARIOS,
    fichas,
    recompensas: { activa: false, citas_requeridas: 5, valor_descuento: 15 },
    clinica: CLINICA_DEMO,
    canjes: {},
    servicios: SERVICIOS,
    productos,
    gastos,
    pacientes,
    tarjetas,
    vacunas,
    eventos_google,
    integraciones: INTEGRACIONES_POR_DEFECTO,
    avisos,
  };
}

/** Accesos de la demo que ofrece la pantalla de inicio de sesión. */
export const CUENTAS_DEMO = {
  admin: { rol: "admin" as const, id: "admin", nombre: "Recepción Vitalia", subtitulo: "Administración", principal: true },
  medicos: MEDICOS.map((m) => ({ rol: "medico" as const, id: m.id, nombre: m.nombre, subtitulo: m.especialidad })),
  pacientes: [
    { rol: "paciente" as const, id: PACIENTE_DEMO_ADULTO, nombre: "Lucía Ramírez", subtitulo: "Paciente adulta" },
    { rol: "paciente" as const, id: PACIENTE_DEMO_BEBE, nombre: "Mateo Ramírez", subtitulo: "Bebé · tutor Lucía" },
  ],
};
