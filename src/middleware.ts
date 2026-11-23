import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, decodificarSesion, inicioDeRol } from "@/lib/sesion";

// Protege los paneles: cada rol sólo entra a su zona. La sesión es la cookie
// de la demo; al conectar autenticación real se valida aquí su token.
export function middleware(req: NextRequest) {
  const sesion = decodificarSesion(req.cookies.get(COOKIE_SESION)?.value);
  const { pathname } = req.nextUrl;
  const zona = pathname.startsWith("/dashboard/admin")
    ? "admin"
    : pathname.startsWith("/dashboard/medico")
      ? "medico"
      : pathname.startsWith("/cuenta")
        ? "paciente"
        : null;
  if (!zona) return NextResponse.next();
  if (!sesion) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?siguiente=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  if (sesion.rol !== zona) {
    const url = req.nextUrl.clone();
    url.pathname = inicioDeRol(sesion.rol);
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/cuenta/:path*"] };
