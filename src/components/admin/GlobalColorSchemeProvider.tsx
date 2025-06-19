// components/admin/GlobalColorSchemeProvider.tsx
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
  console.log("=== GlobalColorSchemeProvider initialized ===");
  console.log("initialColorScheme:", initialColorScheme);

  const [colorScheme, setColorScheme] = useState<ColorScheme | null>(
    initialColorScheme || null
  );
  const [isLoading, setIsLoading] = useState(!initialColorScheme);

  console.log(
    "Initial state - colorScheme:",
    colorScheme,
    "isLoading:",
    isLoading
  );

  // Fetch current color scheme on mount if not provided via SSR
  useEffect(() => {
    console.log("=== Mount useEffect triggered ===");
    console.log("initialColorScheme:", initialColorScheme);

    if (!initialColorScheme) {
      console.log("No initialColorScheme, fetching from API");
      fetchColorScheme();
    } else {
      console.log("Has initialColorScheme, setting loading to false");
      setIsLoading(false);
    }
  }, [initialColorScheme]);

  // Apply CSS variables and theme when color scheme changes
  useEffect(() => {
    console.log("=== ColorScheme useEffect triggered ===");
    console.log("colorScheme:", colorScheme);

    if (colorScheme) {
      console.log("Calling applyCSSVariables with:", colorScheme);
      applyCSSVariables(colorScheme);
    } else {
      console.log("colorScheme is null, not applying CSS");
    }
  }, [colorScheme]);

  const fetchColorScheme = async () => {
    console.log("=== fetchColorScheme called ===");

    try {
      const response = await fetch("/api/color-scheme");
      console.log("Fetch response status:", response.status);
      console.log("Fetch response ok:", response.ok);

      if (response.ok) {
        const config = await response.json();
        console.log("Fetched config:", config);
        setColorScheme(config.colorScheme);
      } else {
        console.error("Failed to fetch color scheme, status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching color scheme:", error);
    } finally {
      setIsLoading(false);
      console.log("fetchColorScheme finished, setting loading to false");
    }
  };

  const updateColorScheme = async (
    newScheme: ColorScheme
  ): Promise<boolean> => {
    console.log("=== updateColorScheme called ===");
    console.log("newScheme:", newScheme);

    try {
      const response = await fetch("/api/color-scheme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ colorScheme: newScheme }),
      });

      console.log("API response status:", response.status);
      console.log("API response ok:", response.ok);

      if (response.ok) {
        const responseData = await response.json();
        console.log("API response data:", responseData);

        console.log("Setting colorScheme state to:", newScheme);
        setColorScheme(newScheme);

        // Broadcast to other tabs/windows using localStorage event
        if (typeof window !== "undefined") {
          console.log("Broadcasting to other tabs via localStorage");
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

        console.log("updateColorScheme returning true");
        return true;
      } else {
        console.error("API response not ok:", response.status);
        return false;
      }
    } catch (error) {
      console.error("Error updating color scheme:", error);
      return false;
    }
  };

  // Listen for changes from other tabs
  useEffect(() => {
    console.log("=== Storage listener useEffect ===");

    const handleStorageChange = (e: StorageEvent) => {
      console.log("Storage change detected:", e.key);
      if (e.key === "colorScheme-update") {
        console.log("ColorScheme storage change, refreshing from server");
        fetchColorScheme(); // Refresh from server
      }
    };

    if (typeof window !== "undefined") {
      console.log("Adding storage event listener");
      window.addEventListener("storage", handleStorageChange);
      return () => {
        console.log("Removing storage event listener");
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, []);

  const applyCSSVariables = (scheme: ColorScheme) => {
    console.log("=== applyCSSVariables called ===");
    console.log("scheme:", scheme);

    if (typeof document === "undefined") {
      console.log("Document undefined, returning");
      return;
    }

    const root = document.documentElement;
    console.log("Root element:", root);

    // Remove all theme classes
    const themeClasses = [
      "theme-default",
      "theme-kollane",
      "theme-blue",
      "theme-sinine",
      "theme-green",
      "theme-roheline",
    ];

    console.log("Before removing classes:", root.className);
    themeClasses.forEach((cls) => root.classList.remove(cls));
    console.log("After removing classes:", root.className);

    // Add current theme class
    root.classList.add(scheme.themeClass);
    console.log("After adding theme class:", root.className);

    // Apply CSS variables
    console.log("Setting CSS variables...");
    root.style.setProperty("--primary-background", scheme.colors.background);
    root.style.setProperty("--primary-text", scheme.colors.text);
    root.style.setProperty("--primary-accent", scheme.colors.accent);
    root.style.setProperty("--primary-border", scheme.colors.border);
    root.style.setProperty("--primary-line", scheme.colors.line);

    console.log("CSS variables set");

    // Verify the variables were applied
    const computedStyle = getComputedStyle(root);
    console.log(
      "Computed --primary-background:",
      computedStyle.getPropertyValue("--primary-background")
    );
    console.log(
      "Computed --primary-text:",
      computedStyle.getPropertyValue("--primary-text")
    );

    // Update logo and line images
    const logoImages = document.querySelectorAll('img[src*="logo_"]');
    const lineImages = document.querySelectorAll('img[src*="line_"]');

    console.log("Found logo images:", logoImages.length);
    console.log("Found line images:", lineImages.length);

    logoImages.forEach((img, index) => {
      const imgElement = img as HTMLImageElement;
      const oldSrc = imgElement.src;
      const newSrc = `/logo_${scheme.logoVariant}.svg`;
      console.log(`Updating logo ${index} from:`, oldSrc, "to:", newSrc);
      imgElement.src = newSrc;
    });

    lineImages.forEach((img, index) => {
      const imgElement = img as HTMLImageElement;
      const oldSrc = imgElement.src;
      const newSrc = `/line_${scheme.lineVariant}.svg`;
      console.log(`Updating line ${index} from:`, oldSrc, "to:", newSrc);
      imgElement.src = newSrc;
    });

    console.log("=== applyCSSVariables finished ===");
  };

  console.log("=== Rendering provider with values ===");
  console.log("Current colorScheme:", colorScheme);
  console.log("Current isLoading:", isLoading);

  return (
    <ColorSchemeContext.Provider
      value={{ colorScheme, updateColorScheme, isLoading }}
    >
      {children}
    </ColorSchemeContext.Provider>
  );
}
