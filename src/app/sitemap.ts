import type { MetadataRoute } from "next";
import { WEBSITE_URL } from "@/lib/business-info";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: WEBSITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
