"use client";

import { useEffect } from "react";

/**
 * En el teléfono cada fila de tabla se muestra como tarjeta (ver CSS). Para
 * que cada dato lleve su título, copia el encabezado de la columna a un
 * atributo data-label en cada celda. Se mantiene al día con un observador.
 */
export function TablasResponsivas() {
  useEffect(() => {
    let pendiente = 0;
    const etiquetar = () => {
      pendiente = 0;
      document.querySelectorAll<HTMLTableElement>("table.table").forEach((t) => {
        const ths = Array.from(t.querySelectorAll("thead th")).map((th) => th.textContent?.trim() ?? "");
        t.querySelectorAll("tbody tr").forEach((tr) => {
          Array.from(tr.children).forEach((td, i) => {
            const etiqueta = ths[i] ?? "";
            if (td.getAttribute("data-label") !== etiqueta) td.setAttribute("data-label", etiqueta);
          });
        });
      });
    };
    etiquetar();
    const mo = new MutationObserver(() => {
      if (!pendiente) pendiente = requestAnimationFrame(etiquetar);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      if (pendiente) cancelAnimationFrame(pendiente);
    };
  }, []);
  return null;
}
