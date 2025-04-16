// contexts/LanguageContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type Language = {
  code: string;
  name: string;
  path?: string;
};

type LanguageContextType = {
  currentLang: string;
  setCurrentLang: (lang: string) => void;
  availableLanguages: Language[];
  isLanguageLoaded: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Default languages with path mapping
const DEFAULT_LANGUAGES: Language[] = [
  { code: "et", name: "Et", path: "/et" },
  { code: "en", name: "En", path: "/en" },
  { code: "lv", name: "Lv", path: "/lv" },
  { code: "ru", name: "Ru", path: "/ru" },
];

// Function to detect language from URL path
function detectLanguageFromPath(path: string): string {
  if (path.startsWith("/en")) return "en";
  if (path.startsWith("/lv")) return "lv";
  if (path.startsWith("/ru")) return "ru";
  if (path.startsWith("/et")) return "et";
  return "et"; // Default
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLang, setCurrentLang] = useState("et");
  const [availableLanguages, setAvailableLanguages] =
    useState<Language[]>(DEFAULT_LANGUAGES);
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);
  const pathname = usePathname();

  // Detect language from URL path and load it
  useEffect(() => {
    if (pathname) {
      // Determine language based on URL path
      const detectedLang = detectLanguageFromPath(pathname);

      // Set detected language
      setCurrentLang(detectedLang);

      try {
        // Save to localStorage for consistency
        localStorage.setItem("language", detectedLang);
      } catch (error) {
        console.error("Failed to save language to localStorage:", error);
      }

      setIsLanguageLoaded(true);
      console.log("Language detected from URL path:", detectedLang);
    } else {
      // Fallback to localStorage if pathname is not available
      try {
        const savedLang = localStorage.getItem("language") || "et";
        setCurrentLang(savedLang);
        setIsLanguageLoaded(true);
      } catch (error) {
        console.error("Failed to load language from localStorage:", error);
        setCurrentLang("et");
        setIsLanguageLoaded(true);
      }
    }
  }, [pathname]);

  // Fetch available languages from API - this can run after the locale is loaded
  useEffect(() => {
    async function fetchLanguages() {
      try {
        const response = await fetch("/api/languages");

        if (response.ok) {
          const data = await response.json();

          // Add path properties to the languages
          const enhancedLanguages = data.map((lang: Language) => {
            const pathMapping: { [key: string]: string } = {
              et: "/et",
              en: "/en",
              lv: "/lv",
              ru: "/ru",
            };

            return {
              ...lang,
              path: pathMapping[lang.code] || "/et",
            };
          });

          setAvailableLanguages(enhancedLanguages);
        }
      } catch (error) {
        console.error("Failed to fetch languages:", error);
      }
    }

    if (isLanguageLoaded) {
      fetchLanguages();
    }
  }, [isLanguageLoaded]);

  // Just update the language in localStorage
  const handleLanguageChange = (lang: string) => {
    setCurrentLang(lang);
    try {
      localStorage.setItem("language", lang);
    } catch (error) {
      console.error("Failed to save language to localStorage:", error);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        setCurrentLang: handleLanguageChange,
        availableLanguages,
        isLanguageLoaded,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
