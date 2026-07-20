import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Medical OS — Gestión inteligente para clínicas",
  description: "El sistema operativo para clínicas y consultorios: agenda, pagos y fidelización de pacientes en un solo lugar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <footer className="py-6 text-center text-xs" style={{ color: "var(--ink-muted)" }}>
          By Partum Design
        </footer>
      </body>
    </html>
  );
}
