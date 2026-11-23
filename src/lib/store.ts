"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  aplicarOperacion,
  estadoVacio,
  horarioPorDefecto,
  normalizarEstado,
  nuevoId,
  numeroDeTarjeta,
  permisosDe,
  PERMISOS_POR_DEFECTO,
  vistaPara,
  type ClinicaConfig,
  type BloqueHorario,
  type Cita,
  type DiaSemana,
  type Estado,
  type EstadoTarjeta,
  type EventoGoogle,
  type Ficha,
  type Gasto,
  type HorarioSemanal,
  type IntegracionesConfig,
  type MetodoPago,
  type Medico,
  type Modalidad,
  type Operacion,
  type Paciente,
  type PermisosMedico,
  type Producto,
  type RecompensasConfig,
  type Servicio,
  type Sesion,
  type VacunaAplicada,
} from "@/lib/datos/modelo";
import { crearSemilla, VERSION_SEMILLA } from "@/lib/datos/semilla";
import { COOKIE_SESION, decodificarSesion } from "@/lib/sesion";


// ============================================================================
// Almacén de la clínica en el navegador.
//
// Demo sin base de datos: el navegador guarda la base completa en
// localStorage (arranca con la semilla que entrega /api/datos) y aplica cada
// operación con las mismas reglas del servidor. Después la manda a
// /api/datos, que la valida con los permisos de la sesión y la guarda en su
// copia en memoria. Cada pantalla ve sólo lo que su rol puede ver (vistaPara).
// ============================================================================

const KEY = `medical-os-demo-v${VERSION_SEMILLA}`;
/** Pasados estos días la semilla se regenera para que la agenda quede alrededor de hoy. */
const DIAS_VIGENCIA = 4;

type Snapshot = { listo: boolean; sesion: Sesion | null; completo: Estado; estado: Estado; sincronizando: number };

let snapshot: Snapshot = { listo: false, sesion: null, completo: estadoVacio(), estado: estadoVacio(), sincronizando: 0 };
const oyentes = new Set<() => void>();
let iniciado = false;

/** Sesión del sistema para reservas sin cuenta (lo que en producción hace el servidor). */
const SISTEMA: Sesion = { rol: "admin", id: "sistema", nombre: "Reservas en línea", subtitulo: "Sistema" };

function publicar(cambios: Partial<Snapshot>) {
  const sig = { ...snapshot, ...cambios };
  if (cambios.completo || cambios.sesion !== undefined) sig.estado = vistaPara(sig.completo, sig.sesion);
  snapshot = sig;
  oyentes.forEach((f) => f());
}

