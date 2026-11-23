"use client";

import { useEffect, useState } from "react";
import { Check, ExternalLink, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useClinica } from "@/lib/store";
import type { ClinicaConfig } from "@/lib/datos/modelo";
import { PageHead, useToast } from "@/components/ui";

const CAMPOS: [keyof ClinicaConfig, string, string?][] = [
  ["nombre", "Nombre de la clínica"],
  ["eslogan", "Frase de la portada"],
  ["direccion", "Dirección"],
  ["mapa_url", "Enlace de Google Maps"],
  ["telefono", "Teléfono"],
  ["whatsapp", "WhatsApp"],
  ["email", "Correo"],
  ["instagram", "Instagram"],
  ["facebook", "Facebook"],
  ["anio_fundacion", "Año de fundación"],
];

export default function Configuracion() {
  const c = useClinica();
  const toast = useToast();
  const [d, setD] = useState<ClinicaConfig>(c.clinicaConfig);
  useEffect(() => setD(c.clinicaConfig), [c.clinicaConfig]);
  return (
    <>
      <PageHead titulo="Configuración" sub="Datos de la clínica que publica la portada y aparecen en recetas y recordatorios.">
        <Link href="/" className="btn btn-ghost btn-sm"><ExternalLink /> Ver portada</Link>
      </PageHead>
      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="card card-pad anim-in grid gap-3 sm:grid-cols-2">
          {CAMPOS.map(([k, label]) => (
            <label key={k} className="field"><span>{label}</span><input className="input" value={String(d[k] ?? "")} onChange={(e) => setD({ ...d, [k]: e.target.value })} /></label>
          ))}
          <label className="field sm:col-span-2"><span>Descripción («Visítanos»)</span><textarea className="input" value={d.descripcion} onChange={(e) => setD({ ...d, descripcion: e.target.value })} /></label>
          <div className="flex justify-end sm:col-span-2">
            <button type="button" className="btn btn-grad" onClick={() => c.actualizarClinicaConfig(d).ok && toast.mostrar("Configuración guardada")}><Check /> Guardar</button>
          </div>
        </div>
        <div className="card card-pad anim-in" style={{ height: "fit-content" }}>
          <h3 style={{ fontSize: 16 }}>Datos de la demo</h3>
          <p style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 6 }}>Todo lo que ves son datos de ejemplo guardados en este navegador. Puedes volver al estado inicial cuando quieras; la agenda se regenera alrededor de hoy.</p>
          <button type="button" className="btn btn-ghost" style={{ marginTop: 14, width: "100%" }} onClick={async () => { if (confirm("¿Restablecer todos los datos de ejemplo?")) { await c.restablecerDemo(); toast.mostrar("Datos restablecidos"); } }}><RotateCcw /> Restablecer datos</button>
        </div>
      </div>
      {toast.nodo}
    </>
  );
}
