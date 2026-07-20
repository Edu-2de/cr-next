import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk, Manrope } from "next/font/google";
import { LenisProvider } from "@/components/LenisProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Space Grotesk (font-display, above) only ships up to weight 700 on
// Google Fonts — no heavier cut exists to load. Manrope goes up to 800 for
// spots that need a genuinely thick display weight (--font-heading).
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "CR Mesquita | Motores elétricos de alta performance",
  description:
    "Motores elétricos industriais projetados para torque constante, eficiência energética e operação contínua sem paradas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink-950 font-sans text-foreground">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
