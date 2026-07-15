import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedicalByPartum",
  description: "Gestión inteligente de clínicas y consultorios médicos",
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
