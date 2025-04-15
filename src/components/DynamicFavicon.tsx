"use client";

import { useEffect } from "react";

/**
 * DynamicFavicon component that changes the favicon based on the current theme
 * - For blue theme (dark background): uses dark favicon variant
 * - For yellow and green themes (light backgrounds): uses light favicon variant
 */
const DynamicFavicon = () => {
  useEffect(() => {
    if (typeof window === "undefined") {
      return; // Skip during SSR
    }

    // Function to determine and set the correct favicon based on theme
    const updateFavicon = () => {
      try {
        // Get the current color scheme from localStorage (set by AdminColorScheme.tsx)
        const currentScheme =
          localStorage.getItem("site.colorScheme") || "default";
        console.log("Current color scheme:", currentScheme);

        // Determine favicon variant based on theme
        let faviconVariant;

        // Only blue theme uses dark favicon, other themes use light favicon
        if (currentScheme === "blue") {
          faviconVariant = "dark";
        } else {
          // For default (yellow) and green themes
          faviconVariant = "light";
        }

        // Use the actual filenames with underscores and .ico extension
        const faviconPath = `/favicon_${faviconVariant}.ico`;
        console.log("Setting favicon to:", faviconPath);

        // Get all existing favicon links
        const existingFavicons = document.querySelectorAll('link[rel*="icon"]');

        // Remove existing favicons to avoid conflicts
        existingFavicons.forEach((favicon) => {
          favicon.parentNode?.removeChild(favicon);
        });

        // Create new favicon link
        const link = document.createElement("link");
        link.rel = "icon";
        link.type = "image/x-icon"; // Correct MIME type for .ico files
        link.href = faviconPath;
        document.head.appendChild(link);

        // Also add a shortcut icon for better compatibility
        const shortcutLink = document.createElement("link");
        shortcutLink.rel = "shortcut icon";
        shortcutLink.type = "image/x-icon";
        shortcutLink.href = faviconPath;
        document.head.appendChild(shortcutLink);

        console.log("Favicon updated successfully to", faviconPath);
      } catch (error) {
        console.error("Error updating favicon:", error);
      }
    };

    // Run immediately and then again after a delay to ensure it takes effect
    updateFavicon();

    // Also run after a delay to make sure it works after page fully loads
    const initialTimeout = setTimeout(() => {
      updateFavicon();
    }, 500);

    // Listen for color scheme changes from AdminColorScheme component
    const handleColorSchemeChange = () => {
      console.log("Color scheme changed event detected");
      updateFavicon();
    };

    // Add event listener for theme changes
    window.addEventListener("colorSchemeChanged", handleColorSchemeChange);

    // Listen for storage changes (when theme is changed in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "site.colorScheme") {
        console.log("Color scheme storage change detected");
        updateFavicon();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Clean up event listeners on component unmount
    return () => {
      clearTimeout(initialTimeout);
      window.removeEventListener("colorSchemeChanged", handleColorSchemeChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default DynamicFavicon;
