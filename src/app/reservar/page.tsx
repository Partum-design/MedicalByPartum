import { FlujoReserva } from "@/components/booking/FlujoReserva";
import { DEMO_MODE, DEMO_MEDICOS } from "@/lib/demo";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

// Nodo Paciente: búsqueda de médicos + reserva con bloqueo de slot.
export default async function ReservarPage() {
  let medicos = DEMO_MEDICOS;

  if (!DEMO_MODE) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("directorio_medicos")
      .select("id, nombre, apellidos, especialidad, precio_consulta, duracion_cita_min, acepta_telemedicina, biografia");
    medicos = (data ?? []).map((m) => ({
      id: m.id,
      nombre: `${m.nombre} ${m.apellidos ?? ""}`.trim(),
      especialidad: m.especialidad,
      precio_consulta: Number(m.precio_consulta),
      duracion_cita_min: m.duracion_cita_min,
      acepta_telemedicina: m.acepta_telemedicina,
      biografia: m.biografia ?? "",
    }));
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <header className="mb-8">
        <Link href="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          ← Inicio
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Agendar una cita</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-muted)" }}>
          Elige a tu especialista, verifica tu teléfono y asegura tu horario.
        </p>
      </header>
      <FlujoReserva medicos={medicos} demo={DEMO_MODE} />
    </main>
  );
}
