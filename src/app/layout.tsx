import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { Preloader } from "@/components/marca/Preloader";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Medical OS · Clínica Vitalia", template: "%s · Medical OS" },
  description:
    "Agenda en línea, expediente clínico, cartilla de vacunación, recordatorios y Google Calendar para clínicas y consultorios. Demo de Medical OS por Partum.",
  icons: { icon: "/marca/icono.png", apple: "/marca/icono.png" },
};

export const viewport: Viewport = {
  themeColor: "#009D9D",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={outfit.variable}>
      <body>
        <Preloader />
        {children}
      </body>
    </html>
  );
}
