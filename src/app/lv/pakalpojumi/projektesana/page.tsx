"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "@/hooks/useTranslation";
import { usePageMedia, invalidateMediaCache } from "@/hooks/usePageMedia";
import Link from "next/link";
import SubpageHeader from "@/components/SubpageHeader";
import SEOMetadata from "@/components/SEOMetadata";
import { buildLocalizedUrl } from "@/config/routeTranslations";
import { SupportedLanguage } from "@/config/routeTranslations";

// Helper to add cache busting to image URLs
function addCacheBuster(url: string): string {
  // Skip cache busting for external URLs or if already has cache busting
  if (url.startsWith("http") || url.includes("?_t=")) {
    return url;
  }
  // Add timestamp to prevent caching
  return `${url}?_t=${Date.now()}`;
}

const RailwayDesignPage = () => {
  const { t, currentLang } = useTranslation();
  const [imageKey, setImageKey] = useState(Date.now().toString());
  const lastRefreshRef = useRef(Date.now());
  const [directImageUrls, setDirectImageUrls] = useState({
    mainImage: "",
  });

  // Define the page prefix and default images
  const PAGE_PREFIX = "railway_design_page";
  const MAIN_IMAGE_KEY = `${PAGE_PREFIX}.images.main_image`;
  const defaultImages: Record<string, string> = {
    [MAIN_IMAGE_KEY]: "/Bolderaja_(49).jpg",
  };

  // Use our custom hook to get images from the database
  const { getImageUrl, loading, forceMediaRefresh } = usePageMedia(
    PAGE_PREFIX,
    defaultImages
  );

  // Function to directly fetch images from the API
  const fetchImagesDirectly = async () => {
    try {
      // Build query string with the exact DB keys
      const keys = [MAIN_IMAGE_KEY].join(",");

      const response = await fetch(
        `/api/media?keys=${encodeURIComponent(keys)}&_t=${Date.now()}`
      );

      if (response.ok) {
        const data = await response.json();

        // Update direct image URLs
        setDirectImageUrls({
          mainImage: data[MAIN_IMAGE_KEY] || defaultImages[MAIN_IMAGE_KEY],
        });

        console.log("Directly fetched image URLs:", data);
      }
    } catch (error) {
      console.error("Error fetching images directly:", error);
    }
  };

  // Initial fetch and setup listeners
  useEffect(() => {
    // Fetch images directly on initial load
    fetchImagesDirectly();

    // Refresh cache and force media update
    invalidateMediaCache();
    forceMediaRefresh();

    const handleMediaUpdate = () => {
      console.log("RailwayDesignPage: Media update detected");
      // Only refresh if it's been more than 1 second since last refresh
      if (Date.now() - lastRefreshRef.current > 1000) {
        lastRefreshRef.current = Date.now();

        // Fetch images directly
        fetchImagesDirectly();

        // Force a refresh of the usePageMedia hook
        forceMediaRefresh();

        // Update key to force re-render of images
        setImageKey(Date.now().toString());
      }
    };

    // Set up listeners for custom events
    window.addEventListener("media-cache-updated", handleMediaUpdate);

    // Also listen for storage events from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "mediaTimestamp") {
        console.log("Storage event detected for media timestamp");
        handleMediaUpdate();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("media-cache-updated", handleMediaUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [forceMediaRefresh]);

  // Helper function to get the image URL with fallback chain
  const getMainImageUrl = () => {
    // First try the direct API fetch result
    if (directImageUrls.mainImage) {
      return directImageUrls.mainImage;
    }

    // Then try the usePageMedia hook with the exact DB key
    return getImageUrl(MAIN_IMAGE_KEY, defaultImages[MAIN_IMAGE_KEY]);
  };

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
    <div className="w-full bg-white font-[family-name:var(--font-geist-sans)]">
      <SEOMetadata pageKey="services/design" />
      <Navbar />

      {/* Add content-wrapper class to this div for height adjustment */}
      <div className="content-wrapper">
        {/* Themed header section */}
        <SubpageHeader titleKey="railway_design_page.title" />

        {/* Main content section */}
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-12 mt-10">
          {/* Railway image and services list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 pb-10">
            {/* Left column with image */}
            <div>
              <div
                className="relative w-full md:w-[400px]"
                style={{ height: "400px" }}
              >
                {loading ? (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <div className="animate-pulse text-gray-400">Laen...</div>
                  </div>
                ) : (
                  <Image
                    src={`${getMainImageUrl()}?_t=${imageKey}`}
                    alt={t("railway_maintenance_page.alt_text.maintenance")}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                    unoptimized={true}
                    key={`main-image-${imageKey}`}
                  />
                )}
                <div className="absolute top-0 left-0 rotate-0 h-160 flex items-center">
                  <img
                    src="/footer-cutout.svg"
                    alt=""
                    className="h-full w-auto object-cover"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            {/* Right column with heading and list */}
            <div>
              <h2 className="text-2xl font-medium mb-8 text-black">
                {t("railway_design_page.services.title")}
              </h2>

              <div className="space-y-6 max-w-md mt-10">
                <div className="flex items-start gap-4">
                  <span className="text-gray-300 font-light text-sm min-w-8 text-right pt-1">
                    01
                  </span>
                  <span className="text-md font-semibold text-gray-500 mb-2">
                    {t("railway_design_page.services.items.1")}
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-gray-300 font-light text-sm min-w-8 text-right pt-1">
                    02
                  </span>
                  <span className="text-md font-semibold text-gray-500 mb-2">
                    {t("railway_design_page.services.items.2")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-12"></div>

          {/* Bottom text section */}
          <div className="max-w-3xl mx-auto mb-16 pt-10">
            <p className="text-md font-semibold text-gray-500 text-center">
              {t("railway_design_page.bottom_section")}
            </p>
          </div>

          {/* Contact button */}
          <div className="mb-12 flex justify-center">
            <Link
              href={buildLocalizedUrl(
                "contact",
                currentLang as SupportedLanguage
              )}
              className="inline-flex items-center bg-black text-white px-6 py-3 rounded-full w-fit hover:bg-gray-600 transition-colors group"
            >
              {t("railway_design_page.cta")}
              <img src="/open.svg" alt="Arrow Right" className="w-7 h-7 ml-2" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RailwayDesignPage;
