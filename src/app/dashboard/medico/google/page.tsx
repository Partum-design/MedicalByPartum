"use client";

import { useClinica } from "@/lib/store";
import { PageHead } from "@/components/ui";
import { PanelGoogle } from "@/components/google/PanelGoogle";

export default function Google() {
  const c = useClinica();
  if (!c.sesion) return null;
  return (
    <>
      <PageHead titulo="Google Calendar" sub="Tu agenda de Medical OS y tu calendario personal, siempre de acuerdo." />
      <PanelGoogle medicoId={c.sesion.id} volver="/dashboard/medico/google" />
    </>
  );
}
