"use client";

import { useEffect } from "react";
import { useGlobalColorScheme } from "@/components/admin/GlobalColorSchemeProvider";

/**
 * DynamicFavicon component that changes the favicon based on the current theme
 * Now integrated with GlobalColorSchemeProvider for consistent theme management
 */
const DynamicFavicon = () => {
  const { colorScheme, isLoading } = useGlobalColorScheme();

  useEffect(() => {
    if (typeof window === "undefined" || isLoading) {
      return; // Skip during SSR or while loading
    }

    // Function to determine and set the correct favicon based on theme
    const updateFavicon = () => {
      try {
        if (!colorScheme) {
          // console.log("No color scheme available yet");
          return;
        }

        // console.log("Current color scheme:", colorScheme.id);

        // Use the logoVariant from the color scheme to determine favicon
        // logoVariant is either "dark" or "white", map this to your favicon naming
        let faviconVariant;

        if (colorScheme.logoVariant === "dark") {
          faviconVariant = "light";
        } else {
          faviconVariant = "dark"; // Map "white" logoVariant to "light" favicon
        }

        // Use the actual filenames with underscores and .ico extension
        const faviconPath = `/favicon_${faviconVariant}.ico`;
        // console.log("Setting favicon to:", faviconPath);

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

        // Update theme-color meta tag based on the background color
        let themeColor = document.querySelector(
          'meta[name="theme-color"]'
        ) as HTMLMetaElement;
        if (!themeColor) {
          themeColor = document.createElement("meta");
          themeColor.name = "theme-color";
          document.head.appendChild(themeColor);
        }
        themeColor.content = colorScheme.colors.background;

        // console.log("Favicon updated successfully to", faviconPath);
      } catch (error) {
        console.error("Error updating favicon:", error);
      }
    };

    // Update favicon when color scheme changes
    updateFavicon();

    // Also run after a delay to make sure it works after page fully loads
    const initialTimeout = setTimeout(() => {
      updateFavicon();
    }, 500);

    // Clean up timeout on component unmount or dependency change
    return () => {
      clearTimeout(initialTimeout);
    };
  }, [colorScheme, isLoading]); // React to changes in colorScheme

  // This component doesn't render anything visible
  return null;
};

export default DynamicFavicon;
