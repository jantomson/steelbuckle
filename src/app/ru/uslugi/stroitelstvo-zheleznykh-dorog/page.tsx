"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useTranslation } from "@/hooks/useTranslation";
import { usePageMedia } from "@/hooks/usePageMedia";
import Link from "next/link";
import SubpageHeader from "@/components/SubpageHeader";
import SEOMetadata from "@/components/SEOMetadata";
import { buildLocalizedUrl } from "@/config/routeTranslations";
import { SupportedLanguage } from "@/config/routeTranslations";

const RailwayInfrastructurePage = () => {
  const { t, currentLang } = useTranslation();

  // Define the page prefix and default images
  const PAGE_PREFIX = "railway_infrastructure_page";
  const defaultImages: Record<string, string> = {
    main_image: "/Shkirotava_(14).jpg",
  };

  // Use our custom hook to get images from the database
  const { getImageUrl, loading } = usePageMedia(PAGE_PREFIX, defaultImages);

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
      <SEOMetadata pageKey="services/railway-construction" />
      <Navbar />

      {/* Add content-wrapper class to this div for height adjustment */}
      <div className="content-wrapper">
        {/* Themed header section */}
        <SubpageHeader titleKey="railway_infrastructure_page.title" />

        {/* Main content section */}
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-12 mb-10 mt-10">
          {/* Introduction text */}
          <div className="max-w-2xl mx-auto mb-16">
            <p className="text-md font-semibold text-gray-500 text-center leading-relaxed">
              {t("railway_infrastructure_page.intro")}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-12"></div>

          {/* Train tracks image and services list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 pt-10">
            {/* Left column with image */}
            <div>
              <div
                className="relative w-full md:w-[400px]"
                style={{ height: "400px" }}
              >
                <Image
                  src={getImageUrl("main_image", defaultImages.main_image)}
                  alt={t("railway_maintenance_page.alt_text.maintenance")}
                  fill
                  priority
                  className="object-cover"
                />
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
                {t("railway_infrastructure_page.services.title")}
              </h2>

              <div className="space-y-6 mt-10">
                <div className="flex items-start gap-4">
                  <span className="text-gray-300 font-light text-sm min-w-8 text-right pt-1">
                    01
                  </span>
                  <span className="text-md font-semibold text-gray-500 mb-2">
                    {t("railway_infrastructure_page.services.items.1")}
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-gray-300 font-light text-sm min-w-8 text-right pt-1">
                    02
                  </span>
                  <span className="text-md font-semibold text-gray-500 mb-2">
                    {t("railway_infrastructure_page.services.items.2")}
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-gray-300 font-light text-sm min-w-8 text-right pt-1">
                    03
                  </span>
                  <span className="text-md font-semibold text-gray-500 mb-2">
                    {t("railway_infrastructure_page.services.items.3")}
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-gray-300 font-light text-sm min-w-8 text-right pt-1">
                    04
                  </span>
                  <span className="text-md font-semibold text-gray-500 mb-2">
                    {t("railway_infrastructure_page.services.items.4")}
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <span className="text-gray-300 font-light text-sm min-w-8 text-right pt-1">
                    05
                  </span>
                  <span className="text-md font-semibold text-gray-500 mb-2">
                    {t("railway_infrastructure_page.services.items.5")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-12"></div>

          {/* Bottom text sections */}
          <div className="max-w-3xl mx-auto text-center space-y-8 mb-16 pt-10">
            <p className="text-md font-semibold text-gray-500 mb-2">
              {t("railway_infrastructure_page.bottom_sections.section1")}
            </p>

            <p className="text-md font-semibold text-gray-500 mb-2">
              {t("railway_infrastructure_page.bottom_sections.section2")}
            </p>
          </div>

          {/* Contact button */}
          <div className="mt-16 flex justify-center">
            <Link
              href={buildLocalizedUrl(
                "contact",
                currentLang as SupportedLanguage
              )}
              className="inline-flex items-center bg-black text-white px-6 py-3 rounded-full w-fit hover:bg-gray-600 transition-colors group"
            >
              {t("railway_infrastructure_page.cta")}
              <img src="/open.svg" alt="Arrow Right" className="w-7 h-7 ml-2" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RailwayInfrastructurePage;
