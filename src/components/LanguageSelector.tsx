"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

type Language = {
  code: string;
  name: string;
};

interface LanguageSelectorProps {
  languages?: Language[];
  defaultLanguage?: string;
}

export default function LanguageSelector({
  languages = [
    { code: "est", name: "Est" },
    { code: "en", name: "En" },
    { code: "ru", name: "Ru" },
    { code: "lv", name: "Lv" },
  ],
  defaultLanguage = "est",
}: LanguageSelectorProps) {
  const { currentLang, changeLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    setSelectedLanguage(languageCode);
    setIsOpen(false);
    changeLanguage(languageCode);
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
