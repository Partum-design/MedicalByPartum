/* eslint-disable @next/next/no-img-element */

/** Logotipo oficial de Medical OS (archivo de marca con fondo transparente). */
export function Logo({ alto = 34, blanco = false, className = "" }: { alto?: number; blanco?: boolean; className?: string }) {
  return (
    <img
      src="/marca/logo-medical-os.png"
      alt="Medical OS por Partum"
      width={Math.round(alto * 4.64)}
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
      width={Math.round(alto * 1.65)}
      height={alto}
      className={className}
      style={{ height: alto, width: "auto" }}
      draggable={false}
    />
  );
}
