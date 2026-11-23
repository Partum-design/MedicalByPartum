"use client";

import { useEffect, useState } from "react";

/** true en pantallas de teléfono (≤ 768 px). */
export function useEsMovil(max = 768) {
  const [movil, setMovil] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${max}px)`);
    const f = () => setMovil(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, [max]);
  return movil;
}
