import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CR Mesquita Motores Elétricos",
    short_name: "CR Mesquita",
    description: "Motores elétricos industriais de alta performance, de Porto Alegre para todo o Brasil.",
    start_url: "/",
    display: "standalone",
    background_color: "#05070a",
    theme_color: "#2f7cc9",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
