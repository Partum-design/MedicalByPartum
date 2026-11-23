"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Check, CalendarDays } from "lucide-react";
import { useClinica } from "@/lib/store";
import { Logo } from "@/components/marca/Logo";
import { Cargando, diaLargo, EstadoChip, hora } from "@/components/ui";

// Destino del QR de la cita: al personal le permite confirmar la llegada;
// al paciente le muestra los datos de su cita.
function Contenido() {
  const c = useClinica();
  const id = useSearchParams().get("cita") ?? "";
  if (!c.listo) return <Cargando />;
  const cita = c.citas.find((x) => x.id === id);
  const staff = c.sesion?.rol === "admin" || c.sesion?.rol === "medico";
  return (
    <div className="grid min-h-dvh place-items-center" style={{ background: "var(--bg-2)", padding: 16 }}>
      <div className="card anim-in" style={{ width: "min(440px,100%)", padding: 28, borderRadius: 30, textAlign: "center" }}>
        <Logo alto={28} />
        {!cita ? (
          <p style={{ marginTop: 24, color: "var(--muted)" }}>No encontramos esta cita. Inicia sesión como personal de la clínica para confirmar llegadas.</p>
        ) : (
          <>
            <h1 style={{ fontSize: 24, marginTop: 24 }}>{cita.paciente_nombre || "Cita"}</h1>
            <p style={{ color: "var(--muted)", marginTop: 4 }}>{cita.servicio_nombre} · {cita.medico_nombre}</p>
            <p className="flex items-center justify-center gap-2" style={{ marginTop: 10, color: "var(--navy)" }}><CalendarDays size={16} /> {diaLargo(cita.inicio)} · {hora(cita.inicio)}</p>
            <div style={{ marginTop: 14 }}><EstadoChip estado={cita.estado} /></div>
            {staff && cita.estado === "confirmada" && (
              <button type="button" className="btn btn-grad btn-lg" style={{ marginTop: 22, width: "100%" }} onClick={() => c.confirmarLlegada(cita.id)}>
                <Check /> Confirmar llegada
              </button>
            )}
          </>
        )}
        <Link href={staff ? (c.sesion?.rol === "admin" ? "/dashboard/admin/confirmar" : "/dashboard/medico/confirmar") : "/login"} className="btn btn-ghost" style={{ marginTop: 14, width: "100%" }}>
          {staff ? "Ir a recepción" : "Iniciar sesión"}
        </Link>
      </div>
    </div>
  );
}

export default function Pagina() {
  return <Suspense><Contenido /></Suspense>;
}
