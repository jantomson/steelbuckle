"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import SEOMetadata from "@/components/SEOMetadata";

interface ColorSchemeEventDetail {
  logoVariant: "dark" | "white";
  lineVariant: "dark" | "white";
}

export default function NotFound() {
  const { t } = useTranslation();

  // Add isClient state to track if code is running in browser
  const [isClient, setIsClient] = useState(false);

  // State for logo variant
  const [logoVariant, setLogoVariant] = useState<"dark" | "white">("dark");

  // Set isClient to true on component mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load logo variant from localStorage on component mount
  useEffect(() => {
    if (!isClient) return; // Skip execution if not on client

    const loadLogoVariant = () => {
      const savedLogoVariant = localStorage.getItem("site.logoVariant");
      if (savedLogoVariant === "dark" || savedLogoVariant === "white") {
        setLogoVariant(savedLogoVariant);
      }
    };

    // Initial load
    loadLogoVariant();

    // Listen for localStorage changes (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "site.logoVariant") {
        loadLogoVariant();
      }
    };

    // Listen for custom color scheme change events with payload
    const handleColorSchemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<ColorSchemeEventDetail>;
      if (customEvent.detail && customEvent.detail.logoVariant) {
        setLogoVariant(customEvent.detail.logoVariant);
      } else {
        // Fallback to localStorage if the event doesn't have the expected data
        loadLogoVariant();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "colorSchemeChanged",
      handleColorSchemeChange as EventListener
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "colorSchemeChanged",
        handleColorSchemeChange as EventListener
      );
    };
  }, [isClient]); // Add isClient to dependency array

  // Add this useEffect to ensure the page fills the viewport
  useEffect(() => {
    if (!isClient) return; // Skip execution if not on client

    const ensureMinHeight = () => {
      const viewportHeight = window.innerHeight;
      const content = document.querySelector(".content-wrapper");
      if (!content) return;

      // Get the footer height
      const footer = document.getElementById("main-footer");
      const footerHeight = footer ? footer.offsetHeight : 0;

      // Get the navbar height
      const navbar = document.querySelector("nav");
      const navbarHeight = navbar ? navbar.offsetHeight : 0;

      // Calculate minimum content height to fill viewport
      const minContentHeight = viewportHeight - (navbarHeight + footerHeight);

      // Apply minimum height to content wrapper
      content.setAttribute("style", `min-height: ${minContentHeight}px`);
    };

    // Execute on load and resize
    ensureMinHeight();
    window.addEventListener("resize", ensureMinHeight);
    window.addEventListener("load", ensureMinHeight);

    return () => {
      window.removeEventListener("resize", ensureMinHeight);
      window.removeEventListener("load", ensureMinHeight);
    };
  }, [isClient]); // Add isClient to dependency array

  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      {/* Add SEO Metadata */}
      <SEOMetadata pageKey="404" />

      <Navbar />

      {/* Add content-wrapper class to this div for height adjustment */}
      <div className="w-full bg-white content-wrapper">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-16 sm:py-24 md:py-32 flex flex-col items-center justify-center text-center">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-black mb-4">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-black mb-6">
            {t("404.title") || "Page Not Found"}
          </h2>
          <p className="text-base sm:text-lg text-gray-500 max-w-md mb-8">
            {t("404.message") ||
              "Sorry, we couldn't find the page you're looking for."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200"
          >
            {t("404.back_home") || "Back to Home"}
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
