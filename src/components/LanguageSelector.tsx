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
  const isAdminMode = isAdminRoute(pathname);

  // Initialize the selected language on component mount
  useEffect(() => {
    if (isAdminMode) {
      // For admin mode, check session/local storage first
      const adminLang =
        sessionStorage.getItem("adminEditingLanguage") ||
        sessionStorage.getItem("editingLanguage") ||
        localStorage.getItem("adminLastEditedLanguage") ||
        currentLang;

      console.log(
        `LanguageSelector admin mode: Setting display language to ${adminLang}`
      );
      setSelectedLanguage(adminLang);
    } else {
      // For normal mode, use the language context
      setSelectedLanguage(currentLang);
    }
  }, [isAdminMode, currentLang]);

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

  // Listen for admin-language-changed events
  useEffect(() => {
    const handleAdminLanguageChange = (event: CustomEvent) => {
      if (event.detail && event.detail.language) {
        console.log(
          `LanguageSelector received language change event: ${event.detail.language}`
        );
        setSelectedLanguage(event.detail.language);
      }
    };

    window.addEventListener(
      "admin-language-changed",
      handleAdminLanguageChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "admin-language-changed",
        handleAdminLanguageChange as EventListener
      );
    };
  }, []);

  const handleLanguageSelect = (languageCode: string) => {
    if (!isLanguageLoaded || !pathname) return;

    console.log(`LanguageSelector: Changing language to ${languageCode}`);

    // Immediately update the UI display
    setSelectedLanguage(languageCode);
    setIsOpen(false);

    // Check if we're in admin section
    if (isAdminMode) {
      console.log(`Admin mode: Changing editing language to ${languageCode}`);

      // Update the language in all storage locations for consistency
      document.cookie = `language=${languageCode}; path=/; max-age=31536000; SameSite=Lax`;
      localStorage.setItem("language", languageCode);
      localStorage.setItem("adminLastEditedLanguage", languageCode);
      sessionStorage.setItem("editingLanguage", languageCode);
      sessionStorage.setItem("adminEditingLanguage", languageCode);
      sessionStorage.setItem("lastSavedLanguage", languageCode);

      // Force the URL to include the selected language in query param
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set("lang", languageCode);

      // Use history.replaceState to update URL without a full page reload
      window.history.replaceState({}, "", currentUrl.toString());

      // IMPORTANT: Dispatch event to both notify other components and invalidate translation caches
      try {
        // Dispatch admin language change event
        const languageEvent = new CustomEvent("admin-language-changed", {
          detail: { language: languageCode },
        });
        window.dispatchEvent(languageEvent);

        // Dispatch a custom event to force reload translations
        const reloadEvent = new CustomEvent("reload-translations", {
          detail: { language: languageCode, timestamp: Date.now() },
        });
        window.dispatchEvent(reloadEvent);

        console.log(
          "Dispatched admin-language-changed and reload-translations events"
        );

        // Show a visual confirmation
        showNotification(languageCode);

        // OPTIONAL: Consider forcefully reloading the page if updates aren't reflected
        // This is a fallback but would lose unsaved changes
        // setTimeout(() => window.location.reload(), 500);
      } catch (error) {
        console.error("Failed to dispatch language change events:", error);
      }

      return; // Don't continue with the regular navigation
    }

    // Regular site navigation - update context and navigate
    setCurrentLang(languageCode);

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

  // Function to show a visual notification
  const showNotification = (languageCode: string) => {
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

  // Get the currently selected language object with fallback
  const selectedLang =
    languages.find((lang) => lang.code === selectedLanguage) ||
    languages.find((lang) => lang.code === "et"); // Fallback to Estonian

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
                className="block w-full px-4 py-2 text-left hover:font-bold scale-105 focus:font-bold focus:outline-none"
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
