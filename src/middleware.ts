import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Rate limiting estricto en el Edge para endpoints sensibles a bots.
// Límite por IP y por sesión (cookie sb-*) sobre búsqueda y reservas.
const redis = Redis.fromEnv();

const limiters = {
  // Anti-scraping del directorio de médicos
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

export async function middleware(req: NextRequest) {
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
