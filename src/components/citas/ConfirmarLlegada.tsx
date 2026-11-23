"use client";

import { useMemo, useState } from "react";
import { Camera, CameraOff, Check, Keyboard, ScanLine, Search } from "lucide-react";
import { useClinica } from "@/lib/store";
import { idDeCitaEnTexto, type Cita } from "@/lib/datos/modelo";
import { Avatar, claveDia, EstadoChip, hora, moneda, PageHead, Vacio, useToast } from "@/components/ui";
import { EscanerQR } from "@/components/citas/EscanerQR";

/** Recepción: escanea el QR de la cita (o busca al paciente) y confirma la llegada. */
export function ConfirmarLlegada() {
  const c = useClinica();
  const toast = useToast();
  const [camara, setCamara] = useState(false);
  const [texto, setTexto] = useState("");
  const [leida, setLeida] = useState<Cita | null>(null);
  const [error, setError] = useState<string | null>(null);
  const propias = c.sesion?.rol === "medico" && !c.permisos.ver_agenda_completa;

  const hoy = useMemo(
    () =>
      c.citas
        .filter((x) => claveDia(x.inicio) === claveDia(Date.now()) && x.estado !== "cancelada" && (!propias || x.medico_id === c.sesion?.id))
        .sort((a, b) => a.inicio.localeCompare(b.inicio)),
    [c.citas, propias, c.sesion]
  );
  const filtradas = texto.trim() && !idDeCitaEnTexto(texto) ? hoy.filter((x) => x.paciente_nombre.toLowerCase().includes(texto.toLowerCase())) : hoy;

  const leer = (t: string) => {
    setError(null);
    const id = idDeCitaEnTexto(t);
    const cita = id ? c.citas.find((x) => x.id === id) : null;
    if (!cita) return setError("No encontramos esa cita. Revisa el código o búscala por nombre.");
    setLeida(cita);
    setCamara(false);
  };

  const confirmar = (x: Cita) => {
    const r = c.confirmarLlegada(x.id);
    if (!r.ok) return setError(r.error);
    toast.mostrar(`Llegada de ${x.paciente_nombre} confirmada`);
    setLeida(null);
  };

  const actual = leida ? c.citas.find((x) => x.id === leida.id) ?? leida : null;
  const pendientes = hoy.filter((x) => x.estado === "confirmada").length;

  return (
    <>
      <PageHead titulo="Confirmar llegada" sub={`${pendientes} pacientes por llegar hoy · ${hoy.length - pendientes} ya registrados`} />
      <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
        <div className="grid content-start gap-4">
          <div className="card card-pad anim-in">
            <div className="card-title">
              <div>
                <h2>Escanear código QR</h2>
                <p>El paciente lo tiene en su confirmación y en su cuenta</p>
              </div>
              <span className="icon-tile is-sm"><ScanLine /></span>
            </div>
            {camara ? (
              <EscanerQR onLeer={leer} pausado={!!actual} />
            ) : (
              <button type="button" className="grid w-full place-items-center gap-2" style={{ aspectRatio: "4/3", borderRadius: 24, border: "2px dashed var(--teal-100)", background: "var(--teal-50)", color: "var(--teal-700)" }} onClick={() => setCamara(true)}>
                <Camera size={34} />
                <b style={{ fontWeight: 600 }}>Abrir cámara</b>
              </button>
            )}
            {camara && (
              <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => setCamara(false)}>
                <CameraOff /> Cerrar cámara
              </button>
            )}
            <form className="flex gap-2" style={{ marginTop: 14 }} onSubmit={(e) => { e.preventDefault(); leer(texto); }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input className="input" placeholder="Folio (c-00123) o nombre" value={texto} onChange={(e) => setTexto(e.target.value)} style={{ paddingLeft: 40 }} />
                <Keyboard size={17} style={{ position: "absolute", left: 13, top: 14, color: "var(--soft)" }} />
              </div>
              <button className="btn btn-primary btn-icon" aria-label="Buscar" style={{ width: 46, minHeight: 46 }}><Search size={18} /></button>
            </form>
            {error && <p style={{ color: "var(--danger)", fontSize: 13.5, marginTop: 8 }}>{error}</p>}
          </div>
          {actual && (
            <div className="credencial anim-in">
              <div className="flex items-center gap-3">
                <Avatar nombre={actual.paciente_nombre} size="is-lg" color="#0b6f75" />
                <div>
                  <div style={{ fontSize: 19, fontWeight: 600 }}>{actual.paciente_nombre}</div>
                  <div style={{ opacity: 0.85, fontSize: 14 }}>{actual.servicio_nombre} · {hora(actual.inicio)}</div>
                  <div style={{ opacity: 0.85, fontSize: 13 }}>{actual.medico_nombre}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2" style={{ marginTop: 18 }}>
                {actual.estado === "confirmada" ? (
                  <button type="button" className="btn btn-white" onClick={() => confirmar(actual)}><Check /> Confirmar llegada</button>
                ) : (
                  <span className="chip" style={{ background: "#fff" }}>Ya registrada: {actual.estado === "asistida" ? `llegó ${actual.llegada_en ? hora(actual.llegada_en) : ""}` : actual.estado}</span>
                )}
                <button type="button" className="btn btn-outline-white" onClick={() => setLeida(null)}>Cerrar</button>
              </div>
            </div>
          )}
        </div>
        <div className="card anim-in" style={{ overflow: "hidden" }}>
          <div className="card-title" style={{ padding: "20px 20px 0" }}>
            <div><h2>Citas de hoy</h2><p>{propias ? "Tu agenda" : "Toda la clínica"}</p></div>
          </div>
          {filtradas.length === 0 ? (
            <Vacio icono={<ScanLine />} titulo="Sin citas que coincidan" />
          ) : (
            <div style={{ padding: "0 20px 10px" }}>
              {filtradas.map((x) => (
                <div key={x.id} className="list-row">
                  <div className="tnum" style={{ width: 50, fontWeight: 600, color: "var(--navy)" }}>{hora(x.inicio)}</div>
                  <Avatar nombre={x.paciente_nombre} size="is-sm" color={c.medicos.find((m) => m.id === x.medico_id)?.color} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, color: "var(--navy)", fontSize: 14.5 }}>{x.paciente_nombre}</div>
                    <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{x.servicio_nombre} · {x.medico_nombre} · {moneda.format(x.precio)}</div>
                  </div>
                  {x.estado === "confirmada" ? (
                    <button type="button" className="btn btn-soft btn-sm" onClick={() => confirmar(x)}><Check /> Llegó</button>
                  ) : (
                    <EstadoChip estado={x.estado} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {toast.nodo}
    </>
  );
}
