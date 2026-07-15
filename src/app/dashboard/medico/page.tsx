import { createClient } from "@/lib/supabase/server";
import { AgendaMedico, type CitaAgenda } from "@/components/dashboard/AgendaMedico";
import { redirect } from "next/navigation";

// Dashboard del Médico (Server Component).
// RLS garantiza que la query solo devuelve citas del médico autenticado.
export default async function DashboardMedicoPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const hoy = new Date();
  const inicioDia = new Date(hoy.setHours(0, 0, 0, 0)).toISOString();
  const finSemana = new Date(hoy.getTime() + 7 * 86_400_000).toISOString();

  const { data: citas, error } = await supabase
    .from("citas")
    .select(`
      id, inicio, fin, modalidad, estado, precio, enlace_videollamada,
      paciente:usuarios ( nombre, apellidos, avatar_url )
    `)
    .gte("inicio", inicioDia)
    .lte("inicio", finSemana)
    .in("estado", ["confirmada", "asistida"])
    .order("inicio", { ascending: true });

  if (error) throw new Error(`Error cargando agenda: ${error.message}`);

  return <AgendaMedico citas={(citas ?? []) as unknown as CitaAgenda[]} />;
}
