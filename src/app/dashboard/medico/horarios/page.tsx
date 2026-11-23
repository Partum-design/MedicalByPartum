"use client";

import { useClinica } from "@/lib/store";
import { PageHead } from "@/components/ui";
import { EditorHorario } from "@/components/panel/EditorHorario";

export default function Horarios() {
  const c = useClinica();
  if (!c.sesion) return null;
  return (
    <>
      <PageHead titulo="Mis horarios" sub="Tus horas de consulta. Los cambios se reflejan al instante en la reserva en línea." />
      <div className="card card-pad anim-in" style={{ maxWidth: 820 }}>
        <EditorHorario medicoId={c.sesion.id} />
      </div>
    </>
  );
}
