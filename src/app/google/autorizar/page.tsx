"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Check, Info, UserRound } from "lucide-react";
import { baseCompleta, useClinica } from "@/lib/store";
import { PACIENTE_DEMO_ADULTO } from "@/lib/datos/semilla";
import { Isotipo } from "@/components/marca/Logo";
import { LogoGoogle } from "@/components/marca/LogoGoogle";
import { Avatar } from "@/components/ui";

type Cuenta = { nombre: string; email: string };

/**
 * Pantalla de Google simulada. Reproduce el flujo OAuth 2.0 real (elegir
 * cuenta → pantalla de consentimiento → regreso a la app) sin salir de la
 * demo. En producción esta ruta se reemplaza por la redirección a
 * accounts.google.com y el callback /api/google/oauth/callback.
 */
function Autorizar() {
  const c = useClinica();
  const q = useSearchParams();
  const router = useRouter();
  const modo = q.get("modo") === "calendar" ? "calendar" : "login";
  const medicoId = q.get("medico") ?? c.sesion?.id ?? "";
  const volver = q.get("volver") ?? "/dashboard/medico/google";
  const siguiente = q.get("siguiente");
  const medico = c.medicos.find((m) => m.id === medicoId);

  const sugeridas: Cuenta[] =
    modo === "calendar"
      ? [
          {
            nombre: medico?.nombre ?? c.sesion?.nombre ?? "Médico",
            email: `${(medico?.nombre ?? "medico").replace(/^(Dra?|Enf)\.\s*/, "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, ".")}@gmail.com`,
          },
          { nombre: "Clínica Vitalia", email: "agenda@clinicavitalia.mx" },
        ]
      : [
          { nombre: "Lucía Ramírez", email: "lucia.ramirez@ejemplo.mx" },
          { nombre: "Andrea Morales", email: "andrea.morales@gmail.com" },
        ];

  const [paso, setPaso] = useState<"cuentas" | "otra" | "permisos" | "conectando">("cuentas");
  const [cuenta, setCuenta] = useState<Cuenta | null>(null);
  const [otra, setOtra] = useState<Cuenta>({ nombre: "", email: "" });
  const [calendario, setCalendario] = useState("Consultorio");
  const [error, setError] = useState<string | null>(null);

  const elegir = (k: Cuenta) => {
    setCuenta(k);
    setPaso("permisos");
  };

  const permitir = async () => {
    if (!cuenta) return;
    setPaso("conectando");
    await new Promise((r) => setTimeout(r, 1100));
    if (modo === "calendar") {
      const r = c.conectarGoogle(medicoId, cuenta.email, calendario);
      if (!r.ok) {
        setError(r.error);
        setPaso("permisos");
        return;
      }
      router.replace(`${volver}${volver.includes("?") ? "&" : "?"}google=conectado`);
      return;
    }
    // Acceso con Google: busca la ficha por correo o crea una nueva.
    const base = baseCompleta();
    let paciente = base.pacientes.find((p) => p.email.toLowerCase() === cuenta.email.toLowerCase());
    if (!paciente && cuenta.email === "lucia.ramirez@ejemplo.mx") paciente = base.pacientes.find((p) => p.id === PACIENTE_DEMO_ADULTO);
    if (!paciente) {
      const id = `pac-${crypto.randomUUID().slice(0, 8)}`;
      const r = c.registrarPaciente({ id, nombre: cuenta.nombre, telefono: "", email: cuenta.email, google: true }, { rol: "paciente", id, nombre: cuenta.nombre, subtitulo: "Paciente" });
      if (!r.paciente) {
        setError(r.error);
        setPaso("cuentas");
        return;
      }
      paciente = r.paciente;
    }
    const s = await c.iniciarSesion({ rol: "paciente", id: paciente.id, nombre: paciente.nombre, subtitulo: "Paciente · Google" });
    if (!s.ok) {
      setError(s.error ?? "No se pudo iniciar sesión.");
      setPaso("cuentas");
      return;
    }
    router.replace(siguiente && siguiente.startsWith("/") ? siguiente : "/cuenta");
  };

  return (
    <div className="google-shell">
      <div style={{ width: "min(460px, 100%)" }}>
        <p className="flex items-center gap-2" style={{ fontSize: 12.5, color: "#5f6368", marginBottom: 10, justifyContent: "center" }}>
          <Info size={14} /> Pantalla de Google simulada para la demo · en producción se abre accounts.google.com
        </p>
        <div className="google-card anim-in">
          <div className="flex items-center gap-2">
            <LogoGoogle size={22} />
            <span style={{ fontSize: 14, color: "#5f6368" }}>{modo === "calendar" ? "Autorizar con Google" : "Acceder con Google"}</span>
          </div>

          {paso === "cuentas" && (
            <>
              <h1 style={{ marginTop: 22 }}>Elige una cuenta</h1>
              <p style={{ marginTop: 6, color: "#444" }}>
                para continuar a <b style={{ color: "#0b57d0", fontWeight: 500 }}>Medical OS</b>
              </p>
              <div style={{ marginTop: 22, borderTop: "1px solid #e3e3e3" }}>
                {sugeridas.map((k) => (
                  <button key={k.email} type="button" onClick={() => elegir(k)} className="flex w-full items-center gap-3" style={{ padding: "14px 6px", border: "none", borderBottom: "1px solid #e3e3e3", background: "none", textAlign: "left" }}>
                    <Avatar nombre={k.nombre} size="is-sm" color="#5f6368" />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{k.nombre}</div>
                      <div style={{ fontSize: 13, color: "#5f6368" }}>{k.email}</div>
                    </div>
                  </button>
                ))}
                <button type="button" onClick={() => setPaso("otra")} className="flex w-full items-center gap-3" style={{ padding: "14px 6px", border: "none", borderBottom: "1px solid #e3e3e3", background: "none", textAlign: "left", fontSize: 14 }}>
                  <span style={{ width: 30, display: "grid", placeItems: "center" }}>
                    <UserRound size={18} color="#5f6368" />
                  </span>
                  Usar otra cuenta
                </button>
              </div>
            </>
          )}

          {paso === "otra" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (otra.nombre.trim().length < 2 || !/.+@.+\..+/.test(otra.email)) return setError("Escribe tu nombre y un correo válido.");
                setError(null);
                elegir({ nombre: otra.nombre.trim(), email: otra.email.trim() });
              }}
              className="grid gap-3"
              style={{ marginTop: 22 }}
            >
              <h1>Usar otra cuenta</h1>
              <input className="input" placeholder="Nombre" value={otra.nombre} onChange={(e) => setOtra({ ...otra, nombre: e.target.value })} />
              <input className="input" placeholder="Correo electrónico" type="email" value={otra.email} onChange={(e) => setOtra({ ...otra, email: e.target.value })} />
              <div className="flex justify-between" style={{ marginTop: 8 }}>
                <button type="button" className="btn btn-sm" style={{ color: "#0b57d0" }} onClick={() => setPaso("cuentas")}>
                  Atrás
                </button>
                <button className="btn btn-sm" style={{ background: "#0b57d0", color: "#fff" }}>
                  Siguiente
                </button>
              </div>
            </form>
          )}

          {(paso === "permisos" || paso === "conectando") && cuenta && (
            <>
              <div className="flex items-center justify-center gap-3" style={{ marginTop: 24 }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, border: "1px solid #e3e3e3", display: "grid", placeItems: "center" }}>
                  <Isotipo alto={20} />
                </span>
                <span style={{ color: "#9aa0a6" }}>⟷</span>
                <Avatar nombre={cuenta.nombre} size="is-sm" color="#5f6368" />
              </div>
              <h1 style={{ marginTop: 18, textAlign: "center" }}>Medical OS quiere acceder a tu cuenta de Google</h1>
              <p style={{ textAlign: "center", fontSize: 14, color: "#5f6368", marginTop: 6 }}>{cuenta.email}</p>
              <div style={{ marginTop: 22, fontSize: 14 }}>
                <p style={{ fontWeight: 500, marginBottom: 10 }}>Esto permitirá que Medical OS:</p>
                {(modo === "calendar"
                  ? ["Ver, editar, crear y borrar los eventos de tus calendarios", "Consultar tu disponibilidad (libre/ocupado) para no encimar citas", "Ver tu dirección de correo electrónico"]
                  : ["Asociar tu nombre y foto de perfil", "Ver tu dirección de correo electrónico"]
                ).map((t) => (
                  <div key={t} className="flex items-start gap-3" style={{ padding: "10px 0", borderTop: "1px solid #eee" }}>
                    {modo === "calendar" ? <CalendarDays size={18} color="#1a73e8" /> : <Check size={18} color="#1a73e8" />}
                    <span>{t}</span>
                  </div>
                ))}
              </div>
              {modo === "calendar" && (
                <label className="field" style={{ marginTop: 10 }}>
                  <span style={{ color: "#444" }}>Calendario donde se crearán las citas</span>
                  <select className="input" value={calendario} onChange={(e) => setCalendario(e.target.value)}>
                    <option>Consultorio</option>
                    <option>Principal</option>
                    <option>Clínica Vitalia</option>
                  </select>
                </label>
              )}
              {error && <p style={{ color: "#d93025", fontSize: 13, marginTop: 10 }}>{error}</p>}
              <div className="flex justify-between" style={{ marginTop: 24 }}>
                <button type="button" className="btn btn-sm" style={{ color: "#0b57d0", border: "1px solid #c4c7c5" }} onClick={() => router.back()} disabled={paso === "conectando"}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-sm" style={{ background: "#0b57d0", color: "#fff", minWidth: 120 }} onClick={permitir} disabled={paso === "conectando"}>
                  {paso === "conectando" ? "Conectando…" : "Permitir"}
                </button>
              </div>
            </>
          )}
        </div>
        <p style={{ fontSize: 12, color: "#5f6368", marginTop: 14, textAlign: "center" }}>Español (México) · Ayuda · Privacidad · Condiciones</p>
      </div>
    </div>
  );
}

export default function Pagina() {
  return (
    <Suspense>
      <Autorizar />
    </Suspense>
  );
}
