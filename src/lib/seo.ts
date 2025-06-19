// lib/seo.ts
import {
  RouteKey,
  SupportedLanguage,
  getRouteKeyFromPath,
  defaultLanguage,
} from "@/config/routeTranslations";
import { getPathWithoutLanguage } from "@/utils/navigation";

// Maps route keys to SEO page keys
// In many cases they're the same, but allows for flexibility
const routeKeyToSeoKey: Record<RouteKey, string> = {
  home: "home",
  about: "about",
  contact: "contact",
  projects: "projects",
  services: "services", // General services page
  "railway-maintenance": "services/railway-maintenance",
  "railway-construction": "services/railway-construction",
  "repair-renovation": "services/repair-renovation",
  design: "services/design",
};

/**
 * Get SEO page key from a route path
 * @param path Current route path
 * @param language Current language
 * @returns SEO page key for the API
 */
export function getSeoKeyFromPath(
  path: string,
  language: SupportedLanguage
): string {
  // Get path without language prefix
  const pathWithoutLang = getPathWithoutLanguage(path);

  // Extract route key from the path
  const routeKey = getRouteKeyFromPath(
    pathWithoutLang,
    language as SupportedLanguage
  );

  // If we found a matching route key, map it to SEO key
  if (routeKey && routeKeyToSeoKey[routeKey]) {
    return routeKeyToSeoKey[routeKey];
  }

  // Default to home if no match found
  return "home";
}

/**
 * Retrieves SEO metadata for a specific page and language
 * @param pageKey The key identifying the page
 * @param lang The language code (defaults to 'et')
 * @returns SEO metadata for the specified page and language
 */
export async function getSeoMetadata(
  pageKeyOrPath: string,
  lang: SupportedLanguage | string = defaultLanguage
) {
  try {
    // Normalize language code
    // Handle case when language might come in as 'est' from old code
    const apiLang = lang === "est" ? "et" : lang;

    // Determine if we got a path or a pageKey
    let pageKey = pageKeyOrPath;
    if (pageKeyOrPath.startsWith("/")) {
      // We received a path, extract the page key
      pageKey = getSeoKeyFromPath(pageKeyOrPath, apiLang as SupportedLanguage);
    }

    // console.log(`Fetching SEO for page: ${pageKey}, language: ${apiLang}`);
    const response = await fetch(`/api/seo?pageKey=${pageKey}&lang=${apiLang}`);

    if (!response.ok) {
      console.warn(
        `SEO data not found for page: ${pageKey}, language: ${apiLang}`
      );

      // Return default SEO data if not found
      return {
        title: "Steel Buckle - Railway Construction & Maintenance",
        metaDescription:
          "Professional railway construction and maintenance services across the Baltics.",
        keywords:
          "railway construction, railway maintenance, railway repair, Estonia, Latvia, Lithuania",
        language: apiLang,
        pageKey: pageKey,
      };
    }

    const seoData = await response.json();
    return seoData;
  } catch (error) {
    console.error("Error fetching SEO metadata:", error);

    // Return default SEO data in case of error
    return {
      title: "Steel Buckle - Railway Construction & Maintenance",
      metaDescription:
        "Professional railway construction and maintenance services across the Baltics.",
      keywords:
        "railway construction, railway maintenance, railway repair, Estonia, Latvia, Lithuania",
      language: lang,
      pageKey: pageKeyOrPath,
    };
  }
}
