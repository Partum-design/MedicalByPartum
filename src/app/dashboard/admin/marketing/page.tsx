"use client";

import { useMemo, useState } from "react";
import { Baby, Cake, MessageCircle, Send, Syringe, UserMinus, Users } from "lucide-react";
import { useClinica } from "@/lib/store";
import { ESQUEMA_VACUNACION, resumirPacientes, type Paciente } from "@/lib/datos/modelo";
import { Avatar, edad, Kpi, Modal, PageHead, useToast } from "@/components/ui";

type Segmento = { id: string; titulo: string; desc: string; icono: React.ReactNode; pacientes: Paciente[]; mensaje: string };

export default function Marketing() {
  const c = useClinica();
  const toast = useToast();
  const [abierto, setAbierto] = useState<Segmento | null>(null);
  const [texto, setTexto] = useState("");
  const [enviadas, setEnviadas] = useState<{ titulo: string; n: number; fecha: string }[]>([]);
  const segmentos = useMemo<Segmento[]>(() => {
    const resumen = new Map(resumirPacientes(c.citas).map((r) => [r.id, r]));
    const meses = (p: Paciente) => (p.fecha_nacimiento ? (Date.now() - new Date(p.fecha_nacimiento).getTime()) / (30.44 * 86_400_000) : 999);
    const pendientes = c.pacientes.filter((p) => meses(p) < 72 && ESQUEMA_VACUNACION.some((v) => v.meses <= meses(p) && !c.vacunas.some((a) => a.paciente_id === p.id && a.vacuna === v.vacuna && a.dosis === v.dosis)));
    const mes = new Date().getMonth();
    const n = c.clinicaConfig.nombre;
    return [
      { id: "vacunas", titulo: "Vacunas pendientes", desc: "Niños con alguna dosis del esquema sin aplicar", icono: <Syringe />, pacientes: pendientes, mensaje: `Hola, {tutor}. A {nombre} le toca una vacuna de su esquema. Agenda en ${n} en un minuto: {enlace}` },
      { id: "riesgo", titulo: "Pacientes sin volver", desc: "Llevan más del doble de su frecuencia habitual sin consulta", icono: <UserMinus />, pacientes: c.pacientes.filter((p) => resumen.get(p.id)?.enRiesgo), mensaje: `Hola, {nombre}. Hace tiempo no te vemos en ${n}. ¿Agendamos tu revisión? {enlace}` },
      { id: "cumple", titulo: "Cumpleaños del mes", desc: "Felicítalos con un detalle", icono: <Cake />, pacientes: c.pacientes.filter((p) => p.fecha_nacimiento && new Date(p.fecha_nacimiento + "T12:00:00").getMonth() === mes), mensaje: `¡Feliz cumpleaños, {nombre}! 🎉 Todo el equipo de ${n} te desea un gran año.` },
      { id: "influenza", titulo: "Campaña de influenza", desc: "Toda la base: temporada 2026–2027", icono: <Users />, pacientes: c.pacientes, mensaje: `Llegó la vacuna contra influenza 2026–27 a ${n}. Aplica desde los 6 meses. Agenda: {enlace}` },
      { id: "ninos", titulo: "Revisión de niño sano", desc: "Pacientes menores de 5 años", icono: <Baby />, pacientes: c.pacientes.filter((p) => meses(p) < 60), mensaje: `Hola, {tutor}. Es momento de la revisión de {nombre}: peso, talla y desarrollo. {enlace}` },
    ];
  }, [c.pacientes, c.citas, c.vacunas, c.clinicaConfig.nombre]);

  const enviar = () => {
    if (!abierto) return;
    setEnviadas([{ titulo: abierto.titulo, n: abierto.pacientes.length, fecha: new Date().toLocaleString("es-MX") }, ...enviadas]);
    toast.mostrar(`Mensaje programado para ${abierto.pacientes.length} pacientes (simulado)`);
    setAbierto(null);
  };
  const ejemplo = abierto?.pacientes[0];

  return (
    <>
      <PageHead titulo="Marketing" sub="Segmentos automáticos a partir de tus datos clínicos y recordatorios por WhatsApp." />
      <div className="grid gap-4 sm:grid-cols-3" style={{ marginBottom: 16 }}>
        <Kpi destacado label="Pacientes contactables" icono={<MessageCircle />} valor={c.pacientes.filter((p) => p.telefono).length} nota="con celular registrado" />
        <Kpi label="Vacunas pendientes" icono={<Syringe />} valor={segmentos[0].pacientes.length} nota="oportunidad inmediata" />
        <Kpi label="Campañas enviadas" icono={<Send />} valor={enviadas.length} nota="en esta sesión" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {segmentos.map((s) => (
          <div key={s.id} className="card card-pad card-hover anim-in">
            <div className="flex items-start justify-between">
              <span className="icon-tile">{s.icono}</span>
              <span className="chip chip-teal" style={{ fontSize: 14, height: 30 }}>{s.pacientes.length} pacientes</span>
            </div>
            <h3 style={{ fontSize: 17, marginTop: 14 }}>{s.titulo}</h3>
            <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>{s.desc}</p>
            <div className="flex" style={{ marginTop: 14 }}>
              {s.pacientes.slice(0, 6).map((p, i) => <span key={p.id} style={{ marginLeft: i ? -8 : 0, borderRadius: 99, boxShadow: "0 0 0 2px #fff" }}><Avatar nombre={p.nombre} size="is-sm" /></span>)}
            </div>
            <button type="button" className="btn btn-soft btn-sm" style={{ marginTop: 16, width: "100%" }} disabled={!s.pacientes.length} onClick={() => { setAbierto(s); setTexto(s.mensaje); }}>
              <MessageCircle /> Preparar WhatsApp
            </button>
          </div>
        ))}
      </div>
      {enviadas.length > 0 && (
        <div className="card card-pad anim-in" style={{ marginTop: 16 }}>
          <div className="card-title"><div><h2>Historial</h2></div></div>
          {enviadas.map((e, i) => <div key={i} className="list-row"><Send size={16} color="var(--teal)" /><span style={{ flex: 1 }}>{e.titulo}</span><span className="chip">{e.n} destinatarios</span><span style={{ fontSize: 12.5, color: "var(--soft)" }}>{e.fecha}</span></div>)}
        </div>
      )}
      <Modal abierto={!!abierto} onClose={() => setAbierto(null)} titulo={abierto?.titulo ?? ""} sub={`${abierto?.pacientes.length ?? 0} destinatarios · envío por WhatsApp simulado`} grande pie={<><button type="button" className="btn btn-ghost" onClick={() => setAbierto(null)}>Cancelar</button><button type="button" className="btn btn-grad" onClick={enviar}><Send /> Programar envío</button></>}>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="field"><span>Mensaje</span><textarea className="input" style={{ minHeight: 160 }} value={texto} onChange={(e) => setTexto(e.target.value)} /><small>Variables: {"{nombre}"}, {"{tutor}"}, {"{enlace}"}</small></label>
          <div>
            <div className="label" style={{ marginBottom: 8 }}>Vista previa</div>
            <div style={{ background: "#e5ddd5", borderRadius: 20, padding: 16, minHeight: 160 }}>
              <div style={{ background: "#dcf8c6", borderRadius: "14px 14px 4px 14px", padding: "10px 12px", fontSize: 14, maxWidth: "90%", marginLeft: "auto", boxShadow: "0 1px 1px rgba(0,0,0,.1)" }}>
                {texto.replace("{nombre}", ejemplo?.nombre.split(" ")[0] ?? "Ana").replace("{tutor}", ejemplo?.tutor?.split(" ")[0] || ejemplo?.nombre.split(" ")[0] || "Ana").replace("{enlace}", "vitalia.mx/reservar")}
              </div>
            </div>
            {ejemplo && <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 8 }}>Ejemplo con {ejemplo.nombre}{ejemplo.fecha_nacimiento ? ` (${edad(ejemplo.fecha_nacimiento)})` : ""}.</p>}
          </div>
        </div>
      </Modal>
      {toast.nodo}
    </>
  );
}
