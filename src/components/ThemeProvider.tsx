"use client";

import { useEffect } from "react";

// Match this to your color schemes in AdminColorScheme.tsx
type ThemeVariant = "default" | "blue" | "green";

// Reuse the same color values from your AdminColorScheme
const themes = {
  default: {
    background: "#fde047",
    text: "#000000",
    accent: "#6b7280",
    border: "#000000",
    line: "#000000",
    class: "theme-default",
    logoVariant: "dark",
    lineVariant: "dark",
  },
  blue: {
    background: "#000957",
    text: "#ffffff",
    accent: "#577BC1",
    border: "#ffffff",
    line: "#ffffff",
    class: "theme-blue",
    logoVariant: "white",
    lineVariant: "white",
  },
  green: {
    background: "#C5FF95",
    text: "#16423C",
    accent: "#5CB338",
    border: "#16423C",
    line: "#16423C",
    class: "theme-green",
    logoVariant: "dark",
    lineVariant: "dark",
  },
};

// The component that will load and apply your theme
const ThemeProvider = () => {
  useEffect(() => {
    // Function to apply the theme from localStorage
    const applyStoredTheme = () => {
      const storedTheme =
        (localStorage.getItem("site.colorScheme") as ThemeVariant) || "default";
      applyTheme(storedTheme);
    };

    // Function to actually apply theme to document
    const applyTheme = (themeId: ThemeVariant) => {
      const theme = themes[themeId];
      const html = document.documentElement;

      // First remove all theme classes
      Object.values(themes).forEach((t) => {
        html.classList.remove(t.class);
      });

      // Add the selected theme class
      html.classList.add(theme.class);

      // Apply CSS variables directly
      document.documentElement.style.setProperty(
        "--primary-background",
        theme.background
      );
      document.documentElement.style.setProperty("--primary-text", theme.text);
      document.documentElement.style.setProperty(
        "--primary-accent",
        theme.accent
      );
      document.documentElement.style.setProperty(
        "--primary-border",
        theme.border
      );
      document.documentElement.style.setProperty("--primary-line", theme.line);
    };

    // Apply theme on initial load
    applyStoredTheme();

    // Listen for changes from other components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "site.colorScheme") {
        applyStoredTheme();
      }
    };

    // Listen for custom colorSchemeChanged event
    const handleColorSchemeChange = () => {
      applyStoredTheme();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("colorSchemeChanged", handleColorSchemeChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("colorSchemeChanged", handleColorSchemeChange);
    };
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default ThemeProvider;
