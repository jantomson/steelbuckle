"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Define the color scheme type
type ColorScheme = {
  id: string;
  name: string;
  primary: {
    background: string;
    text: string;
    border: string;
    line: string;
    accent: string;
  };
  logoVariant: "dark" | "white";
  lineVariant: "dark" | "white";
};

// Predefined color schemes (same as in AdminColorScheme.tsx)
const colorSchemes: ColorScheme[] = [
  {
    id: "default",
    name: "Kollane",
    primary: {
      background: "#fde047",
      text: "#000000",
      border: "#000000",
      line: "#000000",
      accent: "#6b7280",
    },
    logoVariant: "dark",
    lineVariant: "dark",
  },
  {
    id: "blue",
    name: "Sinine",
    primary: {
      background: "#000957",
      text: "#ffffff",
      border: "#ffffff",
      line: "#ffffff",
      accent: "#577BC1",
    },
    logoVariant: "white",
    lineVariant: "white",
  },
  {
    id: "green",
    name: "Roheline",
    primary: {
      background: "#C5FF95",
      text: "#16423C",
      border: "#16423C",
      line: "#16423C",
      accent: "#5CB338",
    },
    logoVariant: "dark",
    lineVariant: "dark",
  },
];

// Create context for color scheme
type ColorSchemeContextType = {
  currentScheme: ColorScheme;
  setColorScheme: (schemeId: string) => void;
};

const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(
  undefined
);

// Color scheme provider component
export const ColorSchemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Default to the first scheme
  const [currentScheme, setCurrentScheme] = useState<ColorScheme>(
    colorSchemes[0]
  );

  // Apply color scheme function
  const applyColorScheme = (scheme: ColorScheme) => {
    const root = document.documentElement;

    // Set CSS variables
    root.style.setProperty("--primary-background", scheme.primary.background);
    root.style.setProperty("--primary-text", scheme.primary.text);
    root.style.setProperty("--primary-border", scheme.primary.border);
    root.style.setProperty("--primary-line", scheme.primary.line);
    root.style.setProperty("--primary-accent", scheme.primary.accent);

    // Update logo and line images throughout the application
    updateLogoAndLineImages(scheme.logoVariant, scheme.lineVariant);

    // Store values in localStorage
    localStorage.setItem("site.colorScheme", scheme.id);
    localStorage.setItem("site.logoVariant", scheme.logoVariant);
    localStorage.setItem("site.lineVariant", scheme.lineVariant);

    // Dispatch a custom event to notify components
    window.dispatchEvent(new CustomEvent("colorSchemeChanged"));
  };

  // Update logo and line images helper function
  const updateLogoAndLineImages = (
    logoVariant: "dark" | "white",
    lineVariant: "dark" | "white"
  ) => {
    // Update all logo images
    document.querySelectorAll('img[src^="/logo_"]').forEach((img) => {
      const imgElement = img as HTMLImageElement;
      imgElement.src = `/logo_${logoVariant}.svg`;
    });

    // Update all line images
    document.querySelectorAll('img[src^="/line"]').forEach((img) => {
      const imgElement = img as HTMLImageElement;
      if (
        imgElement.src.includes("line_dark.svg") ||
        imgElement.src.includes("line_white.svg")
      ) {
        imgElement.src =
          lineVariant === "dark" ? "/line_dark.svg" : "/line_white.svg";
      }
    });
  };

  // Set color scheme function
  const setColorScheme = (schemeId: string) => {
    const scheme = colorSchemes.find((s) => s.id === schemeId);
    if (scheme) {
      setCurrentScheme(scheme);
      applyColorScheme(scheme);
    }
  };

  // Load saved color scheme on mount
  useEffect(() => {
    const savedSchemeId = localStorage.getItem("site.colorScheme") || "default";
    const scheme =
      colorSchemes.find((s) => s.id === savedSchemeId) || colorSchemes[0];
    setCurrentScheme(scheme);
    applyColorScheme(scheme);
  }, []);

  return (
    <ColorSchemeContext.Provider value={{ currentScheme, setColorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  );
};

// Custom hook to use the color scheme context
export const useColorScheme = () => {
  const context = useContext(ColorSchemeContext);

  // Create a dummy context that fetches from localStorage if not within provider
  if (context === undefined) {
    // Create a fallback implementation that works without the provider
    // This will at least prevent errors when components use the hook outside the provider
    const getSchemeFromLocalStorage = (): ColorScheme => {
      if (typeof window === "undefined") {
        return colorSchemes[0]; // Default to first scheme during SSR
      }

      const savedSchemeId =
        localStorage.getItem("site.colorScheme") || "default";
      return (
        colorSchemes.find((s) => s.id === savedSchemeId) || colorSchemes[0]
      );
    };

    // Log a warning instead of throwing an error
    console.warn(
      "useColorScheme is being used outside a ColorSchemeProvider. For better performance, wrap your component tree in a ColorSchemeProvider."
    );

    return {
      currentScheme: getSchemeFromLocalStorage(),
      setColorScheme: (schemeId: string) => {
        console.warn(
          "setColorScheme called outside provider - changes won't be reactive"
        );
        const scheme = colorSchemes.find((s) => s.id === schemeId);
        if (scheme) {
          // Apply the color scheme directly
          const root = document.documentElement;
          root.style.setProperty(
            "--primary-background",
            scheme.primary.background
          );
          root.style.setProperty("--primary-text", scheme.primary.text);
          root.style.setProperty("--primary-border", scheme.primary.border);
          root.style.setProperty("--primary-line", scheme.primary.line);
          root.style.setProperty("--primary-accent", scheme.primary.accent);

          localStorage.setItem("site.colorScheme", schemeId);
          localStorage.setItem("site.logoVariant", scheme.logoVariant);
          localStorage.setItem("site.lineVariant", scheme.lineVariant);
        }
      },
    };
  }

  return context;
};

export default ColorSchemeProvider;
