// hooks/useTranslation.ts
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePathname } from "next/navigation";

type Translations = {
  [key: string]: string | { [key: string]: string | object };
};

// Cache size limit to avoid memory bloat
const CACHE_SIZE_LIMIT = 5;

// Cache translations to avoid unnecessary API calls
const translationsCache: Record<
  string,
  { data: Translations; timestamp: number }
> = {};

// This will be used to invalidate the cache when translations are updated
let lastUpdateTimestamp = Date.now();

// Helper to maintain a limited size cache
const addToTranslationsCache = (key: string, data: Translations) => {
  // Create sorted list of cache entries by timestamp (oldest first)
  const entries = Object.entries(translationsCache).sort(
    (a, b) => a[1].timestamp - b[1].timestamp
  );

  // If we're at the limit, remove the oldest entries
  while (entries.length >= CACHE_SIZE_LIMIT) {
    const oldest = entries.shift();
    if (oldest) {
      delete translationsCache[oldest[0]];
    }
  }

  // Add the new entry
  translationsCache[key] = {
    data,
    timestamp: Date.now(),
  };
};

export function invalidateTranslationsCache() {
  lastUpdateTimestamp = Date.now();
  Object.keys(translationsCache).forEach((key) => {
    delete translationsCache[key];
  });
}

// Helper function to detect language from path
export function detectLanguageFromPath(path: string): string {
  if (path.startsWith("/en")) return "en";
  if (path.startsWith("/lv")) return "lv";
  if (path.startsWith("/ru")) return "ru";
  if (path.startsWith("/et")) return "et";
  return "et"; // Default
}

export function useTranslation() {
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);
  const [cacheTimestamp, setCacheTimestamp] = useState(lastUpdateTimestamp);
  const { currentLang, setCurrentLang, isLanguageLoaded } = useLanguage();
  const isMounted = useRef(true);
  const fetchingTranslations = useRef(false);
  const pathname = usePathname();

  // Detect language from URL path
  useEffect(() => {
    if (pathname) {
      const pathLang = detectLanguageFromPath(pathname);
      if (pathLang !== currentLang) {
        setCurrentLang(pathLang);
      }
    }
  }, [pathname, currentLang, setCurrentLang]);

  // Fetch translations from the API, but only after language is loaded
  useEffect(() => {
    // Setup cleanup flag
    isMounted.current = true;

    async function fetchTranslations() {
      // Don't fetch if language isn't loaded from localStorage yet
      if (!isLanguageLoaded) {
        return;
      }

      // Prevent multiple simultaneous fetches
      if (fetchingTranslations.current) return;

      fetchingTranslations.current = true;

      // Return cached translations if available and not invalidated
      if (
        translationsCache[currentLang] &&
        cacheTimestamp === lastUpdateTimestamp
      ) {
        setTranslations(translationsCache[currentLang].data);
        setIsLoading(false);
        fetchingTranslations.current = false;
        return;
      }

      try {
        setIsLoading(true);

        // Log the language being used for translation
        console.log(
          `useTranslation: Fetching translations for language: ${currentLang}`
        );

        // Add a timestamp query param to avoid browser caching
        const response = await fetch(
          `/api/translations?lang=${currentLang}&_t=${Date.now()}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch translations: ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log(
          `useTranslation: Successfully loaded translations for ${currentLang}`
        );

        // Cache translations
        addToTranslationsCache(currentLang, data);

        if (isMounted.current) {
          setTranslations(data);
          // Update cache timestamp
          setCacheTimestamp(lastUpdateTimestamp);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading translations:", error);
        if (isMounted.current) {
          setIsLoading(false);
        }
      } finally {
        fetchingTranslations.current = false;
      }
    }

    fetchTranslations();

    // Cleanup
    return () => {
      isMounted.current = false;
    };
  }, [currentLang, cacheTimestamp, isLanguageLoaded]);

  // Translation function - memoized for performance
  const t = useCallback(
    (key: string, defaultValue?: string): string => {
      if (isLoading) {
        return defaultValue || ""; // Return key or default value during loading
      }

      // Navigate the nested translations object
      const keys = key.split(".");
      let value: any = translations;

      for (const k of keys) {
        if (!value || typeof value !== "object") {
          return defaultValue || ""; // Return the key as fallback
        }
        value = value[k];
      }

      if (value === undefined || value === null) {
        return defaultValue || "";
      }

      return String(value);
    },
    [translations, isLoading]
  );

  // Function to reload translations - memoized
  const reloadTranslations = useCallback(() => {
    invalidateTranslationsCache();
    setCacheTimestamp(lastUpdateTimestamp);
  }, []);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({
      t,
      isLoading,
      currentLang,
      changeLanguage: setCurrentLang,
      reloadTranslations,
    }),
    [t, isLoading, currentLang, setCurrentLang, reloadTranslations]
  );
}
