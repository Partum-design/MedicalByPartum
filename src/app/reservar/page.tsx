import { Suspense } from "react";
import type { Metadata } from "next";
import { FlujoReserva } from "@/components/citas/FlujoReserva";

export const metadata: Metadata = { title: "Agendar cita" };

export default function Reservar() {
  return (
    <Suspense>
      <FlujoReserva />
    </Suspense>
  );
}
