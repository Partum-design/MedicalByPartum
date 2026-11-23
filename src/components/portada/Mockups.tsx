import { Bell, CalendarCheck2, CalendarDays, Check, ChevronRight, ClipboardList, Home, Menu, Search, Stethoscope, Syringe, User, Video } from "lucide-react";
import { Isotipo } from "@/components/marca/Logo";

// Pantallas de la app dibujadas con HTML: muestran la interfaz real del
// producto en lugar de fotos genéricas y escalan nítidas en cualquier pantalla.

export function TelefonoInicio() {
  return (
    <div className="phone">
      <div className="phone-notch" />
      <div className="phone-screen" style={{ fontSize: 12 }}>
        <div style={{ background: "var(--grad-band)", color: "#fff", padding: "44px 16px 48px", borderRadius: "0 0 26px 26px" }}>
          <div className="flex items-center justify-between">
            <span style={{ opacity: 0.85 }}>Hola,</span>
            <span style={{ width: 28, height: 28, borderRadius: 9, background: "rgba(255,255,255,.2)", display: "grid", placeItems: "center" }}>
              <Bell size={14} />
            </span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 600, marginTop: 2 }}>Lucía Ramírez</div>
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.16)", borderRadius: 12, padding: "9px 12px" }}>
            <Search size={14} /> <span style={{ opacity: 0.85 }}>Buscar servicio o especialista</span>
          </div>
        </div>
        <div style={{ margin: "-30px 12px 0", background: "#fff", borderRadius: 18, padding: 14, boxShadow: "0 14px 30px -16px rgba(11,26,56,.4)" }}>
          <div style={{ color: "var(--soft)", fontSize: 10.5, fontWeight: 500, letterSpacing: ".04em", textTransform: "uppercase" }}>Próxima cita</div>
          <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
            <span className="avatar is-sm">MT</span>
            <div>
              <div style={{ fontWeight: 600, color: "var(--navy)" }}>Vacuna de primer año</div>
              <div style={{ color: "var(--muted)", fontSize: 11 }}>Mateo · Enf. Valeria Méndez</div>
            </div>
          </div>
          <div className="flex gap-2" style={{ marginTop: 10 }}>
            <span className="chip chip-teal" style={{ height: 24, fontSize: 11 }}>
              <CalendarDays size={11} /> Jue 26 nov
            </span>
            <span className="chip chip-mint" style={{ height: 24, fontSize: 11 }}>10:15</span>
          </div>
        </div>
        <div style={{ padding: "16px 14px 0" }}>
          <div style={{ fontWeight: 600, color: "var(--navy)", marginBottom: 10 }}>Servicios</div>
          <div className="grid grid-cols-4 gap-2" style={{ textAlign: "center", fontSize: 10, color: "var(--slate)" }}>
            {[
              [<Stethoscope key="a" size={16} />, "Consulta"],
              [<Syringe key="b" size={16} />, "Vacunas"],
              [<Video key="c" size={16} />, "Video"],
              [<ClipboardList key="d" size={16} />, "Estudios"],
            ].map(([i, t], k) => (
              <div key={k} style={{ display: "grid", justifyItems: "center", gap: 5 }}>
                <span style={{ width: 40, height: 40, borderRadius: 13, display: "grid", placeItems: "center", background: k === 1 ? "var(--grad)" : "var(--teal-50)", color: k === 1 ? "#fff" : "var(--teal)" }}>{i}</span>
                {t}
              </div>
            ))}
          </div>
          <div style={{ fontWeight: 600, color: "var(--navy)", margin: "16px 0 8px" }}>Cartilla de Mateo</div>
          <div style={{ background: "#fff", borderRadius: 14, padding: 12, border: "1px solid var(--line)" }}>
            <div className="flex justify-between" style={{ fontSize: 11 }}>
              <span style={{ color: "var(--muted)" }}>Esquema al día</span>
              <b style={{ color: "var(--teal-700)" }}>9 de 10</b>
            </div>
            <div className="progress" style={{ marginTop: 8, height: 7 }}>
              <span style={{ width: "90%" }} />
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, display: "flex", justifyContent: "space-around", padding: "12px 0 16px", background: "#fff", borderTop: "1px solid var(--line)", color: "var(--soft)" }}>
          <Home size={18} color="var(--teal)" />
          <CalendarDays size={18} />
          <Syringe size={18} />
          <User size={18} />
        </div>
      </div>
    </div>
  );
}

