// components/LanguageSelector.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  SupportedLanguage,
  routeTranslations,
  buildLocalizedUrl,
  getRouteKeyFromPath,
} from "@/config/routeTranslations";

type Language = {
  code: string;
  name: string;
  path?: string;
};

interface LanguageSelectorProps {
  languages?: Language[];
  defaultLanguage?: string;
}

// Helper function to check if we're in admin section
function isAdminRoute(pathname: string): boolean {
  return pathname.includes("/admin");
}

export default function LanguageSelector({
  languages = [
    { code: "et", name: "Et", path: "/et" },
    { code: "en", name: "En", path: "/en" },
    { code: "ru", name: "Ru", path: "/ru" },
    { code: "lv", name: "Lv", path: "/lv" },
  ],
  defaultLanguage = "et",
}: LanguageSelectorProps) {
  const { currentLang, setCurrentLang, isLanguageLoaded } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setSelectedLanguage(currentLang);
  }, [currentLang]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLanguageSelect = (languageCode: string) => {
    if (!isLanguageLoaded || !pathname) return;

    setSelectedLanguage(languageCode);
    setIsOpen(false);
    setCurrentLang(languageCode);

    // Check if we're in admin section - if so, only update language, don't navigate
    if (isAdminRoute(pathname)) {
      // Set cookie to persist language
      document.cookie = `language=${languageCode}; path=/; max-age=31536000; SameSite=Lax`;

      // Optional: Show a notification that language was changed
      const showNotification = () => {
        const notification = document.createElement("div");
        notification.textContent = `Language changed to ${languageCode.toUpperCase()} (content only)`;
        notification.style.position = "fixed";
        notification.style.bottom = "20px";
        notification.style.right = "20px";
        notification.style.padding = "10px";
        notification.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        notification.style.color = "white";
        notification.style.borderRadius = "5px";
        notification.style.zIndex = "9999";
        notification.style.fontSize = "14px";

        document.body.appendChild(notification);

        setTimeout(() => {
          notification.style.opacity = "0";
          notification.style.transition = "opacity 0.5s ease";
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 500);
        }, 2000);
      };

      showNotification();
      return; // Exit early - don't navigate!
    }

    // Regular site navigation logic below
    // Get current path without language prefix
    let pathWithoutLang = pathname;

    // Include all possible language prefixes
    const languagePrefixes = [
      "/en/",
      "/en",
      "/ru/",
      "/ru",
      "/lv/",
      "/lv",
      "/et/",
      "/et",
    ];

    // Remove language prefix if present
    for (const prefix of languagePrefixes) {
      if (pathname.startsWith(prefix)) {
        pathWithoutLang = pathname.substring(prefix.length) || "/";
        break;
      }
    }

    // Special case for root path
    if (pathWithoutLang === "" || pathWithoutLang === "/") {
      router.push(`/${languageCode}`);
      return;
    }

    // Get the route key for current path
    const currentLangType = currentLang as SupportedLanguage;
    let routeKey = null;

    // Clean path for matching
    const cleanPath = pathWithoutLang.replace(/^\/+|\/+$/g, "");

    // Find route key by comparing path with translations
    for (const [key, translatedPath] of Object.entries(
      routeTranslations[currentLangType]
    )) {
      if (cleanPath === translatedPath) {
        routeKey = key;
        break;
      }
    }

    // If we found a route key, build the new URL
    if (routeKey) {
      const targetLang = languageCode as SupportedLanguage;
      const newPath = buildLocalizedUrl(routeKey as any, targetLang);
      router.push(newPath);
    } else {
      // Fallback: if route key not found, just add language prefix to current path
      router.push(
        `/${languageCode}${pathWithoutLang === "/" ? "" : pathWithoutLang}`
      );
    }
  };

  const selectedLang = languages.find((lang) => lang.code === selectedLanguage);

  // Filter out current language and sort alphabetically
  const otherLanguages = languages
    .filter((lang) => lang.code !== selectedLanguage)
    .sort((a, b) => a.code.localeCompare(b.code));

  return (
    <div
      className="relative"
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        className={`flex items-center justify-center transition-all duration-200 bg-transparent text-primary-text border border-primary-text ${
          isOpen
            ? "rounded-t-full border-b-0 py-2 px-4"
            : "rounded-full py-2 px-4"
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{selectedLang?.name}</span>
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full z-30 mt-0 w-full overflow-hidden rounded-b-3xl text-primary-text shadow-lg border border-primary-text border-t-0 bg-primary-background"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
            {otherLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className="block w-full px-4 py-2 text-left hover:font-bold scale-105 focus:font-bold scale-105 focus:outline-none"
                role="menuitem"
              >
                {language.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
