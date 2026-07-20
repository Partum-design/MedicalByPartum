# Medical OS

SaaS B2B para la gestión de negocios médicos (clínicas y consultorios independientes), construido con **Next.js 15 (App Router)**, **Supabase** (PostgreSQL + Auth + RLS + Realtime) y desplegado en **Vercel**.

## Nodos de usuario

| Nodo | Acceso | Capacidades |
|---|---|---|
| **Paciente** | Público / autenticado | Buscar médicos, ver disponibilidad en tiempo real (Supabase Realtime sobre `citas`), reservar con bloqueo de slot de 10 min y pagar con Stripe |
| **Médico** | Privado | Agenda diaria/semanal, expedientes clínicos básicos, configuración de horarios, conexión de Google Calendar / Outlook |
| **Admin de clínica** | Privado | Altas/bajas de médicos, reportes financieros, configuración de recompensas y pasarela de pagos |

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
    ├── PostgreSQL con RLS multi-tenant (clinica_id)
    ├── Trigger de fidelización (5 citas asistidas+pagadas → recompensa)
    ├── Exclusion constraint anti doble-reserva (tstzrange + gist)
    └── pg_cron ─ libera slots bloqueados no pagados cada minuto
```

## Seguridad antibots / antifraude

- **Cloudflare Turnstile** invisible en el flujo de reserva (verificación server-side).
- **Rate limiting** estricto en `src/middleware.ts` sobre `/api/bookings` y `/api/search`.
- **OTP obligatorio** (Twilio Verify vía SMS/WhatsApp): `fn_bloquear_slot` rechaza pacientes sin `telefono_verificado`.
- **Bloqueo de slot 10 min**: `citas.bloqueo_expira_en` + limpieza por `pg_cron`; máximo 3 bloqueos simultáneos por paciente.
- **RLS**: médicos solo leen sus citas; admins solo datos de su clínica; los tokens OAuth nunca se exponen (vista `directorio_medicos`).

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

Dashboard del médico de ejemplo: `src/app/dashboard/medico/page.tsx` + `src/components/dashboard/AgendaMedico.tsx` (paleta azul/cian con dark mode).
