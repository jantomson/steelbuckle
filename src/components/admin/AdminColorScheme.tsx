"use client";

import React, { useState, useEffect } from "react";
import { useEdit } from "@/contexts/EditContext";

type ColorScheme = {
  id: string;
  name: string;
  themeClass: string;
  logoVariant: "dark" | "white";
  lineVariant: "dark" | "white";
  colors: {
    background: string;
    text: string;
    accent: string;
    border: string;
    line: string;
  };
};

// Predefined color schemes - now with complete color set
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
      background: "#275545",
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
      schemeId, // Add the scheme ID to the event
      logoVariant,
      lineVariant,
    },
  });
  window.dispatchEvent(event);
};

const AdminColorScheme = () => {
  const { updateMedia } = useEdit();
  const [selectedScheme, setSelectedScheme] = useState<string>("default");
  const [applyingScheme, setApplyingScheme] = useState(false);

  // Function to actually apply the CSS variables directly to the document
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

  // Load current scheme on component mount
  useEffect(() => {
    // This function now applies directly to CSS variables as well as via classes
    const applyFromStorage = () => {
      const savedScheme = localStorage.getItem("site.colorScheme") || "default";
      setSelectedScheme(savedScheme);

      // Find the scheme object
      const scheme = colorSchemes.find((s) => s.id === savedScheme);
      if (scheme) {
        applyColorScheme(scheme);
      }
    };

    // Run on initial component mount
    applyFromStorage();

    // Set up a handler for storage events from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "site.colorScheme") {
        applyFromStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Function to apply color scheme - enhanced to work with CSS variables directly
  const applyColorScheme = (scheme: ColorScheme) => {
    const html = document.documentElement;

    // Remove all theme classes
    colorSchemes.forEach((s) => {
      html.classList.remove(s.themeClass);
    });

    // Add the selected theme class
    html.classList.add(scheme.themeClass);

    // IMPORTANT: Apply CSS variables directly for immediate effect
    applyCSSVariables(scheme);

    // Store in localStorage - these persist between page reloads
    localStorage.setItem("site.colorScheme", scheme.id);
    localStorage.setItem("site.logoVariant", scheme.logoVariant);
    localStorage.setItem("site.lineVariant", scheme.lineVariant);

    // Broadcast change to any listening components with detailed payload
    createColorSchemeChangedEvent(
      scheme.id,
      scheme.logoVariant,
      scheme.lineVariant
    );

    // Also force update all logo and line images immediately
    updateLogoAndLineImages(scheme.logoVariant, scheme.lineVariant);
  };

  // Helper function to update logo and line images
  const updateLogoAndLineImages = (
    logoVariant: "dark" | "white",
    lineVariant: "dark" | "white"
  ) => {
    // Update all logo images - using a more specific selector
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
    setSelectedScheme(schemeId);
    setApplyingScheme(true);

    try {
      // Find the selected scheme
      const scheme = colorSchemes.find((s) => s.id === schemeId);

      if (scheme) {
        // Apply the scheme immediately
        applyColorScheme(scheme);

        // Update the media paths for logo and line
        const logoPath = `/logo_${scheme.logoVariant}.svg`;
        const linePath = `/line_${scheme.lineVariant}.svg`;

        // Use updateMedia to update the logo and line images
        updateMedia("site.logo", logoPath);
        updateMedia("site.line", linePath);
      }
    } catch (error) {
      console.error("Error applying color scheme:", error);
    } finally {
      setApplyingScheme(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h3 className="text-xl font-medium mb-4 text-gray-800">Värviskeemid</h3>

      <div className="space-y-4">
        {colorSchemes.map((scheme) => (
          <div
            key={scheme.id}
            className={`relative border-2 p-4 rounded-lg cursor-pointer transition-all ${
              selectedScheme === scheme.id
                ? "border-green-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSchemeChange(scheme.id)}
          >
            <div className="flex items-center space-x-4">
              {/* Color preview */}
              <div className="flex space-x-2">
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: scheme.colors.background }}
                  title="Background"
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: scheme.colors.text }}
                  title="Text"
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: scheme.colors.accent }}
                  title="Accent"
                />
              </div>

              {/* Scheme name */}
              <span className="font-medium text-gray-800">{scheme.name}</span>

              {/* Logo variant */}
              <span className="text-sm text-gray-500">
                Logo: {scheme.logoVariant === "dark" ? "Dark" : "White"}
              </span>
            </div>

            {/* Selected indicator */}
            {selectedScheme === scheme.id && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
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
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      {applyingScheme && (
        <div className="mt-4 text-sm text-green-500 flex items-center">
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
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Applying color scheme...
        </div>
      )}
    </div>
  );
};

export default AdminColorScheme;
