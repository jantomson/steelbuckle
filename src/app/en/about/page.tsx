"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import SubpageHeader from "@/components/SubpageHeader";
import SEOMetadata from "@/components/SEOMetadata";

interface ColorSchemeEventDetail {
  logoVariant: "dark" | "white";
  lineVariant: "dark" | "white";
}

export default function About() {
  const { t } = useTranslation();

  // State for logo variant
  const [logoVariant, setLogoVariant] = useState<"dark" | "white">("dark");

  // Dynamic logo URL based on logoVariant
  const logoUrl = `/logo_${logoVariant}.svg`;

  // Load logo variant from localStorage on component mount
  useEffect(() => {
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
  }, []);

  // Add this useEffect to ensure the page fills the viewport
  useEffect(() => {
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
  }, []);

  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      {/* Add SEO Metadata */}
      <SEOMetadata pageKey="about" />

      <Navbar />
      {/* Add content-wrapper class to this div for height adjustment */}
      <div className="w-full bg-white content-wrapper">
        {/* Themed header section */}
        <SubpageHeader titleKey="about_page.title" />

        {/* Content section*/}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-16 mt-6 sm:mt-8 md:mt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Left sidebar with logo and services - stacks on mobile */}
            <div className="col-span-1 mb-8 md:mb-0">
              <div className="mb-6 md:mb-8">
                <img
                  src={logoUrl}
                  alt="Steel Buckle OÜ"
                  className="w-20 h-20"
                  key={`about-logo-${logoVariant}`}
                />
              </div>

              <h3 className="font-medium text-black mb-3 md:mb-4">
                {t("about_page.services.title")}
              </h3>

              <ul className="space-y-2 sm:space-y-3 text-sm text-gray-500">
                <li className="py-1">
                  {t("about_page.services.list.maintenance")}
                </li>
                <li className="py-1 border-t border-gray-200">
                  {t("about_page.services.list.repair")}
                </li>
                <li className="py-1 border-t border-gray-200">
                  {t("about_page.services.list.construction")}
                </li>
                <li className="py-1 border-t border-gray-200">
                  {t("about_page.services.list.design")}
                </li>
              </ul>
            </div>

            {/* Right content area - takes full width on mobile */}
            <div className="col-span-1 md:col-span-2 space-y-6 md:space-y-8 text-gray-500 max-w-xl md:ml-auto mb-10 md:mb-20">
              <p className="text-sm sm:text-base">
                {t("about_page.content.intro")}
              </p>

              <p className="text-sm sm:text-base">
                {t("about_page.content.history")}
              </p>

              <p className="text-sm sm:text-base">
                {t("about_page.content.staff")}
              </p>

              <p className="text-sm sm:text-base text-black font-medium">
                {t("about_page.content.materials")}
              </p>

              <p className="text-sm sm:text-base">
                {t("about_page.content.locations")}
              </p>

              <p className="text-sm sm:text-base text-black font-medium">
                {t("about_page.content.invitation")}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
