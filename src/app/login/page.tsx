"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, ShieldCheck, Stethoscope, UserRound, Building2 } from "lucide-react";
import { baseCompleta, useClinica } from "@/lib/store";
import { CUENTAS_DEMO } from "@/lib/datos/semilla";
import { celularValido, normalizarTelefono } from "@/lib/datos/modelo";
import { Logo } from "@/components/marca/Logo";
import { Avatar, Segmented } from "@/components/ui";
import { LogoGoogle } from "@/components/marca/LogoGoogle";

type Pestana = "paciente" | "medico" | "admin";

function Acceso() {
  const c = useClinica();
  const router = useRouter();
  const q = useSearchParams();
  const [pestana, setPestana] = useState<Pestana>((q.get("rol") as Pestana) || "paciente");
  const [cargando, setCargando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [registro, setRegistro] = useState(false);
  const [nombre, setNombre] = useState("");
  const [tel, setTel] = useState("");
  const siguiente = q.get("siguiente");

  useEffect(() => {
    const r = q.get("rol");
    if (r === "admin" || r === "medico" || r === "paciente") setPestana(r);
  }, [q]);

  const entrar = async (datos: Parameters<typeof c.iniciarSesion>[0]) => {
    setError(null);
    setCargando(datos.id);
    const r = await c.iniciarSesion(datos);
    setCargando(null);
    if (!r.ok) return setError(r.error ?? "No se pudo iniciar sesión.");
    const destino = siguiente && siguiente.startsWith("/") ? siguiente : r.destino ?? "/";
    router.push(destino);
  };

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim().length < 3) return setError("Escribe tu nombre completo.");
    if (!celularValido(tel)) return setError("Escribe un celular válido de 10 dígitos.");
    const yaExiste = baseCompleta().pacientes.find((p) => normalizarTelefono(p.telefono) === normalizarTelefono(tel));
    if (yaExiste) return entrar({ rol: "paciente", id: yaExiste.id, nombre: yaExiste.nombre });
    const id = `pac-${crypto.randomUUID().slice(0, 8)}`;
    const { paciente, error: err } = c.registrarPaciente(
      { id, nombre, telefono: tel, email: "" },
      { rol: "paciente", id, nombre, subtitulo: "Paciente" }
    );
    if (!paciente) return setError(err ?? "No se pudo crear la cuenta.");
    await entrar({ rol: "paciente", id: paciente.id, nombre: paciente.nombre });
  };

  const medicos = c.listo ? c.medicos.filter((m) => m.activo) : [];
  const listaMedicos = medicos.length
    ? medicos.map((m) => ({ rol: "medico" as const, id: m.id, nombre: m.nombre, subtitulo: m.especialidad, color: m.color }))
    : CUENTAS_DEMO.medicos.map((m) => ({ ...m, color: undefined as string | undefined }));

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.05fr]" style={{ background: "#fff" }}>
      <div className="flex flex-col" style={{ padding: "28px clamp(16px, 5vw, 64px)" }}>
        <div className="flex items-center justify-between">
          <Link href="/">
            <Logo alto={32} />
          </Link>
          <Link href="/" className="btn btn-ghost btn-sm">
            <ArrowLeft /> Portada
          </Link>
        </div>
        <div className="anim-in" style={{ margin: "auto 0", padding: "40px 0", maxWidth: 460, width: "100%", alignSelf: "center" }}>
          <h1 style={{ fontSize: 34, fontWeight: 600 }}>Bienvenido de vuelta</h1>
          <p style={{ color: "var(--muted)", marginTop: 6 }}>Elige cómo quieres entrar a la demo de Medical OS.</p>
          <div style={{ marginTop: 22 }}>
            <Segmented
              valor={pestana}
              onChange={(v) => {
                setPestana(v);
                setError(null);
              }}
              opciones={[
                { id: "paciente", label: "Paciente" },
                { id: "medico", label: "Médico" },
                { id: "admin", label: "Administración" },
              ]}
            />
          </div>

          {pestana === "paciente" && (
            <div style={{ marginTop: 22 }} className="grid gap-3">
              <Link href={`/google/autorizar?modo=login${siguiente ? `&siguiente=${encodeURIComponent(siguiente)}` : ""}`} className="btn btn-ghost btn-lg" style={{ width: "100%" }}>
                <LogoGoogle /> Continuar con Google
              </Link>
              <div className="flex items-center gap-3" style={{ color: "var(--soft)", fontSize: 13 }}>
                <span style={{ flex: 1, height: 1, background: "var(--line)" }} /> cuentas de ejemplo <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
              </div>
              {CUENTAS_DEMO.pacientes.map((p) => (
                <button key={p.id} type="button" className="card card-hover flex items-center gap-3" style={{ padding: 14, textAlign: "left" }} onClick={() => entrar(p)} disabled={!!cargando}>
                  <Avatar nombre={p.nombre} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "var(--navy)" }}>{p.nombre}</div>
                    <div style={{ fontSize: 13, color: "var(--muted)" }}>{p.subtitulo}</div>
                  </div>
                  {cargando === p.id ? <span className="chip chip-teal">Entrando…</span> : <ArrowRight size={18} color="var(--teal)" />}
                </button>
              ))}
              {!registro ? (
                <button type="button" className="btn btn-soft" onClick={() => setRegistro(true)}>
                  <UserRound /> Soy paciente nuevo
                </button>
              ) : (
                <form onSubmit={registrar} className="card card-pad grid gap-3 anim-in">
                  <b style={{ color: "var(--navy)" }}>Crear mi cuenta</b>
                  <label className="field">
                    <span>Nombre completo</span>
                    <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" placeholder="Ej. Andrea Morales" />
                  </label>
                  <label className="field">
                    <span>Celular (10 dígitos)</span>
                    <input className="input" value={tel} onChange={(e) => setTel(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="55 1234 5678" />
                    <small>En producción se verifica con un código por SMS o WhatsApp.</small>
                  </label>
                  <button className="btn btn-grad">Crear cuenta y entrar</button>
                </form>
              )}
            </div>
          )}

          {pestana === "medico" && (
            <div style={{ marginTop: 22 }} className="grid gap-2">
              {listaMedicos.map((m) => (
                <button key={m.id} type="button" className="card card-hover flex items-center gap-3" style={{ padding: 12, textAlign: "left" }} onClick={() => entrar(m)} disabled={!!cargando}>
                  <Avatar nombre={m.nombre} color={m.color} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "var(--navy)" }}>{m.nombre}</div>
                    <div style={{ fontSize: 13, color: "var(--muted)" }}>{m.subtitulo}</div>
                  </div>
                  {cargando === m.id ? <span className="chip chip-teal">Entrando…</span> : <Stethoscope size={18} color="var(--teal)" />}
                </button>
              ))}
            </div>
          )}

          {pestana === "admin" && (
            <div style={{ marginTop: 22 }} className="grid gap-3">
              <button type="button" className="card card-hover flex items-center gap-3" style={{ padding: 16, textAlign: "left" }} onClick={() => entrar(CUENTAS_DEMO.admin)} disabled={!!cargando}>
                <span className="icon-tile">
                  <Building2 />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "var(--navy)" }}>{CUENTAS_DEMO.admin.nombre}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>Agenda, pacientes, caja, inventario, reportes e integraciones</div>
                </div>
                {cargando === "admin" ? <span className="chip chip-teal">Entrando…</span> : <ArrowRight size={18} color="var(--teal)" />}
              </button>
            </div>
          )}

          {error && (
            <p className="chip chip-danger" style={{ marginTop: 14, height: "auto", padding: "8px 12px", whiteSpace: "normal" }}>
              {error}
            </p>
          )}
          <p className="flex items-center gap-2" style={{ marginTop: 22, fontSize: 13, color: "var(--soft)" }}>
            <ShieldCheck size={15} /> Demo sin contraseñas: los datos son ficticios y viven en este navegador.
          </p>
        </div>
      </div>
      <div className="hidden p-4 lg:block">
        <div className="band flex h-full flex-col justify-end" style={{ padding: 56, borderRadius: 40 }}>
          <svg viewBox="0 0 400 400" style={{ position: "absolute", top: 40, right: 40, width: 280, opacity: 0.18 }} aria-hidden>
            <rect x="160" y="40" width="80" height="320" rx="40" fill="#fff" />
            <rect x="40" y="160" width="320" height="80" rx="40" fill="#fff" />
          </svg>
          <span className="chip" style={{ background: "rgba(255,255,255,.18)", color: "#fff", width: "fit-content" }}>Medical OS</span>
          <h2 style={{ fontSize: 44, fontWeight: 600, marginTop: 18, maxWidth: 520, lineHeight: 1.05 }}>Toda tu clínica, en un solo lugar.</h2>
          <p style={{ color: "rgba(255,255,255,.85)", marginTop: 14, maxWidth: 480, fontSize: 17 }}>
            Agenda, expediente clínico, vacunación, cobros, inventario y Google Calendar conectados entre sí.
          </p>
          <div className="grid grid-cols-3 gap-3" style={{ marginTop: 34, maxWidth: 520 }}>
            {[
              ["3 roles", "paciente, médico y admin"],
              ["15 módulos", "listos para usar"],
              ["Google", "Calendar y acceso"],
            ].map(([a, b]) => (
              <div key={a} style={{ background: "rgba(255,255,255,.14)", borderRadius: 18, padding: 14 }}>
                <b style={{ fontSize: 18 }}>{a}</b>
                <div style={{ fontSize: 12.5, opacity: 0.8 }}>{b}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <Acceso />
    </Suspense>
  );
}
