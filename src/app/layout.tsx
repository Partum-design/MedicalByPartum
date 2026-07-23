import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-outfit",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Barber OS by Partum",
  description:
    "El sistema núcleo para barberías y barberos independientes: agenda, pago anticipado, servicio a domicilio y lealtad en un solo lugar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${outfit.variable} ${plexSans.variable} ${plexMono.variable}`}
    >
      <body className="antialiased">
        {children}
        <footer className="site-footer">
          <span>Barber OS</span>
          <span>Operación barbería conectada · Partum Design</span>
        </footer>
      </body>
    </html>
  );
}
