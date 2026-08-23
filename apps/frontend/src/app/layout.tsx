import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Retail Media - Farmatodo",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[100] focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:text-navy-900 focus:shadow-float"
        >
          Saltar al contenido principal
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