function leerCookieSesion(): Sesion | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_SESION}=([^;]*)`));
  return decodificarSesion(m?.[1]);
}

function guardar(estado: Estado) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ creado: guardadoEn ?? Date.now(), estado }));
  } catch {
    /* sin almacenamiento (modo privado): la demo sigue en memoria */
  }
}

let guardadoEn: number | null = null;

async function cargarInicial(): Promise<Estado> {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const { creado, estado } = JSON.parse(raw) as { creado: number; estado: Partial<Estado> };
      if (Date.now() - creado < DIAS_VIGENCIA * 86_400_000) {
        guardadoEn = creado;
        return normalizarEstado(estado);
      }
    }
  } catch {
    /* copia corrupta: se regenera */
  }
  guardadoEn = Date.now();
  try {
    const res = await fetch("/api/datos?semilla=1", { cache: "no-store" });
    if (res.ok) {
      const { estado } = (await res.json()) as { estado: Estado };
      const normal = normalizarEstado(estado);
      guardar(normal);
      return normal;
    }
  } catch {
    /* sin servidor: la semilla también se puede generar aquí */
  }
  const local = crearSemilla();
  guardar(local);
  return local;
}

function iniciar() {
  if (iniciado || typeof window === "undefined") return;
  iniciado = true;
  publicar({ sesion: leerCookieSesion() });
  void cargarInicial().then((completo) => publicar({ completo, listo: true }));
  // Otra pestaña cambió la base: se refleja aquí.
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY || !e.newValue) return;
    try {
      publicar({ completo: normalizarEstado((JSON.parse(e.newValue) as { estado: Estado }).estado) });
    } catch {
      /* ignora */
    }
  });
}

function sincronizar(op: Operacion, comoSistema = false) {
  publicar({ sincronizando: snapshot.sincronizando + 1 });
  fetch(comoSistema ? "/api/reservas" : "/api/datos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ op }),
  })
    .then(async (res) => {
      if (!res.ok) {
        const cuerpo = (await res.json().catch(() => ({}))) as { error?: string };
        // La copia del servidor es un espejo en memoria que puede reiniciarse:
        // un desacuerdo se registra, pero manda la del navegador.
        console.info("[Medical OS · servidor simulado]", op.tipo, res.status, cuerpo.error ?? "");
      }
    })
    .catch(() => console.info("[Medical OS · servidor simulado] sin conexión; el cambio quedó en el navegador"))
    .finally(() => publicar({ sincronizando: Math.max(0, snapshot.sincronizando - 1) }));
}

type Resultado = { ok: boolean; error: string | null };

/** Aplica una operación en la base local y la manda al servidor simulado. */
function ejecutar(op: Operacion, opciones: { sesion?: Sesion; alerta?: boolean } = {}): Resultado {
  const sesion = opciones.sesion ?? snapshot.sesion;
  if (!sesion) {
    const error = "Tu sesión terminó. Vuelve a iniciar sesión.";
    if (opciones.alerta !== false) window.alert(error);
    return { ok: false, error };
  }
  try {
    const cambios = aplicarOperacion(snapshot.completo, op, sesion);
    const completo = { ...snapshot.completo, ...cambios };
    publicar({ completo });
    guardar(completo);
    sincronizar(op, sesion === SISTEMA);
    return { ok: true, error: null };
  } catch (err) {
    const error = err instanceof Error ? err.message : "No se pudo completar la acción.";
    if (opciones.alerta !== false) window.alert(error);
    return { ok: false, error };
  }
}

const silencioso = (op: Operacion) => ejecutar(op, { alerta: false });

async function iniciarSesion(datos: Pick<Sesion, "rol" | "id"> & Partial<Sesion>): Promise<{ ok: boolean; destino?: string; error?: string }> {
  try {
    const res = await fetch("/api/auth/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    const cuerpo = (await res.json()) as { sesion?: Sesion; destino?: string; error?: string };
    if (!res.ok || !cuerpo.sesion) return { ok: false, error: cuerpo.error ?? "No se pudo iniciar sesión." };
    publicar({ sesion: cuerpo.sesion });
    return { ok: true, destino: cuerpo.destino };
  } catch {
    return { ok: false, error: "Sin conexión con el servidor." };
  }
}

async function logout() {
  publicar({ sesion: null });
  await fetch("/api/auth/demo", { method: "DELETE" }).catch(() => {});
}

/** Vuelve a la base de ejemplo (en el navegador y en el servidor). */
async function restablecerDemo() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignora */
  }
  await fetch("/api/datos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accion: "reiniciar" }) }).catch(() => {});
  guardadoEn = null;
  const completo = await cargarInicial();
  publicar({ completo });
}

function suscribir(f: () => void) {
  oyentes.add(f);
  return () => oyentes.delete(f);
}
const leer = () => snapshot;

// --- Mutadores que devuelven lo creado --------------------------------------

type CambiosCita = Extract<Operacion, { tipo: "actualizarCita" }>["cambios"];

function crearCita(datos: {
  medico_id: string;
  servicio_id?: string | null;
  inicio: string;
  modalidad: Modalidad;
  direccion_domicilio?: string;
  motivo?: string;
}): { cita: Cita | null; error: string | null } {
  const op: Operacion = { tipo: "crearCita", id: nuevoId("c"), metodo_pago: "efectivo", fin: datos.inicio, ...datos };
  const r = ejecutar(op, { alerta: false });
  return { cita: r.ok ? (snapshot.completo.citas.find((c) => c.id === op.id) ?? null) : null, error: r.error };
}

/** Reserva sin cuenta: nombre y celular. Crea la ficha del paciente si es nuevo. */
function reservarInvitado(datos: {
  nombre: string;
  telefono: string;
  medico_id: string;
  servicio_id?: string | null;
  inicio: string;
  modalidad: Modalidad;
  direccion_domicilio?: string;
  motivo?: string;
}): { cita: Cita | null; paciente: Paciente | null; error: string | null } {
  const op: Operacion = {
    tipo: "reservarInvitado",
    id: nuevoId("c"),
    pacienteId: nuevoId("pac"),
    tarjetaId: nuevoId("tlc"),
    numeroTarjeta: numeroDeTarjeta(new Set(snapshot.completo.tarjetas.map((t) => t.numero))),
    ...datos,
  };
  const r = ejecutar(op, { sesion: SISTEMA, alerta: false });
  if (!r.ok) return { cita: null, paciente: null, error: r.error };
  const cita = snapshot.completo.citas.find((c) => c.id === op.id) ?? null;
  const paciente = cita ? (snapshot.completo.pacientes.find((p) => p.id === cita.paciente_id) ?? null) : null;
  return { cita, paciente, error: null };
}

function crearCitaPersonal(datos: Omit<Extract<Operacion, { tipo: "crearCitaPersonal" }>, "tipo" | "id">) {
  const op: Operacion = { tipo: "crearCitaPersonal", id: nuevoId("c"), ...datos };
  const r = silencioso(op);
  return { ...r, id: r.ok ? op.id : null };
}

function agregarFicha(datos: Omit<Ficha, "id" | "creado_en">): Ficha | null {
  const ficha: Ficha = { id: nuevoId("fx"), creado_en: new Date().toISOString(), ...datos };
  return ejecutar({ tipo: "agregarFicha", ficha }).ok ? ficha : null;
}

function agregarServicio(datos: Omit<Servicio, "id" | "activo">): Servicio | null {
  const servicio: Servicio = { id: nuevoId("srv"), activo: true, ...datos };
  return ejecutar({ tipo: "agregarServicio", servicio }).ok ? servicio : null;
}

function agregarProducto(datos: Omit<Producto, "id">): Producto | null {
  const producto: Producto = { id: nuevoId("prd"), ...datos };
  return ejecutar({ tipo: "agregarProducto", producto }).ok ? producto : null;
}

function agregarGasto(datos: Omit<Gasto, "id" | "fecha"> & { fecha?: string }): Gasto | null {
  const gasto: Gasto = { id: nuevoId("gto"), fecha: datos.fecha ?? new Date().toISOString(), concepto: datos.concepto, categoria: datos.categoria, monto: datos.monto };
  return ejecutar({ tipo: "agregarGasto", gasto }).ok ? gasto : null;
}

function agregarMedico(datos: Omit<Medico, "id" | "activo">): Medico | null {
  const medico: Medico = { id: nuevoId("med"), activo: true, ...datos };
  return ejecutar({ tipo: "agregarMedico", medico }).ok ? medico : null;
}

function agregarVacuna(datos: Omit<VacunaAplicada, "id">): VacunaAplicada | null {
  const vacuna: VacunaAplicada = { id: nuevoId("vac"), ...datos };
  return ejecutar({ tipo: "agregarVacuna", vacuna }).ok ? vacuna : null;
}

function agregarEventoGoogle(datos: Omit<EventoGoogle, "id" | "origen" | "cita_id">) {
  return ejecutar({ tipo: "agregarEventoGoogle", evento: { id: nuevoId("gp"), origen: "personal", cita_id: null, ...datos } });
}

/** Da de alta a un paciente (o reutiliza el existente) y le emite su tarjeta. */
function registrarPaciente(datos: Omit<Paciente, "id" | "creado_en"> & { id?: string }, sesion?: Sesion): { paciente: Paciente | null; error: string | null } {
  const existente = datos.id ? snapshot.completo.pacientes.find((c) => c.id === datos.id) : undefined;
  if (existente) return { paciente: existente, error: null };
  const paciente: Paciente = {
    ...datos,
    id: datos.id ?? nuevoId("pac"),
    nombre: datos.nombre.trim(),
    telefono: datos.telefono.trim(),
    email: datos.email.trim(),
    creado_en: new Date().toISOString(),
  };
  const r = ejecutar(
    {
      tipo: "registrarPaciente",
      paciente,
      tarjetaId: nuevoId("tlc"),
      numeroTarjeta: numeroDeTarjeta(new Set(snapshot.completo.tarjetas.map((t) => t.numero))),
    },
    { sesion, alerta: false }
  );
  return r.ok ? { paciente: snapshot.completo.pacientes.find((p) => p.id === paciente.id) ?? paciente, error: null } : { paciente: null, error: r.error };
}

/** Lectura suelta (fuera de React) de la base completa: la usa el acceso de la demo. */
export function baseCompleta() {
  return snapshot.completo;
}

// --- Hook principal -----------------------------------------------------------

export function useClinica() {
  const { listo, sesion, estado, sincronizando } = useSyncExternalStore(suscribir, leer, leer);

  useEffect(iniciar, []);

  const horarioDeMedico = useCallback(
    (medicoId: string): HorarioSemanal => estado.horarios[medicoId] ?? horarioPorDefecto(),
    [estado.horarios]
  );

  const permisos: PermisosMedico = useMemo(
    () =>
      sesion?.rol === "admin"
        ? (Object.fromEntries(Object.keys(PERMISOS_POR_DEFECTO).map((k) => [k, true])) as PermisosMedico)
        : sesion?.rol === "medico"
          ? permisosDe(estado.medicos.find((b) => b.id === sesion.id))
          : (Object.fromEntries(Object.keys(PERMISOS_POR_DEFECTO).map((k) => [k, false])) as PermisosMedico),
    [sesion, estado.medicos]
  );

  return {
    listo,
    sesion,
    permisos,
    sincronizando: sincronizando > 0,
    estado,
    citas: estado.citas,
    medicos: estado.medicos,
    fichas: estado.fichas,
    recompensasConfig: estado.recompensas,
    clinicaConfig: estado.clinica,
    canjes: estado.canjes,
    servicios: estado.servicios,
    productos: estado.productos,
    gastos: estado.gastos,
    pacientes: estado.pacientes,
    tarjetas: estado.tarjetas,
    vacunas: estado.vacunas,
    eventosGoogle: estado.eventos_google,
    integraciones: estado.integraciones,
    avisos: estado.avisos,
    iniciarSesion,
    logout,
    restablecerDemo,
    horarioDeMedico,
    crearCita,
    reservarInvitado,
    crearCitaPersonal,
    actualizarCita: (id: string, cambios: CambiosCita, forzar = false) => silencioso({ tipo: "actualizarCita", id, cambios, forzar }),
    marcarAsistida: (id: string) => ejecutar({ tipo: "marcarAsistida", id }),
    confirmarLlegada: (id: string) => silencioso({ tipo: "marcarAsistida", id }),
    cancelarCita: (id: string) => ejecutar({ tipo: "cancelarCita", id }),
    eliminarCita: (id: string) => ejecutar({ tipo: "eliminarCita", id }),
    cobrar: (id: string, metodo: MetodoPago) => ejecutar({ tipo: "cobrarCita", id, metodo }),
    agregarMedico,
    actualizarMedico: (id: string, cambios: Partial<Medico>) => ejecutar({ tipo: "actualizarMedico", id, cambios }),
    toggleActivoMedico: (id: string) => ejecutar({ tipo: "toggleActivoMedico", id }),
    eliminarMedico: (id: string) => ejecutar({ tipo: "eliminarMedico", id }),
    eliminarPaciente: (id: string) => ejecutar({ tipo: "eliminarPaciente", id }),
    eliminarServicio: (id: string) => ejecutar({ tipo: "eliminarServicio", id }),
    guardarHorarioDia: (medicoId: string, dia: DiaSemana, cambios: Partial<BloqueHorario>) =>
      ejecutar({ tipo: "guardarHorarioDia", medicoId, dia, cambios }),
    agregarFicha,
    actualizarRecompensasConfig: (cambios: Partial<RecompensasConfig>) => ejecutar({ tipo: "actualizarRecompensasConfig", cambios }),
    actualizarClinicaConfig: (cambios: Partial<ClinicaConfig>) => ejecutar({ tipo: "actualizarClinicaConfig", cambios }),
    canjearRecompensa: (pacienteId: string) => ejecutar({ tipo: "canjearRecompensa", pacienteId }),
    agregarServicio,
    actualizarServicio: (id: string, cambios: Partial<Servicio>) => ejecutar({ tipo: "actualizarServicio", id, cambios }),
    agregarProducto,
    ajustarExistencias: (id: string, delta: number) => ejecutar({ tipo: "ajustarExistencias", id, delta }),
    actualizarProducto: (id: string, cambios: Partial<Omit<Producto, "id">>) => ejecutar({ tipo: "actualizarProducto", id, cambios }),
    eliminarProducto: (id: string) => ejecutar({ tipo: "eliminarProducto", id }),
    agregarGasto,
    eliminarGasto: (id: string) => ejecutar({ tipo: "eliminarGasto", id }),
    registrarPaciente,
    actualizarPaciente: (id: string, cambios: Partial<Omit<Paciente, "id">>) => ejecutar({ tipo: "actualizarPaciente", id, cambios }),
    ajustarSellos: (tarjetaId: string, delta: number) => ejecutar({ tipo: "ajustarSellos", tarjetaId, delta }),
    cambiarEstadoTarjeta: (tarjetaId: string, estado: EstadoTarjeta) => ejecutar({ tipo: "cambiarEstadoTarjeta", tarjetaId, estado }),
    marcarWalletGuardada: (tarjetaId: string) => ejecutar({ tipo: "marcarWalletGuardada", tarjetaId, fecha: new Date().toISOString() }),
    agregarVacuna,
    eliminarVacuna: (id: string) => ejecutar({ tipo: "eliminarVacuna", id }),
    conectarGoogle: (medicoId: string, email: string, calendario?: string) => silencioso({ tipo: "conectarGoogle", medicoId, email, calendario }),
    desconectarGoogle: (medicoId: string) => ejecutar({ tipo: "desconectarGoogle", medicoId }),
    sincronizarGoogle: (medicoId: string) => ejecutar({ tipo: "sincronizarGoogle", medicoId }),
    ajustarGoogle: (medicoId: string, auto: boolean) => ejecutar({ tipo: "ajustarGoogle", medicoId, auto }),
    agregarEventoGoogle,
    eliminarEventoGoogle: (id: string) => ejecutar({ tipo: "eliminarEventoGoogle", id }),
    actualizarIntegraciones: (cambios: Partial<IntegracionesConfig>) => ejecutar({ tipo: "actualizarIntegraciones", cambios }),
    marcarAvisosLeidos: () => silencioso({ tipo: "marcarAvisosLeidos" }),
  };
}

export type Clinica = ReturnType<typeof useClinica>;
