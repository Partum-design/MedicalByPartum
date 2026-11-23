import { NextResponse, type NextRequest } from "next/server";
import { ErrorOperacion, type Operacion, type Sesion } from "@/lib/datos/modelo";
import { ejecutar } from "@/lib/datos/servidor";

export const dynamic = "force-dynamic";

const SISTEMA: Sesion = { rol: "admin", id: "sistema", nombre: "Reservas en línea", subtitulo: "Sistema" };

// Límite sencillo por IP para la demo (en producción: Upstash/Redis + Turnstile).
const intentos = new Map<string, number[]>();

/** POST /api/reservas — reserva sin cuenta (nombre y celular). */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const ahora = Date.now();
  const recientes = (intentos.get(ip) ?? []).filter((t) => ahora - t < 10 * 60_000);
  if (recientes.length >= 8) return NextResponse.json({ error: "Demasiadas reservas seguidas. Intenta en unos minutos." }, { status: 429 });
  intentos.set(ip, [...recientes, ahora]);

  const body = (await req.json().catch(() => null)) as { op?: Operacion } | null;
  if (body?.op?.tipo !== "reservarInvitado") return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  try {
    ejecutar(body.op, SISTEMA);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ErrorOperacion) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "No se pudo reservar." }, { status: 500 });
  }
}
