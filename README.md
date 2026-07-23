# Barber OS

SaaS B2B para la gestión de barberías y barberos independientes, construido con **Next.js 15 (App Router)**, **Supabase** (PostgreSQL + Auth + RLS + Realtime) y desplegado en **Vercel**.

## Nodos de usuario

| Nodo | Acceso | Capacidades |
|---|---|---|
| **Cliente** | Público / autenticado | Buscar barberos, ver disponibilidad en tiempo real (Supabase Realtime sobre `citas`), reservar con bloqueo de slot de 10 min y pagar con Stripe |
| **Barbero** | Privado | Agenda diaria/semanal, fichas de servicio y preferencias por cliente, configuración de horarios, conexión de Google Calendar / Outlook |
| **Admin de barbería** | Privado | Altas/bajas de barberos, reportes financieros, configuración de recompensas y pasarela de pagos |

## Arquitectura

```
Next.js (Vercel)
├── Middleware Edge ─ rate limiting por IP+sesión (Upstash Redis)
├── Server Components ─ queries con anon key protegidas por RLS
├── Route Handlers (service_role)
│   ├── /api/bookings ─ Turnstile + OTP + fn_bloquear_slot (RPC)
│   ├── /api/webhooks/stripe ─ confirma pagos → dispara fidelización
│   └── /api/calendar/* ─ OAuth2 + sync bidireccional Google/Microsoft
└── Supabase
    ├── PostgreSQL con RLS multi-tenant (barberia_id)
    ├── Trigger de fidelización (5 citas asistidas+pagadas → recompensa)
    ├── Exclusion constraint anti doble-reserva (tstzrange + gist)
    └── pg_cron ─ libera slots bloqueados no pagados cada minuto
```

## Seguridad antibots / antifraude

- **Cloudflare Turnstile** invisible en el flujo de reserva (verificación server-side).
- **Rate limiting** estricto en `src/middleware.ts` sobre `/api/bookings` y `/api/search`.
- **OTP obligatorio** (Twilio Verify vía SMS/WhatsApp): `fn_bloquear_slot` rechaza clientes sin `telefono_verificado`.
- **Bloqueo de slot 10 min**: `citas.bloqueo_expira_en` + limpieza por `pg_cron`; máximo 3 bloqueos simultáneos por cliente.
- **RLS**: barberos solo leen sus citas; admins solo datos de su barbería; los tokens OAuth nunca se exponen (vista `directorio_barberos`).

## Documentación

- [`supabase/migrations/00001_init.sql`](supabase/migrations/00001_init.sql) — esquema completo, triggers, RPCs y políticas RLS.
- [`docs/DESPLIEGUE_VERCEL.md`](docs/DESPLIEGUE_VERCEL.md) — variables de entorno, `vercel.json` y CI/CD.
- [`docs/INTEGRACION_CALENDARIOS_OAUTH.md`](docs/INTEGRACION_CALENDARIOS_OAUTH.md) — flujo OAuth2 bidireccional con Google y Microsoft.

## Inicio rápido

```bash
cp .env.example .env.local        # completa las credenciales
npm install
npx supabase link --project-ref <ref>
npx supabase db push              # aplica supabase/migrations/
npm run dev
```

Dashboard del barbero de ejemplo: `src/app/dashboard/barbero/page.tsx` (paleta dorada/oxblood con dark mode).
