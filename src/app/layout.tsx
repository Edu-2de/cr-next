import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { tv } from "tailwind-variants";
import { LenisProvider } from "@/providers/LenisProvider";
import "./globals.css";

const rootLayoutStyles = tv({
  slots: {
    html: "h-full antialiased",
    body: "min-h-full flex flex-col bg-background font-sans text-foreground",
  },
});

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
  const { html, body } = rootLayoutStyles();

  return (
    <html
      lang="pt-BR"
      className={html({ class: `${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable}` })}
    >
      <body className={body()}>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
