import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { tv } from "tailwind-variants";
import buildingFacadeImg from "@/assets/images/building-facade.jpg";
import { ADDRESS_CITY, FOUNDED_YEAR, LATITUDE, LONGITUDE, PHONE_HREF, WEBSITE_URL } from "@/lib/business-info";
import { SERVICES } from "@/lib/services-info";
import { LenisProvider } from "@/providers/LenisProvider";
import "./globals.css";

const SITE_TITLE = "CR Mesquita | Motores elétricos de alta performance";
const SITE_DESCRIPTION =
  "Motores elétricos industriais projetados para torque constante, eficiência energética e operação contínua sem paradas. Venda, manutenção, reforma e diagnóstico técnico em Porto Alegre, RS, desde 1975.";
const BRAND_COLOR = "#2f7cc9";

// LocalBusiness structured data — real facts pulled from lib/business-info.ts
// and lib/services-info.ts, the same sources the page's own footer/contact/
// services sections use.
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "CR Mesquita Motores Elétricos",
  description: SITE_DESCRIPTION,
  url: WEBSITE_URL,
  image: new URL(buildingFacadeImg.src, WEBSITE_URL).toString(),
  telephone: PHONE_HREF.replace("tel:", ""),
  foundingDate: String(FOUNDED_YEAR),
  address: {
    "@type": "PostalAddress",
    addressLocality: ADDRESS_CITY.split(",")[0].trim(),
    addressRegion: "RS",
    addressCountry: "BR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: LATITUDE,
    longitude: LONGITUDE,
  },
  areaServed: "BR",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Serviços",
    itemListElement: SERVICES.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.title,
        description: service.description,
      },
    })),
  },
};

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
  metadataBase: new URL(WEBSITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | CR Mesquita",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "motores elétricos industriais",
    "manutenção de motores elétricos",
    "reforma de motores elétricos",
    "motores trifásicos",
    "Porto Alegre",
    "Rio Grande do Sul",
    "CR Mesquita",
  ],
  authors: [{ name: "CR Mesquita" }],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: WEBSITE_URL,
    siteName: "CR Mesquita",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: buildingFacadeImg.src, width: buildingFacadeImg.width, height: buildingFacadeImg.height }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [buildingFacadeImg.src],
  },
};

export const viewport: Viewport = {
  themeColor: BRAND_COLOR,
  colorScheme: "light",
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }} />
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
