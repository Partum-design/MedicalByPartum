"use client";

import { CreditCard, Receipt, Wallet } from "lucide-react";
import { useClinica } from "@/lib/store";
import { diaLargo, Kpi, moneda, PageHead, PagoChip } from "@/components/ui";

export default function Pagos() {
  const c = useClinica();
  const mias = c.citas.filter((x) => x.paciente_id === c.sesion?.id && x.estado !== "cancelada").sort((a, b) => b.inicio.localeCompare(a.inicio));
  const pagado = mias.filter((x) => x.estado_pago === "pagado").reduce((a, x) => a + x.precio, 0);
  const pendiente = mias.filter((x) => x.estado_pago === "pendiente" && x.estado !== "no_asistio").reduce((a, x) => a + x.precio, 0);
  return (
    <>
      <PageHead titulo="Pagos" sub="Tus consultas pagadas y por pagar. El pago se hace en recepción con efectivo, tarjeta o transferencia." />
      <div className="grid gap-4 sm:grid-cols-3" style={{ marginBottom: 16 }}>
        <Kpi destacado label="Pagado" icono={<Wallet />} valor={moneda.format(pagado)} />
        <Kpi label="Por pagar" icono={<Receipt />} valor={moneda.format(pendiente)} nota="incluye citas próximas" />
        <Kpi label="Pago en línea" icono={<CreditCard />} valor={c.integraciones.pagos_en_linea ? "Disponible" : "Pronto"} nota="tarjeta al reservar" />
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Fecha</th><th>Servicio</th><th>Pago</th><th style={{ textAlign: "right" }}>Monto</th></tr></thead>
            <tbody>
              {mias.map((x) => <tr key={x.id}><td style={{ textTransform: "capitalize" }}>{diaLargo(x.inicio)}</td><td>{x.servicio_nombre}</td><td><PagoChip cita={x} /></td><td className="tnum" style={{ textAlign: "right" }}>{moneda.format(x.precio)}</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
