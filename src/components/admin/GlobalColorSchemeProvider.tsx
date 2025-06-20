// components/admin/GlobalColorSchemeProvider.tsx - Improved version without page reload
"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ColorScheme } from "@/lib/config";

type ColorSchemeContextType = {
  colorScheme: ColorScheme | null;
  updateColorScheme: (scheme: ColorScheme) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
};

const ColorSchemeContext = createContext<ColorSchemeContextType>({
  colorScheme: null,
  updateColorScheme: async () => false,
  isLoading: true,
  error: null,
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
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState(0);

  const fetchColorScheme = useCallback(
    async (force = false) => {
      try {
        // Prevent too frequent requests unless forced
        if (!force && Date.now() - lastFetch < 1000) {
          return;
        }

        setError(null);
        console.log(`[${new Date().toISOString()}] Fetching color scheme...`);

        const response = await fetch(`/api/color-scheme?t=${Date.now()}`, {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
          cache: "no-store",
        });

        if (response.ok) {
          const config = await response.json();
          console.log(
            `[${new Date().toISOString()}] Received config:`,
            config.colorScheme?.id
          );
          setColorScheme(config.colorScheme);
          setLastFetch(Date.now());
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error fetching color scheme:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch color scheme"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [lastFetch]
  );

  useEffect(() => {
    if (!initialColorScheme) {
      fetchColorScheme(true);
    } else {
      setIsLoading(false);
    }
  }, [initialColorScheme, fetchColorScheme]);

  useEffect(() => {
    if (colorScheme) {
      applyCSSVariables(colorScheme);
    }
  }, [colorScheme]);

  const updateColorScheme = async (
    newScheme: ColorScheme
  ): Promise<boolean> => {
    try {
      setError(null);
      console.log(
        `[${new Date().toISOString()}] Updating color scheme to: ${
          newScheme.id
        }`
      );

      const response = await fetch(`/api/color-scheme?t=${Date.now()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
        cache: "no-store",
        body: JSON.stringify({ colorScheme: newScheme }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`[${new Date().toISOString()}] Update response:`, result);

        // Update local state immediately
        setColorScheme(newScheme);

        // Verify the change by fetching again after a short delay
        setTimeout(() => {
          fetchColorScheme(true);
        }, 500);

        // Broadcast change to other tabs
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(
              "colorScheme-broadcast",
              JSON.stringify({
                scheme: newScheme,
                timestamp: Date.now(),
              })
            );
            localStorage.removeItem("colorScheme-broadcast");

            // Also dispatch custom event
            window.dispatchEvent(
              new CustomEvent("colorSchemeChanged", {
                detail: { scheme: newScheme },
              })
            );
          } catch (e) {
            console.warn("Could not broadcast color scheme change:", e);
          }
        }

        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating color scheme:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update color scheme"
      );
      return false;
    }
  };

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "colorScheme-broadcast" && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          console.log(
            "Received broadcast color scheme change:",
            data.scheme.id
          );
          setColorScheme(data.scheme);
        } catch (error) {
          console.error("Error parsing broadcast data:", error);
        }
      }
    };

    const handleCustomEvent = (e: CustomEvent) => {
      console.log("Received custom color scheme event:", e.detail.scheme.id);
      setColorScheme(e.detail.scheme);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
      window.addEventListener(
        "colorSchemeChanged",
        handleCustomEvent as EventListener
      );

      return () => {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener(
          "colorSchemeChanged",
          handleCustomEvent as EventListener
        );
      };
    }
  }, []);

  // Poll for changes every 30 seconds as fallback
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) {
        fetchColorScheme();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoading, fetchColorScheme]);

  const applyCSSVariables = (scheme: ColorScheme) => {
    if (typeof document === "undefined") return;

    console.log(
      `[${new Date().toISOString()}] Applying CSS variables for: ${scheme.id}`
    );

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

    // Update images
    updateImages(scheme.logoVariant, scheme.lineVariant);
  };

  const updateImages = (
    logoVariant: "dark" | "white",
    lineVariant: "dark" | "white"
  ) => {
    document.querySelectorAll('img[src*="logo_"]').forEach((img) => {
      const imgElement = img as HTMLImageElement;
      const newSrc = `/logo_${logoVariant}.svg`;
      if (imgElement.src !== newSrc) {
        imgElement.src = newSrc;
      }
    });

    document.querySelectorAll('img[src*="line_"]').forEach((img) => {
      const imgElement = img as HTMLImageElement;
      const newSrc = `/line_${lineVariant}.svg`;
      if (imgElement.src !== newSrc) {
        imgElement.src = newSrc;
      }
    });
  };

  return (
    <ColorSchemeContext.Provider
      value={{ colorScheme, updateColorScheme, isLoading, error }}
    >
      {children}
    </ColorSchemeContext.Provider>
  );
}
