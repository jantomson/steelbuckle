"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useTranslation } from "@/hooks/useTranslation";
import { usePageMedia, invalidateMediaCache } from "@/hooks/usePageMedia";
import Link from "next/link";
import SubpageHeader from "@/components/SubpageHeader";
import SEOMetadata from "@/components/SEOMetadata";
import { buildLocalizedUrl } from "@/config/routeTranslations";
import { SupportedLanguage } from "@/config/routeTranslations";

const RailwayMaintenancePage = () => {
  const { t, currentLang } = useTranslation();
  const [imageKey, setImageKey] = useState(Date.now().toString());

  // Define the page prefix and exact image keys
  const PAGE_PREFIX = "railway_maintenance_page";
  const MAINTENANCE_IMAGE_KEY = `${PAGE_PREFIX}.images.first_image`;
  const BRANCH_OWNERS_IMAGE_KEY = `${PAGE_PREFIX}.images.second_image`;

  // Set up default Cloudinary URLs
  const defaultImages = {
    [MAINTENANCE_IMAGE_KEY]:
      "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/foto_jooksev.jpg",
    [BRANCH_OWNERS_IMAGE_KEY]:
      "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Liepaja_(57).jpg",
  };

  // Use our updated hook with the railway_maintenance_page prefix
  const { getImageUrl, loading, forceMediaRefresh } = usePageMedia(
    PAGE_PREFIX,
    defaultImages
  );

  // Force refresh when component mounts and listen for media updates
  useEffect(() => {
    // Force a refresh of the media data
    forceMediaRefresh();

    // Listen for media cache updates (e.g., when admin makes changes)
    const handleMediaUpdate = () => {
      console.log(
        "RailwayMaintenancePage: Media update detected, refreshing..."
      );
      forceMediaRefresh();
      setImageKey(Date.now().toString()); // Force Image component to re-render
    };

    // Set up the event listener
    window.addEventListener("media-cache-updated", handleMediaUpdate);

    return () => {
      window.removeEventListener("media-cache-updated", handleMediaUpdate);
    };
  }, [forceMediaRefresh]);

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
      <SEOMetadata pageKey="services/railway-maintenance" />
      <Navbar />

      {/* Add content-wrapper class to this div for height adjustment */}
      <div className="content-wrapper">
        {/* Themed header section */}
        <SubpageHeader titleKey="railway_maintenance_page.title" />

        {/* Main content section */}
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
          {/* Introduction text with vertical line */}
          <div className="relative md:mb-12 mb-5 flex justify-end">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 hidden md:block"></div>
            <div className="max-w-3xl">
              <p className="text-base leading-relaxed text-gray-700">
                {t("railway_maintenance_page.intro")}
              </p>
            </div>
          </div>

          {/* Maintenance section with image and list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 pt-10">
            {/* Left column with image - responsive width */}
            <div className="flex justify-center md:justify-start">
              <div
                className="relative w-full md:w-[400px]"
                style={{ height: "600px" }}
              >
                {loading ? (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <div className="animate-pulse text-gray-400">Laen...</div>
                  </div>
                ) : (
                  <Image
                    src={`${getImageUrl(
                      MAINTENANCE_IMAGE_KEY,
                      defaultImages[MAINTENANCE_IMAGE_KEY]
                    )}?_t=${imageKey}`}
                    alt={t("railway_maintenance_page.alt_text.maintenance")}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                    unoptimized={true}
                    key={`maintenance-image-${imageKey}`}
                    onError={(e) => {
                      // Fallback if image fails to load
                      console.error("Image failed to load, using fallback");
                      // @ts-ignore - TypeScript doesn't know about currentTarget.src
                      e.currentTarget.src =
                        defaultImages[MAINTENANCE_IMAGE_KEY];
                    }}
                  />
                )}
                <div className="absolute top-0 right-0 rotate-90 h-160 flex items-center">
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
            <div className="flex flex-col items-end">
              <h2 className="text-2xl font-medium text-black mb-10 text-right">
                {t("railway_maintenance_page.maintenance_includes.title")}
              </h2>

              <div className="space-y-6 max-w-md w-full pt-5">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div key={num} className="flex items-start gap-4">
                    <span className="text-gray-400 font-light text-sm min-w-8 text-right pt-1">
                      {num.toString().padStart(2, "0")}
                    </span>
                    <span className="text-md font-semibold text-gray-500 mb-2">
                      {t(
                        `railway_maintenance_page.maintenance_includes.items.${num}`
                      )}
                    </span>
                  </div>
                ))}
                <div className="pt-5 flex justify-center md:justify-start">
                  <Link
                    href={buildLocalizedUrl(
                      "contact",
                      currentLang as SupportedLanguage
                    )}
                    className="inline-flex items-center bg-black text-white px-6 py-3 rounded-full w-fit hover:bg-gray-600 transition-colors group"
                  >
                    {t("railway_maintenance_page.cta")}
                    <img
                      src="/open.svg"
                      alt="Arrow Right"
                      className="w-7 h-7 ml-2"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Middle gray text block */}
          <div className="max-w-7xl mx-auto">
            <div className="border-t border-b py-12 mb-20 mt-20">
              <p className="text-gray-600 max-w-3xl mx-auto mt-10 mb-10">
                {t("railway_maintenance_page.middle_text")}
              </p>
            </div>
          </div>

          {/* Branch track owners section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-7xl mb-10">
            <div className="flex justify-center md:justify-start">
              <div
                className="relative w-full md:w-[400px]"
                style={{ height: "600px" }}
              >
                {loading ? (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <div className="animate-pulse text-gray-400">Laen...</div>
                  </div>
                ) : (
                  <Image
                    src={`${getImageUrl(
                      BRANCH_OWNERS_IMAGE_KEY,
                      defaultImages[BRANCH_OWNERS_IMAGE_KEY]
                    )}?_t=${imageKey}`}
                    alt={t("railway_maintenance_page.alt_text.branch_owners")}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                    unoptimized={true}
                    key={`branch-owners-image-${imageKey}`}
                    onError={(e) => {
                      // Fallback if image fails to load
                      console.error("Image failed to load, using fallback");
                      // @ts-ignore - TypeScript doesn't know about currentTarget.src
                      e.currentTarget.src =
                        defaultImages[BRANCH_OWNERS_IMAGE_KEY];
                    }}
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

            <div className="space-y-6 max-w-md mx-auto md:mx-0 ">
              {[1, 2, 3, 4].map((num) => (
                <p
                  key={num}
                  className="text-md font-semibold text-gray-600 pb-5"
                >
                  {t(
                    `railway_maintenance_page.branch_owners.paragraphs.${num}`
                  )}
                </p>
              ))}

              <div className="flex justify-center md:justify-start">
                <Link
                  href={buildLocalizedUrl(
                    "contact",
                    currentLang as SupportedLanguage
                  )}
                  className="inline-flex items-center bg-black text-white px-6 py-3 rounded-full w-fit hover:bg-gray-600 transition-colors group"
                >
                  {t("railway_maintenance_page.cta")}
                  <img
                    src="/open.svg"
                    alt="Arrow Right"
                    className="w-7 h-7 ml-2"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RailwayMaintenancePage;
