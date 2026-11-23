"use client";

import { useEffect, useState } from "react";
import { IsotipoSVG } from "@/components/marca/Logo";

const FRASES = ["Preparando tu agenda…", "Abriendo expedientes…", "Sincronizando Google Calendar…", "Todo listo"];
const PALABRA = "medical";

/**
 * Preloader de marca: dibuja el isotipo trazo por trazo, arma la palabra
 * letra por letra y sale con un barrido circular. Sólo aparece la primera
 * vez en cada sesión del navegador para no estorbar al navegar.
 */
export function Preloader() {
  const [fase, setFase] = useState<"oculto" | "visible" | "saliendo">("visible");
  const [frase, setFrase] = useState(0);

  useEffect(() => {
    let visto = false;
    try {
      visto = sessionStorage.getItem("mos-preloader") === "1";
      sessionStorage.setItem("mos-preloader", "1");
    } catch {
      /* sin almacenamiento: se muestra siempre */
    }
    if (visto) {
      setFase("oculto");
      return;
    }
    document.documentElement.style.overflow = "hidden";
    const f = window.setInterval(() => setFrase((n) => Math.min(n + 1, FRASES.length - 1)), 620);
    const salir = window.setTimeout(() => setFase("saliendo"), 2500);
    const fin = window.setTimeout(() => {
      setFase("oculto");
      document.documentElement.style.overflow = "";
    }, 3500);
    return () => {
      window.clearInterval(f);
      window.clearTimeout(salir);
      window.clearTimeout(fin);
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (fase === "oculto") return null;

  return (
    <div className={`preloader ${fase === "saliendo" ? "is-saliendo" : ""}`} role="status" aria-label="Cargando Medical OS">
      <div className="pre-anillo" />
      <div className="pre-centro">
        <IsotipoSVG className="pre-marca" />
        <div className="pre-texto">
          <div className="pre-palabra" aria-hidden>
            {PALABRA.split("").map((l, i) => (
              <span key={i} style={{ animationDelay: `${0.9 + i * 0.06}s` }}>
                {l}
              </span>
            ))}
            <span style={{ animationDelay: `${0.9 + PALABRA.length * 0.06}s`, color: "var(--teal)" }}>OS</span>
          </div>
          <div className="pre-sub">por Partum</div>
        </div>
        <div className="pre-barra">
          <span />
        </div>
        <div className="pre-frase" key={frase}>
          {FRASES[frase]}
        </div>
      </div>
    </div>
  );
}
