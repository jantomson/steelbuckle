// app/sitemap.ts

import { MetadataRoute } from "next";
import {
  supportedLanguages,
  routeTranslations,
  RouteKey,
} from "@/config/routeTranslations";

// Define routes with their SEO properties
const routes: Array<{
  key: RouteKey;
  changeFrequency: string;
  priority: number;
}> = [
  { key: "home", changeFrequency: "weekly", priority: 1.0 },
  { key: "about", changeFrequency: "monthly", priority: 0.8 },
  { key: "contact", changeFrequency: "monthly", priority: 0.8 },
  { key: "projects", changeFrequency: "weekly", priority: 0.9 },
  { key: "railway-maintenance", changeFrequency: "monthly", priority: 0.8 },
  { key: "repair-renovation", changeFrequency: "monthly", priority: 0.8 },
  { key: "railway-construction", changeFrequency: "monthly", priority: 0.8 },
  { key: "design", changeFrequency: "monthly", priority: 0.8 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://steelbuckle.ee";
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Current date for lastModified
  const lastModified = new Date();

  try {
    // Generate entries for each route in each language using route translations
    for (const route of routes) {
      for (const lang of supportedLanguages) {
        // Get the translated path for this route in this language
        let translatedPath = routeTranslations[lang][route.key];

        // Build the full URL
        const url = `${baseUrl}/${lang}${
          translatedPath ? `/${translatedPath}` : ""
        }`;

        sitemapEntries.push({
          url,
          lastModified,
          changeFrequency: route.changeFrequency as any,
          priority: route.priority,
        });
      }
    }

    // Note: We've removed the individual project URL generation
    // since those pages don't actually exist
  } catch (error) {
    console.error("Error generating sitemap:", error);
  }

  return sitemapEntries;
}
