// components/admin/AdminColorScheme.tsx - Hybrid version that works with both systems
"use client";
import React, { useState, useEffect } from "react";
import { useGlobalColorScheme } from "@/components/admin/GlobalColorSchemeProvider";
import { useEdit } from "@/contexts/EditContext";
import type { ColorScheme } from "@/lib/config";

// Your existing color schemes
const colorSchemes: ColorScheme[] = [
  {
    id: "default",
    name: "Kollane",
    themeClass: "theme-default",
    logoVariant: "dark",
    lineVariant: "dark",
    colors: {
      background: "#fde047",
      text: "#000000",
      accent: "#6b7280",
      border: "#000000",
      line: "#000000",
    },
  },
  {
    id: "blue",
    name: "Sinine",
    themeClass: "theme-blue",
    logoVariant: "white",
    lineVariant: "white",
    colors: {
      background: "#000957",
      text: "#ffffff",
      accent: "#577BC1",
      border: "#ffffff",
      line: "#ffffff",
    },
  },
  {
    id: "green",
    name: "Roheline",
    themeClass: "theme-green",
    logoVariant: "dark",
    lineVariant: "dark",
    colors: {
      background: "#C5FF95",
      text: "#16423C",
      accent: "#5CB338",
      border: "#16423C",
      line: "#16423C",
    },
  },
];

// Create a custom event with payload for better type safety and data passing
const createColorSchemeChangedEvent = (
  schemeId: string,
  logoVariant: "dark" | "white",
  lineVariant: "dark" | "white"
) => {
  const event = new CustomEvent("colorSchemeChanged", {
    detail: {
      schemeId,
      logoVariant,
      lineVariant,
    },
  });
  window.dispatchEvent(event);
};

