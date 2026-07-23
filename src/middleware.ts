import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Rate limiting estricto en el Edge para endpoints sensibles a bots.
// Límite por IP y por sesión (cookie sb-*) sobre búsqueda y reservas.
const hasRedis =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const limiters = hasRedis
  ? (() => {
      const redis = Redis.fromEnv();
      return {
        // Anti-scraping del directorio de barberos
        search: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(30, "60 s"),
          prefix: "rl:search",
        }),
        // Anti appointment-scalping
        bookings: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(5, "60 s"),
          prefix: "rl:bookings",
        }),
      };
    })()
  : null;

export async function middleware(req: NextRequest) {
  // Sin Redis configurado (entorno demo/local) el middleware no limita.
  if (!limiters) return NextResponse.next();

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "anon";
  const session = req.cookies.get("sb-access-token")?.value?.slice(0, 32) ?? "";
  const key = `${ip}:${session}`;

  const limiter = req.nextUrl.pathname.startsWith("/api/bookings")
    ? limiters.bookings
    : limiters.search;

  const { success, reset } = await limiter.limit(key);
  if (!success) {
    return NextResponse.json(
      { error: "Demasiadas peticiones. Intenta más tarde." },
      { status: 429, headers: { "Retry-After": String(reset) } }
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/bookings/:path*", "/api/search/:path*"],
};