export function TelefonoPanel() {
  return (
    <div className="phone" style={{ width: 290 }}>
      <div className="phone-notch" />
      <div className="phone-screen" style={{ fontSize: 11.5, background: "#fff" }}>
        <div style={{ background: "#0d1b2e", color: "#fff", padding: "40px 14px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          <Menu size={15} />
          <span style={{ marginLeft: "auto", opacity: 0.8 }}>Dra. Mariana Torres</span>
          <span className="avatar is-sm" style={{ width: 24, height: 24, fontSize: 10 }}>MT</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "112px 1fr", height: "100%" }}>
          <div style={{ borderRight: "1px solid var(--line)", padding: "12px 8px", color: "var(--muted)", display: "grid", alignContent: "start", gap: 4, fontSize: 10.5 }}>
            {["Mi agenda", "Llegadas", "Expedientes", "Vacunas", "Horarios", "Google"].map((t, i) => (
              <div key={t} style={{ padding: "7px 8px", borderRadius: 8, background: i === 0 ? "var(--teal)" : "transparent", color: i === 0 ? "#fff" : undefined }}>{t}</div>
            ))}
          </div>
          <div style={{ padding: 10, background: "var(--bg-2)" }}>
            <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: 13 }}>Hoy</div>
            <div style={{ color: "var(--muted)", fontSize: 10 }}>8 pacientes · 2 por confirmar</div>
            {[
              ["09:00", "Revisión pediátrica", "Sofía G.", "var(--teal)"],
              ["09:30", "Control recién nacido", "Iker M.", "var(--aqua)"],
              ["10:00", "Teleconsulta", "Regina P.", "var(--violet)"],
              ["11:00", "Valoración desarrollo", "Mateo R.", "var(--teal)"],
            ].map(([h, s, p, col]) => (
              <div key={h} style={{ marginTop: 8, background: "#fff", borderRadius: 10, padding: "7px 8px", borderLeft: `3px solid ${col}`, boxShadow: "var(--shadow-sm)" }}>
                <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: 10.5 }}>{h} · {p}</div>
                <div style={{ color: "var(--muted)", fontSize: 9.5 }}>{s}</div>
              </div>
            ))}
            <div style={{ marginTop: 10, background: "var(--grad)", color: "#fff", borderRadius: 12, padding: 10, fontSize: 10 }}>
              <div style={{ fontWeight: 600 }}>¡Agenda llena, Dra. Torres!</div>
              <div style={{ opacity: 0.85 }}>3 citas nuevas en línea hoy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Pantallas pequeñas de los tres pasos de "Cómo funciona". */
export function TelefonoPaso({ paso }: { paso: 1 | 2 | 3 }) {
  return (
    <div className="phone is-sm">
      <div className="phone-notch" />
      <div className="phone-screen" style={{ fontSize: 10.5, padding: "34px 12px 12px" }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
          <Isotipo alto={14} />
          <span style={{ color: "var(--muted)" }}>Paso {paso} de 3</span>
        </div>
        {paso === 1 && (
          <>
            <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: 13, marginBottom: 8 }}>¿Qué necesitas?</div>
            {["Revisión pediátrica", "Vacuna de primer año", "Consulta general", "Control prenatal"].map((t, i) => (
              <div key={t} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 10px", marginBottom: 6, borderRadius: 10, background: i === 1 ? "var(--teal-50)" : "#fff", border: `1px solid ${i === 1 ? "var(--teal)" : "var(--line)"}`, color: "var(--navy)" }}>
                {t}
                {i === 1 ? <Check size={13} color="var(--teal)" /> : <ChevronRight size={13} color="var(--soft)" />}
              </div>
            ))}
          </>
        )}
        {paso === 2 && (
          <>
            <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: 13, marginBottom: 8 }}>Elige día y hora</div>
            <div className="grid grid-cols-5 gap-1" style={{ marginBottom: 10 }}>
              {["L 23", "M 24", "M 25", "J 26", "V 27"].map((d, i) => (
                <div key={d} style={{ textAlign: "center", padding: "6px 0", borderRadius: 9, background: i === 3 ? "var(--teal)" : "#fff", color: i === 3 ? "#fff" : "var(--slate)", border: "1px solid var(--line)" }}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1">
              {["09:00", "09:15", "09:45", "10:15", "10:30", "11:00", "12:15", "12:30", "13:00"].map((h, i) => (
                <div key={h} style={{ textAlign: "center", padding: "7px 0", borderRadius: 9, background: i === 3 ? "var(--grad)" : "#fff", color: i === 3 ? "#fff" : "var(--navy)", border: "1px solid var(--line)" }}>{h}</div>
              ))}
            </div>
          </>
        )}
        {paso === 3 && (
          <div style={{ display: "grid", justifyItems: "center", textAlign: "center", paddingTop: 18 }}>
            <span style={{ width: 54, height: 54, borderRadius: "50%", display: "grid", placeItems: "center", background: "var(--grad)", color: "#fff", boxShadow: "var(--shadow-teal)" }}>
              <Check size={26} />
            </span>
            <div style={{ fontWeight: 600, color: "var(--navy)", fontSize: 14, marginTop: 12 }}>¡Cita confirmada!</div>
            <div style={{ color: "var(--muted)", marginTop: 4 }}>Jueves 26 de noviembre · 10:15</div>
            <div style={{ marginTop: 14, width: "100%", display: "grid", gap: 6 }}>
              <div style={{ padding: 8, borderRadius: 9, background: "var(--teal-50)", color: "var(--teal-700)", display: "flex", gap: 6, alignItems: "center", justifyContent: "center" }}>
                <CalendarCheck2 size={13} /> Agregar a Google Calendar
              </div>
              <div style={{ padding: 8, borderRadius: 9, border: "1px solid var(--line)", color: "var(--slate)" }}>Ver código QR de llegada</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