const AdminColorScheme = () => {
  // Try to use the global color scheme system first
  const globalColorScheme = useGlobalColorScheme();

  // Fallback to useEdit if global system is not available
  const editContext = useEdit ? useEdit() : null;
  const { updateMedia } = editContext || { updateMedia: () => {} };

  // Determine which system to use
  const useGlobalSystem = globalColorScheme && !globalColorScheme.isLoading;

  const [selectedScheme, setSelectedScheme] = useState<string>(
    useGlobalSystem ? globalColorScheme.colorScheme?.id || "blue" : "blue"
  );
  const [applyingScheme, setApplyingScheme] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Update selected scheme when global color scheme changes
  useEffect(() => {
    if (useGlobalSystem && globalColorScheme.colorScheme) {
      setSelectedScheme(globalColorScheme.colorScheme.id);
    }
  }, [useGlobalSystem, globalColorScheme.colorScheme]);

  // Load current scheme on component mount (fallback for localStorage system)
  useEffect(() => {
    if (!useGlobalSystem) {
      const applyFromStorage = () => {
        const savedScheme = localStorage.getItem("site.colorScheme") || "blue";
        setSelectedScheme(savedScheme);

        const scheme = colorSchemes.find((s) => s.id === savedScheme);
        if (scheme) {
          applyColorSchemeLocally(scheme);
        }
      };

      applyFromStorage();

      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "site.colorScheme") {
          applyFromStorage();
        }
      };

      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, [useGlobalSystem]);

  // Function to apply CSS variables directly to the document (for localStorage fallback)
  const applyCSSVariables = (scheme: ColorScheme) => {
    document.documentElement.style.setProperty(
      "--primary-background",
      scheme.colors.background
    );
    document.documentElement.style.setProperty(
      "--primary-text",
      scheme.colors.text
    );
    document.documentElement.style.setProperty(
      "--primary-accent",
      scheme.colors.accent
    );
    document.documentElement.style.setProperty(
      "--primary-border",
      scheme.colors.border
    );
    document.documentElement.style.setProperty(
      "--primary-line",
      scheme.colors.line
    );
  };

  // Function to apply color scheme locally (for localStorage fallback)
  const applyColorSchemeLocally = (scheme: ColorScheme) => {
    const html = document.documentElement;

    // Remove all theme classes
    const allThemeClasses = [
      "theme-default",
      "theme-kollane",
      "theme-blue",
      "theme-sinine",
      "theme-green",
      "theme-roheline",
    ];
    allThemeClasses.forEach((s) => {
      html.classList.remove(s);
    });

    // Add the selected theme class
    html.classList.add(scheme.themeClass);

    // Apply CSS variables directly for immediate effect
    applyCSSVariables(scheme);

    // Store in localStorage
    localStorage.setItem("site.colorScheme", scheme.id);
    localStorage.setItem("site.logoVariant", scheme.logoVariant);
    localStorage.setItem("site.lineVariant", scheme.lineVariant);

    // Broadcast change to any listening components with detailed payload
    createColorSchemeChangedEvent(
      scheme.id,
      scheme.logoVariant,
      scheme.lineVariant
    );

    // Update logo and line images
    updateLogoAndLineImages(scheme.logoVariant, scheme.lineVariant);
  };

  // Helper function to update logo and line images
  const updateLogoAndLineImages = (
    logoVariant: "dark" | "white",
    lineVariant: "dark" | "white"
  ) => {
    // Update all logo images
    document.querySelectorAll('img[src*="logo_"]').forEach((img) => {
      const imgElement = img as HTMLImageElement;
      imgElement.src = `/logo_${logoVariant}.svg`;
    });

    // Update all line images
    document.querySelectorAll('img[src*="line_"]').forEach((img) => {
      const imgElement = img as HTMLImageElement;
      imgElement.src = `/line_${lineVariant}.svg`;
    });

    console.log(`Updated images: Logo: ${logoVariant}, Line: ${lineVariant}`);
  };

  // Handle color scheme change
  const handleSchemeChange = async (schemeId: string) => {
    if (applyingScheme) return;

    setSelectedScheme(schemeId);
    setApplyingScheme(true);

    try {
      const scheme = colorSchemes.find((s) => s.id === schemeId);
      if (!scheme) return;

      if (useGlobalSystem) {
        // Use global system
        const success = await globalColorScheme.updateColorScheme(scheme);
        if (success) {
          setLastSaved(new Date().toLocaleTimeString());
          console.log(`Global color scheme changed to: ${scheme.name}`);
        } else {
          console.error("Failed to update global color scheme");
          setSelectedScheme(globalColorScheme.colorScheme?.id || "blue");
        }
      } else {
        // Use localStorage fallback system
        applyColorSchemeLocally(scheme);

        // Update the media paths for logo and line if updateMedia is available
        if (updateMedia) {
          const logoPath = `/logo_${scheme.logoVariant}.svg`;
          const linePath = `/line_${scheme.lineVariant}.svg`;
          updateMedia("site.logo", logoPath);
          updateMedia("site.line", linePath);
        }

        setLastSaved(new Date().toLocaleTimeString());
        console.log(`Local color scheme changed to: ${scheme.name}`);
      }
    } catch (error) {
      console.error("Error applying color scheme:", error);
      // Revert selection on error
      if (useGlobalSystem) {
        setSelectedScheme(globalColorScheme.colorScheme?.id || "blue");
      }
    } finally {
      setApplyingScheme(false);
    }
  };

  // Show loading state
  if (useGlobalSystem && globalColorScheme.isLoading) {
    return (
      <div className="p-6 bg-white shadow-md rounded-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentScheme = useGlobalSystem
    ? globalColorScheme.colorScheme
    : colorSchemes.find((s) => s.id === selectedScheme);

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-medium text-gray-800">Värviskeemid</h3>
      </div>

      <div className="space-y-4">
        {colorSchemes.map((scheme) => (
          <div
            key={scheme.id}
            className={`relative border-2 p-4 rounded-lg cursor-pointer transition-all ${
              selectedScheme === scheme.id
                ? "border-green-500 bg-green-50 shadow-md"
                : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
            } ${applyingScheme ? "opacity-60 pointer-events-none" : ""}`}
            onClick={() => !applyingScheme && handleSchemeChange(scheme.id)}
          >
            <div className="flex items-center space-x-4">
              {/* Color preview */}
              <div className="flex space-x-2">
                <div
                  className="w-8 h-8 rounded border border-gray-300 shadow-sm"
                  style={{ backgroundColor: scheme.colors.background }}
                  title={`Taust: ${scheme.colors.background}`}
                />
                <div
                  className="w-8 h-8 rounded border border-gray-300 shadow-sm"
                  style={{ backgroundColor: scheme.colors.text }}
                  title={`Tekst: ${scheme.colors.text}`}
                />
                <div
                  className="w-8 h-8 rounded border border-gray-300 shadow-sm"
                  style={{ backgroundColor: scheme.colors.accent }}
                  title={`Rõhutus: ${scheme.colors.accent}`}
                />
              </div>

              {/* Scheme info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-gray-800 text-lg">
                    {scheme.name}
                  </span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Logo: {scheme.logoVariant === "dark" ? "Tume" : "Hele"}
                  </span>
                </div>
              </div>
            </div>

            {/* Selected indicator */}
            {selectedScheme === scheme.id && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}

            {/* Loading overlay for this specific scheme */}
            {applyingScheme && selectedScheme === scheme.id && (
              <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
                <svg
                  className="animate-spin h-6 w-6 text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Global loading indicator */}
      {applyingScheme && (
        <div className="mt-6 text-sm text-green-600 flex items-center justify-center p-3 bg-green-50 rounded-lg">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Värviskeemi rakendamine{" "}
          {useGlobalSystem ? "kõigile kasutajatele" : ""}...
        </div>
      )}
    </div>
  );
};

export default AdminColorScheme;
