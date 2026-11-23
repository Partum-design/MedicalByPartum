"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useClinica } from "@/lib/store";
import { Avatar, PageHead, Switch, useToast } from "@/components/ui";

export default function Perfil() {
  const c = useClinica();
  const toast = useToast();
  const yo = c.medicos.find((m) => m.id === c.sesion?.id);
  const [d, setD] = useState({ nombre: "", especialidad: "", cedula: "", biografia: "", experiencia: 0, telemedicina: false, acepta_domicilio: false, color: "#009D9D" });
  useEffect(() => {
    if (yo) setD({ nombre: yo.nombre, especialidad: yo.especialidad, cedula: yo.cedula, biografia: yo.biografia, experiencia: yo.experiencia, telemedicina: yo.telemedicina, acepta_domicilio: yo.acepta_domicilio, color: yo.color });
  }, [yo]);
  if (!yo) return null;
  return (
    <>
      <PageHead titulo="Mi perfil" sub="Así te ven los pacientes en la portada y al reservar." />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="card card-pad anim-in grid gap-3 sm:grid-cols-2">
          <label className="field"><span>Nombre</span><input className="input" value={d.nombre} onChange={(e) => setD({ ...d, nombre: e.target.value })} /></label>
          <label className="field"><span>Especialidad</span><input className="input" value={d.especialidad} onChange={(e) => setD({ ...d, especialidad: e.target.value })} /></label>
          <label className="field"><span>Cédula profesional</span><input className="input" value={d.cedula} onChange={(e) => setD({ ...d, cedula: e.target.value })} /></label>
          <label className="field"><span>Años de experiencia</span><input className="input" type="number" value={d.experiencia} onChange={(e) => setD({ ...d, experiencia: Number(e.target.value) })} /></label>
          <label className="field sm:col-span-2"><span>Biografía</span><textarea className="input" value={d.biografia} onChange={(e) => setD({ ...d, biografia: e.target.value })} /></label>
          <div className="flex items-center justify-between" style={{ padding: 12, borderRadius: 14, background: "var(--bg-2)" }}><span>Doy teleconsulta</span><Switch valor={d.telemedicina} etiqueta="Teleconsulta" onChange={(v) => setD({ ...d, telemedicina: v })} /></div>
          <div className="flex items-center justify-between" style={{ padding: 12, borderRadius: 14, background: "var(--bg-2)" }}><span>Visitas a domicilio</span><Switch valor={d.acepta_domicilio} etiqueta="Domicilio" onChange={(v) => setD({ ...d, acepta_domicilio: v })} /></div>
          <label className="field"><span>Color en la agenda</span><input type="color" className="input" style={{ padding: 4 }} value={d.color} onChange={(e) => setD({ ...d, color: e.target.value })} /></label>
          <div className="flex items-end justify-end sm:col-span-2">
            <button type="button" className="btn btn-grad" onClick={() => c.actualizarMedico(yo.id, d).ok && toast.mostrar("Perfil actualizado")}><Check /> Guardar</button>
          </div>
        </div>
        <div className="medico-card anim-in" style={{ height: "fit-content" }}>
          <div className="medico-foto" style={{ background: `linear-gradient(150deg, color-mix(in srgb, ${d.color} 18%, #fff), color-mix(in srgb, ${d.color} 42%, #fff))` }}>
            <Avatar nombre={d.nombre} color={d.color} size="is-xl" />
          </div>
          <div style={{ padding: 18 }}>
            <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: 17 }}>{d.nombre}</div>
            <div style={{ color: "var(--teal-700)" }}>{d.especialidad}</div>
            <div style={{ color: "var(--soft)", fontSize: 13, marginTop: 6 }}>Céd. prof. {d.cedula} · {d.experiencia} años</div>
            <p style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 10 }}>{d.biografia}</p>
          </div>
        </div>
      </div>
      {toast.nodo}
    </>
  );
}
