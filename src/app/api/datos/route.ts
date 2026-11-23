import { NextResponse, type NextRequest } from "next/server";
import { ErrorOperacion, vistaPara, type Operacion } from "@/lib/datos/modelo";
import { ejecutar, estadisticas, leer, reiniciar, sesionDePeticion } from "@/lib/datos/servidor";
import { VERSION_SEMILLA } from "@/lib/datos/semilla";

export const dynamic = "force-dynamic";

/**
 * GET /api/datos — el estado de la clínica recortado a lo que puede ver la
 * sesión. Con ?semilla=1 devuelve la base completa de ejemplo para que el
 * navegador arranque su copia local.
 */
export async function GET(req: NextRequest) {
  const sesion = await sesionDePeticion();
  const semilla = req.nextUrl.searchParams.get("semilla") === "1";
  const estado = leer();
  return NextResponse.json(
    { estado: semilla ? estado : vistaPara(estado, sesion), version: VERSION_SEMILLA, servidor: estadisticas() },
    { headers: { "Cache-Control": "no-store" } }
  );
}

/** POST /api/datos — aplica una operación con los permisos de la sesión. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { op?: Operacion; accion?: string } | null;
  if (body?.accion === "reiniciar") {
    reiniciar();
    return NextResponse.json({ ok: true, servidor: estadisticas() });
  }
  const sesion = await sesionDePeticion();
  if (!sesion) return NextResponse.json({ error: "Inicia sesión para continuar." }, { status: 401 });
  if (!body?.op || typeof body.op.tipo !== "string") return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  try {
    const { cambios } = ejecutar(body.op, sesion);
    return NextResponse.json({ ok: true, colecciones: Object.keys(cambios), servidor: estadisticas() });
  } catch (err) {
    if (err instanceof ErrorOperacion) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(err);
    return NextResponse.json({ error: "No se pudo guardar el cambio." }, { status: 500 });
  }
}
