"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Baby, Download, Trash2, UserPlus, Users } from "lucide-react";
import { useClinica } from "@/lib/store";
import { resumirPacientes } from "@/lib/datos/modelo";
import { Avatar, diaCorto, edad, Modal, moneda, PageHead, Segmented, useToast, Vacio } from "@/components/ui";
import { Expediente } from "@/components/pacientes/Expediente";

type Filtro = "todos" | "pediatricos" | "riesgo" | "nuevos";

function Lista({ base }: { base: string }) {
  const c = useClinica();
  const router = useRouter();
  const q = useSearchParams();
  const toast = useToast();
  const id = q.get("id");
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [alta, setAlta] = useState(false);
  const [np, setNp] = useState({ nombre: "", telefono: "", email: "", fecha_nacimiento: "", tutor: "", alergias: "" });
  const admin = c.sesion?.rol === "admin";
  const resumen = useMemo(() => new Map(resumirPacientes(c.citas).map((r) => [r.id, r])), [c.citas]);
  const propios = c.sesion?.rol === "medico" ? new Set(c.citas.filter((x) => x.medico_id === c.sesion!.id).map((x) => x.paciente_id)) : null;

  const lista = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return c.pacientes
      .filter((p) => !propios || propios.has(p.id) || p.registrado_por === c.sesion?.id)
      .filter((p) => !t || p.nombre.toLowerCase().includes(t) || p.telefono.includes(t) || (p.tutor ?? "").toLowerCase().includes(t))
      .filter((p) => {
        const meses = p.fecha_nacimiento ? (Date.now() - new Date(p.fecha_nacimiento).getTime()) / (30.44 * 86_400_000) : 999;
        if (filtro === "pediatricos") return meses < 15 * 12;
        if (filtro === "riesgo") return resumen.get(p.id)?.enRiesgo;
        if (filtro === "nuevos") return Date.now() - new Date(p.creado_en).getTime() < 30 * 86_400_000;
        return true;
      })
      .sort((a, b) => (resumen.get(b.id)?.ultimaVisita ?? "").localeCompare(resumen.get(a.id)?.ultimaVisita ?? ""));
  }, [c.pacientes, busca, filtro, resumen, propios, c.sesion]);

  if (id) return <Expediente pacienteId={id} citaId={q.get("cita")} onVolver={() => router.push(base)} />;

  const exportar = () => {
    const filas = [["Nombre", "Teléfono", "Correo", "Nacimiento", "Tutor", "Consultas", "Última visita"], ...lista.map((p) => [p.nombre, p.telefono, p.email, p.fecha_nacimiento ?? "", p.tutor ?? "", String(resumen.get(p.id)?.visitas ?? 0), resumen.get(p.id)?.ultimaVisita?.slice(0, 10) ?? ""])];
    const csv = filas.map((f) => f.map((x) => `"${x.replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" }));
    a.download = "pacientes.csv";
    a.click();
  };

  return (
    <>
      <PageHead titulo={admin ? "Pacientes" : "Expedientes"} sub={`${lista.length} de ${propios ? propios.size : c.pacientes.length} pacientes`}>
        {admin && <button type="button" className="btn btn-ghost btn-sm" onClick={exportar}><Download /> Exportar CSV</button>}
        {c.permisos.registrar_pacientes && <button type="button" className="btn btn-grad btn-sm" onClick={() => setAlta(true)}><UserPlus /> Nuevo paciente</button>}
      </PageHead>
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="flex flex-wrap items-center gap-3" style={{ padding: 16, borderBottom: "1px solid var(--line-2)" }}>
          <input className="input input-search" style={{ maxWidth: 360 }} placeholder="Buscar por nombre, teléfono o tutor" value={busca} onChange={(e) => setBusca(e.target.value)} />
          <Segmented valor={filtro} onChange={setFiltro} opciones={[{ id: "todos", label: "Todos" }, { id: "pediatricos", label: <span className="inline-flex items-center gap-1"><Baby size={14} /> Pediátricos</span> }, { id: "riesgo", label: <span className="inline-flex items-center gap-1"><AlertTriangle size={14} /> Sin volver</span> }, { id: "nuevos", label: "Nuevos" }]} />
        </div>
        {lista.length === 0 ? (
          <Vacio icono={<Users />} titulo="Sin pacientes que coincidan" />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Paciente</th><th>Edad</th><th>Contacto</th><th>Consultas</th><th>Última visita</th><th>Próxima</th>{admin && <th style={{ textAlign: "right" }}>Consumo</th>}{admin && <th></th>}</tr></thead>
              <tbody>
                {lista.map((p) => {
                  const r = resumen.get(p.id);
                  return (
                    <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => router.push(`${base}?id=${p.id}`)}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar nombre={p.nombre} size="is-sm" />
                          <div>
                            <div style={{ fontWeight: 500, color: "var(--navy)" }}>{p.nombre}</div>
                            {p.tutor && <div style={{ fontSize: 12, color: "var(--muted)" }}>Tutor: {p.tutor}</div>}
                          </div>
                          {p.alergias && p.alergias !== "Ninguna conocida" && <span className="chip chip-danger" style={{ height: 22 }}>Alergia</span>}
                          {r?.enRiesgo && <span className="chip chip-warn" style={{ height: 22 }}>Sin volver</span>}
                        </div>
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>{edad(p.fecha_nacimiento) || "—"}</td>
                      <td style={{ color: "var(--muted)" }}>{p.telefono || "—"}</td>
                      <td className="tnum">{r?.visitas ?? 0}</td>
                      <td style={{ textTransform: "capitalize", whiteSpace: "nowrap" }}>{r?.ultimaVisita ? diaCorto(r.ultimaVisita) : "—"}</td>
                      <td style={{ textTransform: "capitalize", whiteSpace: "nowrap" }}>{r?.proximaCita ? <span className="chip chip-teal">{diaCorto(r.proximaCita)}</span> : "—"}</td>
                      {admin && <td className="tnum" style={{ textAlign: "right" }}>{moneda.format(r?.gastoTotal ?? 0)}</td>}
                      {admin && (
                        <td onClick={(e) => e.stopPropagation()}>
                          <button type="button" className="btn btn-ghost btn-icon" aria-label="Eliminar" onClick={() => confirm(`¿Eliminar a ${p.nombre}? Sus citas atendidas se quedan en caja.`) && c.eliminarPaciente(p.id) && toast.mostrar("Paciente eliminado")}>
                            <Trash2 size={15} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal
        abierto={alta}
        onClose={() => setAlta(false)}
        titulo="Nuevo paciente"
        pie={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setAlta(false)}>Cancelar</button>
            <button
              type="button"
              className="btn btn-grad"
              onClick={() => {
                if (np.nombre.trim().length < 3) return alert("Escribe el nombre completo.");
                const r = c.registrarPaciente(np);
                if (!r.paciente) return alert(r.error);
                setAlta(false);
                setNp({ nombre: "", telefono: "", email: "", fecha_nacimiento: "", tutor: "", alergias: "" });
                router.push(`${base}?id=${r.paciente.id}`);
              }}
            >
              <UserPlus /> Registrar
            </button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="field sm:col-span-2"><span>Nombre completo</span><input className="input" value={np.nombre} onChange={(e) => setNp({ ...np, nombre: e.target.value })} /></label>
          <label className="field"><span>Celular</span><input className="input" inputMode="tel" value={np.telefono} onChange={(e) => setNp({ ...np, telefono: e.target.value })} /></label>
          <label className="field"><span>Correo</span><input className="input" type="email" value={np.email} onChange={(e) => setNp({ ...np, email: e.target.value })} /></label>
          <label className="field"><span>Fecha de nacimiento</span><input className="input" type="date" value={np.fecha_nacimiento} onChange={(e) => setNp({ ...np, fecha_nacimiento: e.target.value })} /></label>
          <label className="field"><span>Tutor (menores)</span><input className="input" value={np.tutor} onChange={(e) => setNp({ ...np, tutor: e.target.value })} /></label>
          <label className="field sm:col-span-2"><span>Alergias</span><input className="input" value={np.alergias} onChange={(e) => setNp({ ...np, alergias: e.target.value })} placeholder="Ninguna conocida" /></label>
        </div>
      </Modal>
      {toast.nodo}
    </>
  );
}

export function ListaPacientes({ base }: { base: string }) {
  return (
    <Suspense>
      <Lista base={base} />
    </Suspense>
  );
}
