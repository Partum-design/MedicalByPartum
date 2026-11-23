import { NextResponse, type NextRequest } from "next/server";
import type { Sesion } from "@/lib/datos/modelo";
import { leer } from "@/lib/datos/servidor";
import { CUENTAS_DEMO } from "@/lib/datos/semilla";
import { codificarSesion, COOKIE_SESION, inicioDeRol } from "@/lib/sesion";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/demo — inicia sesión en la demo.
 * Body: { rol, id } de una cuenta de ejemplo, o { rol: "paciente", id, nombre }
 * para un paciente dado de alta en el navegador (registro, Google simulado).
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Partial<Sesion> | null;
  if (!body?.rol || !body.id) return NextResponse.json({ error: "Elige una cuenta." }, { status: 400 });

  let sesion: Sesion | null = null;
  if (body.rol === "admin") sesion = CUENTAS_DEMO.admin;
  else if (body.rol === "medico") {
    const m = leer().medicos.find((x) => x.id === body.id) ?? CUENTAS_DEMO.medicos.find((x) => x.id === body.id);
    sesion = m
      ? { rol: "medico", id: m.id, nombre: m.nombre, subtitulo: "especialidad" in m ? m.especialidad : m.subtitulo }
      : body.nombre
        ? { rol: "medico", id: String(body.id).slice(0, 64), nombre: String(body.nombre).slice(0, 120), subtitulo: String(body.subtitulo ?? "Médico") }
        : null;
  } else if (body.rol === "paciente") {
    const p = leer().pacientes.find((x) => x.id === body.id);
    const nombre = p?.nombre ?? String(body.nombre ?? "").trim().slice(0, 120);
    if (nombre.length >= 2) sesion = { rol: "paciente", id: String(body.id).slice(0, 64), nombre, subtitulo: String(body.subtitulo ?? "Paciente").slice(0, 80) };
  }
  if (!sesion) return NextResponse.json({ error: "Cuenta no encontrada." }, { status: 404 });

  const res = NextResponse.json({ sesion, destino: inicioDeRol(sesion.rol) });
  res.cookies.set(COOKIE_SESION, codificarSesion(sesion), {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14,
    httpOnly: false,
  });
  return res;
}

/** DELETE /api/auth/demo — cierra la sesión. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_SESION, "", { path: "/", maxAge: 0 });
  return res;
}
