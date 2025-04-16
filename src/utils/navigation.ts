// utils/navigation.ts
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useCallback } from "react";
import {
  SupportedLanguage,
  RouteKey,
  buildLocalizedUrl,
  getRouteKeyFromPath,
  supportedLanguages,
  defaultLanguage,
} from "@/config/routeTranslations";
import { useLanguage } from "@/contexts/LanguageContext";

// Extract language code from path
export function extractLanguageFromPath(
  path: string
): SupportedLanguage | null {
  // Remove leading slash and get first segment
  const segments = path.split("/").filter(Boolean);
  const langCode = segments[0];

  // Check if it's a supported language
  if (langCode && supportedLanguages.includes(langCode as SupportedLanguage)) {
    return langCode as SupportedLanguage;
  }

  return null;
}

// Get remaining path without language prefix
export function getPathWithoutLanguage(path: string): string {
  const segments = path.split("/").filter(Boolean);

  // If first segment is a language code, remove it
  if (
    segments.length > 0 &&
    supportedLanguages.includes(segments[0] as SupportedLanguage)
  ) {
    return "/" + segments.slice(1).join("/");
  }

  return path;
}

// Check if path is an admin path that should not be localized
export function isAdminPath(path: string): boolean {
  return path.startsWith("/admin");
}

// Hook to navigate between localized routes
export function useLocalizedNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentLang, setCurrentLang, isLanguageLoaded } = useLanguage();

  // Navigate to a route by key
  const navigateToRoute = useCallback(
    (routeKey: RouteKey) => {
      const localizedPath = buildLocalizedUrl(
        routeKey,
        currentLang as SupportedLanguage
      );
      router.push(localizedPath);
    },
    [router, currentLang]
  );

  // Change language while preserving current route
  const changeLanguage = useCallback(
    (language: SupportedLanguage) => {
      // Only proceed if language has been loaded from localStorage
      if (!isLanguageLoaded) return;

      // Don't apply language changes to admin routes
      if (isAdminPath(pathname)) {
        setCurrentLang(language);
        return; // Exit early without changing the route
      }

      // Extract current route key from path
      const pathWithoutLang = getPathWithoutLanguage(pathname);
      const currentRouteKey = getRouteKeyFromPath(
        pathWithoutLang,
        currentLang as SupportedLanguage
      );

      // Update language context
      setCurrentLang(language);

      // If we have a valid route key, navigate to the same page in new language
      if (currentRouteKey) {
        const newPath = buildLocalizedUrl(currentRouteKey, language);
        router.push(newPath);
      } else {
        // Fallback to homepage in new language
        router.push(`/${language}`);
      }
    },
    [pathname, currentLang, setCurrentLang, router, isLanguageLoaded]
  );

  return {
    navigateToRoute,
    changeLanguage,
  };
}

// Hook to synchronize URL language with context
export function useSynchronizeLanguage() {
  const pathname = usePathname();
  const { currentLang, setCurrentLang, isLanguageLoaded } = useLanguage();

  useEffect(() => {
    // Only run this effect after language is loaded from localStorage
    if (!isLanguageLoaded) return;

    // Don't attempt to extract language from admin routes
    if (isAdminPath(pathname)) {
      return;
    }

    // Extract language from URL
    const urlLang = extractLanguageFromPath(pathname);

    // If URL has a valid language and it's different from context, update context
    if (urlLang && urlLang !== currentLang) {
      setCurrentLang(urlLang);
    }
  }, [pathname, currentLang, setCurrentLang, isLanguageLoaded]);
}
