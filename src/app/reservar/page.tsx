"use client";

import Link from "next/link";
import { FlujoReserva } from "@/components/booking/FlujoReserva";
import { MEDICOS_DEMO } from "@/lib/demo-store";

// Nodo Paciente: búsqueda de médicos + reserva con bloqueo de slot.
// En esta demo los médicos y las citas viven en el almacén local del navegador.
export default function ReservarPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <header className="anim-in mb-8">
        <Link href="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          ← Inicio
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Agendar una cita</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-muted)" }}>
          Elige a tu especialista, verifica tu teléfono y asegura tu horario.
        </p>
      </header>
      <FlujoReserva medicos={MEDICOS_DEMO} demo />
    </main>
  );
}
