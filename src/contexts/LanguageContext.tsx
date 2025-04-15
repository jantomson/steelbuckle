// contexts/LanguageContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Language = {
  code: string;
  name: string;
};

type LanguageContextType = {
  currentLang: string;
  setCurrentLang: (lang: string) => void;
  availableLanguages: Language[];
  isLanguageLoaded: boolean; // New loading state flag
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Default languages (fallback if API fails)
const DEFAULT_LANGUAGES: Language[] = [
  { code: "est", name: "Est" },
  { code: "en", name: "En" },
  { code: "lv", name: "Lv" },
  { code: "ru", name: "Ru" },
];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLang, setCurrentLang] = useState("est");
  const [availableLanguages, setAvailableLanguages] =
    useState<Language[]>(DEFAULT_LANGUAGES);
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false); // Initialize as not loaded

  // Load language preference from localStorage - run this first
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("language") || "est";
      setCurrentLang(savedLang);
      setIsLanguageLoaded(true); // Mark language as loaded after getting from localStorage
      console.log("Language loaded from localStorage:", savedLang);
    } catch (error) {
      console.error("Failed to load language from localStorage:", error);
      // Still mark as loaded even if there's an error, using the default
      setIsLanguageLoaded(true);
    }
  }, []);

  // Fetch available languages from API - this can run after the locale is loaded
  useEffect(() => {
    async function fetchLanguages() {
      try {
        const response = await fetch("/api/languages");

        if (response.ok) {
          const data = await response.json();
          setAvailableLanguages(data);
        }
      } catch (error) {
        console.error("Failed to fetch languages:", error);
      }
    }

    if (isLanguageLoaded) {
      fetchLanguages();
    }
  }, [isLanguageLoaded]); // Only run after language is loaded from localStorage

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
