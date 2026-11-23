# Medical OS · por Partum

Sitio público de la clínica y sistema de gestión médica (agenda, expediente
clínico, cartilla de vacunación, cobros, inventario, reportes, marketing,
lealtad e integraciones con Google). Es la versión médica de BarberOS,
rediseñada con la identidad de Medical OS.

> **Demo sin base de datos.** La información es ficticia (Clínica Vitalia) y se
> simula en dos capas: el navegador guarda la base completa en `localStorage`
> y un servidor simulado (`/api/datos`) valida y replica cada operación con las
> mismas reglas de negocio. Para producción basta con sustituir
> `src/lib/datos/servidor.ts` por consultas a Supabase/PostgreSQL.

## Arrancar

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`. Entra en `/login` y elige un rol (sin contraseñas):

| Rol | Cuentas de ejemplo | Qué puede hacer |
|---|---|---|
| Administración | Recepción Vitalia | Panel con métricas, agenda de todo el equipo, llegadas por QR, pacientes, equipo médico y permisos, horarios, servicios, inventario con lotes y caducidad, caja, reportes, marketing, lealtad, integraciones y configuración |
| Médico | Dra. Mariana Torres (pediatría, ya con Google Calendar), Dr. Alejandro Ruiz, Dra. Sofía Hernández, Dr. Daniel Ortega, Enf. Valeria Méndez | Su agenda, iniciar consulta, notas SOAP con signos vitales, curva de crecimiento, recetas imprimibles, aplicar vacunas, horarios, Google Calendar y perfil |
| Paciente | Lucía Ramírez (adulta), Mateo Ramírez (bebé de 11 meses, le toca la vacuna de primer año) | Agendar, sus citas con QR, expediente, cartilla de vacunación, pagos y tarjeta (si la lealtad está encendida) |

También se puede reservar **sin cuenta** (nombre y celular), registrarse como
paciente nuevo o entrar con **Google** (pantalla de consentimiento simulada).

## Lo principal

- **Reserva en línea** en 4 pasos: servicio → especialista (o "primero disponible") y
  modalidad (consultorio, telemedicina, domicilio) → día y hora libres en tiempo real →
  datos. Confirmación con código QR, botón **Agregar a Google Calendar**, archivo `.ics`
  y WhatsApp.
- **Google Calendar por médico** (`/google/autorizar`): flujo OAuth simulado (elegir
  cuenta → permisos → regreso). Con la conexión activa, cada cita creada, movida o
  cancelada se refleja como evento, y los eventos personales del médico **bloquean**
  esas horas en la reserva en línea.
- **Expediente clínico**: notas SOAP, signos vitales, curva de crecimiento pediátrica,
  recetas imprimibles, alergias y tutor.
- **Cartilla de vacunación** con esquema por edad; al aplicar una dosis se descuenta
  del inventario.
- **Lealtad**: el módulo existe pero viene **apagado**. Se enciende con el interruptor en
  *Administración → Lealtad*; apagado no se muestra a los pacientes ni en la portada.
- **Preloader de marca** que dibuja el isotipo trazo por trazo (una vez por sesión).
- Reiniciar los datos: *Integraciones → Base de datos* o *Configuración*.

## Estructura

```
src/lib/datos/modelo.ts         tipos, reglas de negocio y permisos (corre en navegador y servidor)
src/lib/datos/semilla.ts        datos de ejemplo deterministas alrededor de "hoy"
src/lib/datos/servidor.ts       base simulada en memoria del servidor
src/lib/store.ts                almacén del navegador (localStorage + sincronización)
src/app/api/                    auth demo (cookie), datos y reservas
src/components/                 portada, citas, expediente, Google, panel y UI
```

Paleta: `#009D9D` `#2C506D` `#04BFAD` `#55D9A8` `#0D0D0D` · Tipografía: Outfit.
