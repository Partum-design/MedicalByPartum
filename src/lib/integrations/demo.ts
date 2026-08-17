import { fechaISO } from "./google-auth";
import { ratio, type ResumenAds, type ResumenAnalytics } from "./tipos";

// ---------------------------------------------------------------------------
// Juego de datos de demostración.
//
// Es determinista: la semilla sale de la fecha, así que las cifras no bailan
// entre recargas ni entre el servidor y el cliente. Las magnitudes están
// calibradas para una clínica multiespecialidad urbana, no son ruido: el
// panel tiene que poder leerse y discutirse aunque todavía no haya cuentas
// de Google conectadas.
// ---------------------------------------------------------------------------

function aleatorio(semilla: number) {
  let s = semilla % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function semillaDelDia() {
  const hoy = new Date();
  return hoy.getUTCFullYear() * 10000 + (hoy.getUTCMonth() + 1) * 100 + hoy.getUTCDate();
}

const DIAS = 28;

/** Entre semana la clínica agenda consultas; el fin de semana el tráfico cae. */
function factorLaboral(diaSemana: number) {
  if (diaSemana === 0) return 0.32; // domingo
  if (diaSemana === 6) return 0.55; // sábado, sólo urgencias/medio turno
  if (diaSemana === 1) return 1.18; // lunes: agenda de la semana
  return 1;
}

export function analyticsDemo(aviso?: string): ResumenAnalytics {
  const rnd = aleatorio(semillaDelDia());
  const serie: ResumenAnalytics["serie"] = [];

  let usuarios = 0;
  let sesiones = 0;

  for (let i = DIAS - 1; i >= 0; i--) {
    const fecha = fechaISO(-i);
    const diaSemana = new Date(`${fecha}T00:00:00Z`).getUTCDay();
    const factorDia = factorLaboral(diaSemana);
    const base = 96 * factorDia;
    const u = Math.round(base * (0.86 + rnd() * 0.3));
    const s = Math.round(u * (1.22 + rnd() * 0.14));
    usuarios += u;
    sesiones += s;
    serie.push({ fecha, usuarios: u, sesiones: s });
  }

  const vistas = Math.round(sesiones * 2.9);
  const conversiones = Math.round(sesiones * 0.052);

  return {
    origen: "demostracion",
    aviso,
    rango: { desde: fechaISO(-(DIAS - 1)), hasta: fechaISO(0) },
    usuariosActivos: usuarios,
    usuariosNuevos: Math.round(usuarios * 0.58),
    sesiones,
    vistas,
    duracionMediaSeg: 118,
    tasaInteraccion: 0.634,
    conversiones,
    serie,
    canales: [
      { nombre: "Búsqueda de pago", sesiones: Math.round(sesiones * 0.32), conversiones: Math.round(conversiones * 0.39) },
      { nombre: "Búsqueda orgánica", sesiones: Math.round(sesiones * 0.28), conversiones: Math.round(conversiones * 0.27) },
      { nombre: "Directo", sesiones: Math.round(sesiones * 0.18), conversiones: Math.round(conversiones * 0.17) },
      { nombre: "Redes sociales", sesiones: Math.round(sesiones * 0.13), conversiones: Math.round(conversiones * 0.1) },
      { nombre: "Referencia médica", sesiones: Math.round(sesiones * 0.09), conversiones: Math.round(conversiones * 0.07) },
    ],
    paginas: [
      { ruta: "/", vistas: Math.round(vistas * 0.34), duracionMediaSeg: 82 },
      { ruta: "/reservar", vistas: Math.round(vistas * 0.29), duracionMediaSeg: 176 },
      { ruta: "/#especialidades", vistas: Math.round(vistas * 0.16), duracionMediaSeg: 96 },
      { ruta: "/#medicos", vistas: Math.round(vistas * 0.12), duracionMediaSeg: 84 },
      { ruta: "/login", vistas: Math.round(vistas * 0.09), duracionMediaSeg: 38 },
    ],
    dispositivos: [
      { nombre: "Móvil", sesiones: Math.round(sesiones * 0.68) },
      { nombre: "Escritorio", sesiones: Math.round(sesiones * 0.27) },
      { nombre: "Tableta", sesiones: Math.round(sesiones * 0.05) },
    ],
  };
}

const CAMPANAS_BASE = [
  { id: "31084521", nombre: "Clínica CDMX · Búsqueda de marca", estado: "activa" as const, canal: "Búsqueda", peso: 0.28, presupuesto: 220 },
  { id: "31084522", nombre: "Consulta general · Genérica local", estado: "activa" as const, canal: "Búsqueda", peso: 0.32, presupuesto: 300 },
  { id: "31084523", nombre: "Máximo rendimiento · Citas médicas", estado: "activa" as const, canal: "Máximo rendimiento", peso: 0.26, presupuesto: 260 },
  { id: "31084524", nombre: "Remarketing · Agenda abandonada", estado: "pausada" as const, canal: "Display", peso: 0.14, presupuesto: 110 },
];

export function adsDemo(aviso?: string): ResumenAds {
  const rnd = aleatorio(semillaDelDia() + 7);
  const serie: ResumenAds["serie"] = [];

  let costo = 0;
  let clics = 0;
  let conversiones = 0;

  for (let i = DIAS - 1; i >= 0; i--) {
    const fecha = fechaISO(-i);
    const diaSemana = new Date(`${fecha}T00:00:00Z`).getUTCDay();
    const factorDia = factorLaboral(diaSemana);
    const c = Math.round(540 * factorDia * (0.88 + rnd() * 0.26));
    const k = Math.round(c / (14 + rnd() * 4));
    const cv = Math.round(k * (0.095 + rnd() * 0.05));
    costo += c;
    clics += k;
    conversiones += cv;
    serie.push({ fecha, costo: c, clics: k, conversiones: cv });
  }

  const impresiones = Math.round(clics * 16.8);
  const valorConversion = Math.round(conversiones * 780);

  const campanas = CAMPANAS_BASE.map((c) => {
    const cImp = Math.round(impresiones * c.peso);
    const cClics = Math.round(clics * c.peso * (c.canal === "Display" ? 1.5 : 0.95));
    const cCosto = Math.round(costo * c.peso);
    const cConv = Math.round(conversiones * c.peso * (c.canal === "Display" ? 0.5 : 1.06));
    return {
      id: c.id,
      nombre: c.nombre,
      estado: c.estado,
      canal: c.canal,
      impresiones: cImp,
      clics: cClics,
      costo: cCosto,
      conversiones: cConv,
      ctr: ratio(cClics, cImp),
      cpc: ratio(cCosto, cClics),
      cpa: ratio(cCosto, cConv),
      presupuestoDiario: c.presupuesto,
    };
  });

  return {
    origen: "demostracion",
    aviso,
    rango: { desde: fechaISO(-(DIAS - 1)), hasta: fechaISO(0) },
    moneda: "MXN",
    impresiones,
    clics,
    costo,
    conversiones,
    ctr: ratio(clics, impresiones),
    cpc: ratio(costo, clics),
    cpa: ratio(costo, conversiones),
    valorConversion,
    roas: ratio(valorConversion, costo),
    serie,
    campanas,
    terminos: [
      { termino: "clínica cerca de mí", clics: Math.round(clics * 0.18), costo: Math.round(costo * 0.17), conversiones: Math.round(conversiones * 0.21) },
      { termino: "cita médica online cdmx", clics: Math.round(clics * 0.15), costo: Math.round(costo * 0.16), conversiones: Math.round(conversiones * 0.17) },
      { termino: "ginecólogo cerca de mí", clics: Math.round(clics * 0.13), costo: Math.round(costo * 0.14), conversiones: Math.round(conversiones * 0.15) },
      { termino: "pediatra consulta hoy", clics: Math.round(clics * 0.1), costo: Math.round(costo * 0.11), conversiones: Math.round(conversiones * 0.12) },
      { termino: "consulta médica a domicilio", clics: Math.round(clics * 0.08), costo: Math.round(costo * 0.09), conversiones: Math.round(conversiones * 0.1) },
    ],
  };
}
