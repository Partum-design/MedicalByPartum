"use client";

import { useClinica } from "@/lib/store";
import { PageHead } from "@/components/ui";
import { Agenda } from "@/components/citas/Agenda";
import { claveDia } from "@/components/ui";

export default function Citas() {
  const c = useClinica();
  const hoy = c.citas.filter((x) => claveDia(x.inicio) === claveDia(Date.now()) && x.estado !== "cancelada");
  return (
    <>
      <PageHead titulo="Agenda y citas" sub={`${hoy.length} citas hoy · ${hoy.filter((x) => x.estado === "asistida").length} atendidas`} />
      <Agenda medicos={c.medicos.filter((m) => m.activo)} />
    </>
  );
}
