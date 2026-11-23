"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { enlaceDeCita } from "@/lib/datos/modelo";

/** Código QR de llegada: recepción lo escanea para confirmar la asistencia. */
export function QrCita({ id, size = 168 }: { id: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    QRCode.toDataURL(enlaceDeCita(id, window.location.origin), { margin: 1, width: size * 2, color: { dark: "#0B1A38", light: "#FFFFFF" } })
      .then(setSrc)
      .catch(() => setSrc(null));
  }, [id, size]);
  return (
    <div style={{ width: size, height: size, borderRadius: 18, background: "#fff", padding: 8, border: "1px solid var(--line)", display: "grid", placeItems: "center" }}>
      {src ? <img src={src} alt={`Código QR de la cita ${id}`} width={size - 16} height={size - 16} /> : <span className="pre-barra" style={{ opacity: 1, width: 60 }}><span /></span>}
    </div>
  );
}
