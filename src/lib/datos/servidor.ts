import { cookies } from "next/headers";
import { aplicarOperacion, type Estado, type Operacion, type Sesion } from "@/lib/datos/modelo";
import { crearSemilla, VERSION_SEMILLA } from "@/lib/datos/semilla";
import { COOKIE_SESION, decodificarSesion } from "@/lib/sesion";

// ============================================================================
// "Base de datos" del servidor para la demo: vive en la memoria del proceso.
// Arranca con la semilla y aplica las mismas reglas de negocio que el
// navegador (lib/datos/modelo.ts). En Vercel cada instancia tiene su copia y
// se reinicia al enfriarse; por eso la copia del navegador (localStorage) es
// la que manda en la experiencia, y ésta funciona como espejo y validador.
// Para producción basta con reemplazar `leer` y `guardar` por consultas a
// Supabase/PostgreSQL: el resto de la app no cambia.
// ============================================================================

type Memoria = { estado: Estado; version: number; creado: number; operaciones: number };

const g = globalThis as unknown as { __medicalOS?: Memoria };

function memoria(): Memoria {
  if (!g.__medicalOS || g.__medicalOS.version !== VERSION_SEMILLA || Date.now() - g.__medicalOS.creado > 6 * 3_600_000) {
    g.__medicalOS = { estado: crearSemilla(), version: VERSION_SEMILLA, creado: Date.now(), operaciones: 0 };
  }
  return g.__medicalOS;
}

export function leer(): Estado {
  return memoria().estado;
}

export function reiniciar(): Estado {
  g.__medicalOS = undefined;
  return memoria().estado;
}

export function estadisticas() {
  const m = memoria();
  return { creado: new Date(m.creado).toISOString(), operaciones: m.operaciones, version: m.version };
}

/** Aplica la operación con los permisos de la sesión y la guarda en memoria. */
export function ejecutar(op: Operacion, sesion: Sesion) {
  const m = memoria();
  const antes = m.estado;
  const cambios = aplicarOperacion(antes, op, sesion);
  m.estado = { ...antes, ...cambios };
  m.operaciones++;
  return { antes, despues: m.estado, cambios };
}

export async function sesionDePeticion(): Promise<Sesion | null> {
  const almacen = await cookies();
  return decodificarSesion(almacen.get(COOKIE_SESION)?.value);
}
