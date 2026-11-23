/* eslint-disable @next/next/no-img-element */

/** Logotipo oficial de Medical OS (archivo de marca con fondo transparente). */
export function Logo({ alto = 34, blanco = false, className = "" }: { alto?: number; blanco?: boolean; className?: string }) {
  return (
    <img
      src="/marca/logo-medical-os.png"
      alt="Medical OS por Partum"
      width={Math.round(alto * 3.53)}
      height={alto}
      className={className}
      style={{ height: alto, width: "auto", filter: blanco ? "brightness(0) invert(1)" : undefined }}
      draggable={false}
    />
  );
}

/** Sólo el isotipo «OS» con la cruz. */
export function Isotipo({ alto = 32, className = "" }: { alto?: number; className?: string }) {
  return (
    <img
      src="/marca/marca-os.png"
      alt=""
      aria-hidden
      width={Math.round(alto * 1.59)}
      height={alto}
      className={className}
      style={{ height: alto, width: "auto" }}
      draggable={false}
    />
  );
}

/** Isotipo dibujado en SVG: lo usa el preloader para animar cada trazo. */
export function IsotipoSVG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 330 210" className={className} aria-hidden>
      <defs>
        <linearGradient id="pre-grad-o" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#04BFAD" />
          <stop offset="1" stopColor="#009D9D" />
        </linearGradient>
        <linearGradient id="pre-grad-s" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#009D9D" />
          <stop offset="1" stopColor="#04BFAD" />
        </linearGradient>
      </defs>
      <circle className="pulso" cx="96" cy="106" r="40" />
      <path className="trazo o" d="M141 52 A70 70 0 1 0 162 130" />
      <path className="trazo s" d="M162 130 C176 92 188 40 240 36 L302 36" />
      <path className="trazo s2" d="M214 118 L252 118 C292 118 292 178 252 178 L176 178" />
      <g className="cruz">
        <rect x="88" y="84" width="16" height="44" rx="8" />
        <rect x="74" y="98" width="44" height="16" rx="8" />
      </g>
    </svg>
  );
}
