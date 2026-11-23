import type { Rol, Sesion } from "@/lib/datos/modelo";

// Sesión de la demo: una cookie legible con el rol y el id. No hay contraseñas
// ni base de datos de usuarios; el middleware la usa para proteger las rutas y
// /api/datos para aplicar los permisos de cada rol. Al conectar un proveedor
// real (Supabase Auth, Clerk, NextAuth) esta cookie se sustituye por la suya.

export const COOKIE_SESION = "mos_sesion";

const ROLES: Rol[] = ["admin", "medico", "paciente"];

export function codificarSesion(s: Sesion) {
  const json = JSON.stringify({ rol: s.rol, id: s.id, nombre: s.nombre, subtitulo: s.subtitulo, principal: s.principal });
  // base64url: sin "=", "+" ni "/", así la cookie no necesita codificarse.
  const b64 = typeof btoa === "function" ? btoa(unescape(encodeURIComponent(json))) : Buffer.from(json).toString("base64");
  return b64.replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export function decodificarSesion(valor: string | undefined | null): Sesion | null {
  if (!valor) return null;
  try {
    let crudo = valor;
    for (let i = 0; i < 3 && crudo.includes("%"); i++) crudo = decodeURIComponent(crudo);
    let b64 = crudo.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const json = typeof atob === "function" ? decodeURIComponent(escape(atob(b64))) : Buffer.from(b64, "base64").toString("utf8");
    const s = JSON.parse(json) as Sesion;
    if (!ROLES.includes(s.rol) || typeof s.id !== "string" || !s.id) return null;
    return { rol: s.rol, id: s.id.slice(0, 64), nombre: String(s.nombre ?? "").slice(0, 120), subtitulo: String(s.subtitulo ?? "").slice(0, 120), principal: Boolean(s.principal) };
  } catch {
    return null;
  }
}

export function inicioDeRol(rol: Rol) {
  return rol === "admin" ? "/dashboard/admin" : rol === "medico" ? "/dashboard/medico" : "/cuenta";
}
