// components/GlobalColorSchemeProvider.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { ColorScheme } from "@/lib/config";

type ColorSchemeContextType = {
  colorScheme: ColorScheme | null;
  updateColorScheme: (scheme: ColorScheme) => Promise<boolean>;
  isLoading: boolean;
};

const ColorSchemeContext = createContext<ColorSchemeContextType>({
  colorScheme: null,
  updateColorScheme: async () => false,
  isLoading: true,
});

export const useGlobalColorScheme = () => useContext(ColorSchemeContext);

export function GlobalColorSchemeProvider({
  children,
  initialColorScheme,
}: {
  children: React.ReactNode;
  initialColorScheme?: ColorScheme;
}) {
  const [colorScheme, setColorScheme] = useState<ColorScheme | null>(
    initialColorScheme || null
  );
  const [isLoading, setIsLoading] = useState(!initialColorScheme);

  // Fetch current color scheme on mount if not provided via SSR
  useEffect(() => {
    if (!initialColorScheme) {
      fetchColorScheme();
    } else {
      setIsLoading(false);
    }
  }, [initialColorScheme]);

  // Apply CSS variables and theme when color scheme changes
  useEffect(() => {
    if (colorScheme) {
      applyCSSVariables(colorScheme);
    }
  }, [colorScheme]);

  const fetchColorScheme = async () => {
    try {
      const response = await fetch("/api/color-scheme");
      if (response.ok) {
        const config = await response.json();
        setColorScheme(config.colorScheme);
      }
    } catch (error) {
      console.error("Error fetching color scheme:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateColorScheme = async (
    newScheme: ColorScheme
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/color-scheme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ colorScheme: newScheme }),
      });

      if (response.ok) {
        setColorScheme(newScheme);

        // Broadcast to other tabs/windows using localStorage event
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            "colorScheme-update",
            JSON.stringify({
              scheme: newScheme,
              timestamp: Date.now(),
            })
          );

          // Remove the item immediately to trigger storage event on same tab
          window.localStorage.removeItem("colorScheme-update");
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating color scheme:", error);
      return false;
    }
  };

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "colorScheme-update") {
        fetchColorScheme(); // Refresh from server
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, []);

  const applyCSSVariables = (scheme: ColorScheme) => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    // Remove all theme classes
    const themeClasses = [
      "theme-default",
      "theme-kollane",
      "theme-blue",
      "theme-sinine",
      "theme-green",
      "theme-roheline",
    ];
    themeClasses.forEach((cls) => root.classList.remove(cls));

    // Add current theme class
    root.classList.add(scheme.themeClass);

    // Apply CSS variables
    root.style.setProperty("--primary-background", scheme.colors.background);
    root.style.setProperty("--primary-text", scheme.colors.text);
    root.style.setProperty("--primary-accent", scheme.colors.accent);
    root.style.setProperty("--primary-border", scheme.colors.border);
    root.style.setProperty("--primary-line", scheme.colors.line);

    // Update logo and line images
    document.querySelectorAll('img[src*="logo_"]').forEach((img) => {
      const imgElement = img as HTMLImageElement;
      imgElement.src = `/logo_${scheme.logoVariant}.svg`;
    });

    document.querySelectorAll('img[src*="line_"]').forEach((img) => {
      const imgElement = img as HTMLImageElement;
      imgElement.src = `/line_${scheme.lineVariant}.svg`;
    });
  };

  return (
    <ColorSchemeContext.Provider
      value={{ colorScheme, updateColorScheme, isLoading }}
    >
      {children}
    </ColorSchemeContext.Provider>
  );
}
