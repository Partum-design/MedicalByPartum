# Graph Report - .  (2026-07-21)

## Corpus Check
- Corpus is ~23,602 words - fits in a single context window. You may not need a graph.

## Summary
- 305 nodes · 440 edges · 17 communities (14 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Settings, Scheduling & Auth
- Accounts, Rewards & Team
- Marketing, Payments & FAQ
- Product Architecture
- Runtime Dependencies
- TypeScript Configuration
- Package Scripts
- API Handlers & Demo State
- Core Database Schema
- Vercel Deployment
- Admin Reporting
- Layout & Typography
- Payments & Slot Locking
- Middleware & Rate Limits
- Next.js Configuration

## God Nodes (most connected - your core abstractions)
1. `useDemoStore()` - 44 edges
2. `compilerOptions` - 16 edges
3. `PanelShell()` - 12 edges
4. `leerJSON()` - 8 edges
5. `public.clinicas` - 8 edges
6. `Medical OS` - 8 edges
7. `calcularLealtad()` - 7 edges
8. `public.usuarios` - 7 edges
9. `public.citas` - 7 edges
10. `scripts` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Google and Microsoft Calendar OAuth Sync` --semantically_similar_to--> `Telemedicine Event Synchronization`  [INFERRED] [semantically similar]
  README.md → docs/INTEGRACION_CALENDARIOS_OAUTH.md
- `Antibot and Antifraud Security` --conceptually_related_to--> `Edge Rate Limiting with Upstash Redis`  [INFERRED]
  README.md → docs/DESPLIEGUE_VERCEL.md
- `PagosPage()` --calls--> `useDemoStore()`  [EXTRACTED]
  src/app/cuenta/pagos/page.tsx → src/lib/demo-store.ts
- `EquipoMedicoPage()` --calls--> `useDemoStore()`  [EXTRACTED]
  src/app/dashboard/admin/equipo/page.tsx → src/lib/demo-store.ts
- `DashboardAdminPage()` --calls--> `useDemoStore()`  [EXTRACTED]
  src/app/dashboard/admin/page.tsx → src/lib/demo-store.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Medical OS Core Platform** — readme_nextjs_app_router, readme_supabase_platform, readme_vercel_platform [EXTRACTED 1.00]
- **Secure Booking Workflow** — readme_booking_flow, readme_antibot_antifraud_security, readme_slot_locking, readme_stripe_payments [EXTRACTED 1.00]
- **Bidirectional Calendar Synchronization Architecture** — docs_integracion_calendarios_oauth_google_calendar, docs_integracion_calendarios_oauth_microsoft_graph, docs_integracion_calendarios_oauth_webhook_resynchronization, docs_integracion_calendarios_oauth_subscription_renewal, docs_integracion_calendarios_oauth_telemedicine_event_sync [EXTRACTED 1.00]

## Communities (17 total, 3 thin omitted)

### Community 0 - "Settings, Scheduling & Auth"
Cohesion: 0.07
Nodes (43): ConfiguracionAdminPage(), HorariosPage(), DESTINOS, LoginPage(), ReservarPage(), FlujoReserva(), Medico, mxn (+35 more)

### Community 1 - "Accounts, Rewards & Team"
Cohesion: 0.09
Nodes (19): CuentaPage(), mxn, RecompensasPage(), EquipoMedicoPage(), formInicial, mxn, DashboardAdminPage(), mxn (+11 more)

### Community 2 - "Marketing, Payments & FAQ"
Cohesion: 0.09
Nodes (14): mxn, PagosPage(), FaqSection(), PREGUNTAS, MedicalOSExperience(), MODULOS, ViewMode, mxn (+6 more)

### Community 3 - "Product Architecture"
Cohesion: 0.08
Nodes (31): Vercel CI/CD Pipeline, Edge Rate Limiting with Upstash Redis, Environment Variable Configuration, Vercel Deployment Guide, Preview Database Isolation, Production Deployment Checklist, Server-Only Secrets, Vercel JSON Configuration (+23 more)

### Community 4 - "Runtime Dependencies"
Cohesion: 0.07
Nodes (29): date-fns, lucide-react, next, dependencies, date-fns, lucide-react, next, react (+21 more)

### Community 5 - "TypeScript Configuration"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, next-env.d.ts, .next/types/**/*.ts, node_modules, ./src/*, **/*.ts (+20 more)

### Community 6 - "Package Scripts"
Cohesion: 0.09
Nodes (22): devDependencies, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/three, typescript, name (+14 more)

### Community 7 - "API Handlers & Demo State"
Cohesion: 0.15
Nodes (10): POST(), verifyTurnstile(), POST(), POST(), DEMO_ADMIN_STATS, DEMO_CITAS, DEMO_MEDICOS, hoy (+2 more)

### Community 8 - "Core Database Schema"
Cohesion: 0.29
Nodes (11): public.citas, public.clinicas, public.expedientes, public.fn_handle_new_user(), public.historial_fidelidad, public.horarios_medicos, public.medicos, public.pagos (+3 more)

### Community 9 - "Vercel Deployment"
Cohesion: 0.20
Nodes (9): iad1, framework, functions, src/app/api/webhooks/stripe/route.ts, headers, redirects, regions, $schema (+1 more)

### Community 10 - "Admin Reporting"
Cohesion: 0.22
Nodes (6): CATEGORICAL_DARK, CATEGORICAL_LIGHT, mxn, mxnCompact, ReportesPage(), useEsDark()

### Community 11 - "Layout & Typography"
Cohesion: 0.33
Nodes (4): metadata, outfit, plexMono, plexSans

## Knowledge Gaps
- **110 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+105 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useDemoStore()` connect `Settings, Scheduling & Auth` to `Accounts, Rewards & Team`, `Marketing, Payments & FAQ`, `Admin Reporting`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Runtime Dependencies` to `Package Scripts`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _110 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Settings, Scheduling & Auth` be split into smaller, more focused modules?**
  _Cohesion score 0.06708595387840671 - nodes in this community are weakly interconnected._
- **Should `Accounts, Rewards & Team` be split into smaller, more focused modules?**
  _Cohesion score 0.08522727272727272 - nodes in this community are weakly interconnected._
- **Should `Marketing, Payments & FAQ` be split into smaller, more focused modules?**
  _Cohesion score 0.08870967741935484 - nodes in this community are weakly interconnected._
- **Should `Product Architecture` be split into smaller, more focused modules?**
  _Cohesion score 0.08387096774193549 - nodes in this community are weakly interconnected._