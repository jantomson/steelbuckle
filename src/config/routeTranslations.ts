// config/routeTranslations.ts

// Define our supported languages
export const supportedLanguages = ["et", "en", "ru", "lv"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];
export const defaultLanguage: SupportedLanguage = "et";

// Define our routes - these are the "canonical" route names
export type RouteKey =
  | "home"
  | "about"
  | "contact"
  | "projects"
  | "services"
  | "railway-maintenance"
  | "railway-construction"
  | "repair-renovation"
  | "design";

// Define translations for each route in each language
export const routeTranslations: Record<
  SupportedLanguage,
  Record<RouteKey, string>
> = {
  et: {
    home: "",
    about: "ettevottest",
    contact: "kontakt",
    projects: "tehtud-tood",
    services: "teenused",
    "railway-maintenance": "teenused/raudteede-jooksev-korrashoid",
    "railway-construction": "teenused/raudtee-ehitus",
    "repair-renovation": "teenused/remont-ja-renoveerimine",
    design: "teenused/projekteerimine",
  },
  en: {
    home: "",
    about: "about",
    contact: "contact",
    projects: "projects",
    services: "services",
    "railway-maintenance": "services/railway-maintenance",
    "railway-construction": "services/railway-construction",
    "repair-renovation": "services/repair-renovation",
    design: "services/design",
  },
  ru: {
    home: "",
    about: "o-nas",
    contact: "kontakty",
    projects: "proekty",
    services: "uslugi",
    "railway-maintenance": "uslugi/obsluzhivanie-zheleznykh-dorog",
    "railway-construction": "uslugi/stroitelstvo-zheleznykh-dorog",
    "repair-renovation": "uslugi/remont-i-renovatsiya",
    design: "uslugi/proektirovanie",
  },
  lv: {
    home: "",
    about: "par-mums",
    contact: "kontakti",
    projects: "projekti",
    services: "pakalpojumi",
    "railway-maintenance": "pakalpojumi/dzelzcela-apkope",
    "railway-construction": "pakalpojumi/dzelzcela-buvnieciba",
    "repair-renovation": "pakalpojumi/remonts-un-renovacija",
    design: "pakalpojumi/projektesana",
  },
};

// Get a translated path for a route key
export function getTranslatedPath(
  routeKey: RouteKey,
  language: SupportedLanguage
): string {
  return routeTranslations[language][routeKey] || "";
}

// Build a full URL with language prefix
export function buildLocalizedUrl(
  routeKey: RouteKey,
  language: SupportedLanguage
): string {
  const path = routeTranslations[language][routeKey];
  return `/${language}${path ? `/${path}` : ""}`;
}

// Helper to get route key from a path
export function getRouteKeyFromPath(
  path: string,
  language: SupportedLanguage
): RouteKey | null {
  // Remove leading/trailing slashes and split
  const cleanPath = path.replace(/^\/+|\/+$/g, "");

  // Find matching route key
  for (const [key, translatedPath] of Object.entries(
    routeTranslations[language]
  )) {
    if (translatedPath === cleanPath) {
      return key as RouteKey;
    }
  }
  return null;
}
