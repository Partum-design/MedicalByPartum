"use client";

import { useEffect, useState } from "react";
import { CRUZ, CRUZ_CENTRO, LETRAS, LOGO_H, LOGO_W, OS_TRAZO, S_BAJA, SUBTITULO } from "@/components/marca/trazosLogo";

const FRASES = ["Preparando tu agenda…", "Abriendo expedientes…", "Sincronizando Google Calendar…", "Todo listo"];

/** Duración de la carga visible y de la salida, en milisegundos. */
const CARGA = 3100;
const SALIDA = 1000;

/**
 * Preloader de marca, dibujado con los trazos vectoriales del logotipo:
 * 1. La «O» y la «S» se dibujan trazo por trazo y luego se rellenan.
 * 2. La cruz aparece girando y late desde el centro de la «O».
 * 3. «medical» sube letra por letra y «por Partum» entra detrás.
 * 4. Un destello recorre el logotipo mientras la barra llega a 100 %.
 * 5. Una onda turquesa se abre desde el centro y descubre la página.
 * Sólo aparece la primera vez en cada sesión del navegador para no estorbar al navegar.
 */
export function Preloader() {
  const [fase, setFase] = useState<"oculto" | "visible" | "saliendo">("visible");
  const [progreso, setProgreso] = useState(0);

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

    // Progreso con aceleración suave: avanza rápido al inicio y se asienta al final.
    const inicio = performance.now();
    let raf = 0;
    const paso = (t: number) => {
      const x = Math.min((t - inicio) / (CARGA - 300), 1);
      setProgreso(Math.round((1 - Math.pow(1 - x, 3)) * 100));
      if (x < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);

    const salir = window.setTimeout(() => setFase("saliendo"), CARGA);
    const fin = window.setTimeout(() => {
      setFase("oculto");
      document.documentElement.style.overflow = "";
    }, CARGA + SALIDA);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(salir);
      window.clearTimeout(fin);
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (fase === "oculto") return null;

  const frase = progreso >= 100 ? FRASES[FRASES.length - 1] : FRASES[Math.floor((progreso / 100) * (FRASES.length - 1))];
  const { x: cx, y: cy } = CRUZ_CENTRO;

  return (
    <div className={`preloader ${fase === "saliendo" ? "is-saliendo" : ""}`} role="status" aria-label="Cargando Medical OS">
      <div className="pre-fondo" aria-hidden>
        <span className="pre-orbe is-a" />
        <span className="pre-orbe is-b" />
        <span className="pre-reticula" />
        <span className="pre-anillo" />
      </div>

      <div className="pre-centro">
        <svg className="pre-logo" viewBox={`-20 -20 ${LOGO_W + 40} ${LOGO_H + 40}`} aria-hidden>
          <defs>
            <clipPath id="pre-formas">
              {LETRAS.map((d, i) => (
                <path key={`l${i}`} d={d} />
              ))}
              {SUBTITULO.map((d, i) => (
                <path key={`s${i}`} d={d} />
              ))}
              <path d={OS_TRAZO} />
              <path d={S_BAJA} />
              <path d={CRUZ} />
            </clipPath>
            <linearGradient id="pre-destello" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Isotipo «OS» */}
          <path className="pre-os pre-os-a" d={OS_TRAZO} pathLength={1} />
          <path className="pre-os pre-os-b" d={S_BAJA} pathLength={1} />
          <circle className="pre-pulso" cx={cx} cy={cy} r={60} />
          <circle className="pre-pulso is-2" cx={cx} cy={cy} r={60} />
          <path className="pre-cruz" d={CRUZ} />

          {/* «medical», letra por letra */}
          {LETRAS.map((d, i) => (
            <path key={i} className="pre-letra" d={d} style={{ animationDelay: `${0.85 + i * 0.075}s` }} />
          ))}

          {/* «por Partum» */}
          {SUBTITULO.map((d, i) => (
            <path key={i} className="pre-sub" d={d} style={{ animationDelay: `${1.55 + i * 0.04}s` }} />
          ))}

          {/* Destello que recorre sólo las formas del logotipo */}
          <g clipPath="url(#pre-formas)">
            <rect className="pre-brillo" x={-LOGO_W * 0.35} y={-20} width={LOGO_W * 0.3} height={LOGO_H + 40} fill="url(#pre-destello)" />
          </g>
        </svg>

        <div className="pre-estado">
          <div className="pre-barra">
            <span style={{ transform: `scaleX(${progreso / 100})` }} />
          </div>
          <div className="pre-info">
            <span className="pre-frase" key={frase}>
              {frase}
            </span>
            <span className="pre-pct tnum">{progreso}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
