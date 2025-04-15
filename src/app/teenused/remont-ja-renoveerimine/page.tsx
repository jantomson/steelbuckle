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

const RailwayRepairPage = () => {
  const { t } = useTranslation();

  // Define the page prefix and default images
  const PAGE_PREFIX = "repair_renovation_page";
  const defaultImages: Record<string, string> = {
    first_image: "/Remont_2.jpg",
    second_image: "/Kazlu_Ruda_2.jpg",
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
      <SEOMetadata pageKey="services/repair-renovation" />

      <Navbar />

      {/* Add content-wrapper class to this div for height adjustment */}
      <div className="content-wrapper">
        {/* Themed header section */}
        <SubpageHeader titleKey="repair_renovation_page.title" />

        {/* Main content section */}
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
          {/* Introduction text */}
          <div className="mb-16">
            <div className="max-w-3xl text-center mx-auto">
              <p className="text-md font-semibold leading-relaxed text-gray-500 pb-10 pt-10 max-w-2xl">
                {t("repair_renovation_page.intro")}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-12"></div>

          {/* First content section with image and list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 pt-10">
            {/* Left column with heading and list */}
            <div className="order-2 md:order-1">
              <h2 className="text-2xl font-medium text-black mb-10">
                {t("repair_renovation_page.services.title")}
              </h2>

              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="text-md font-semibold text-gray-500">
                    {t("repair_renovation_page.services.items.1")}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="text-md font-semibold text-gray-500">
                    {t("repair_renovation_page.services.items.2")}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="text-md font-semibold text-gray-500">
                    {t("repair_renovation_page.services.items.3")}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="text-md font-semibold text-gray-500">
                    {t("repair_renovation_page.services.items.4")}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="text-md font-semibold text-gray-500 mb-10">
                    {t("repair_renovation_page.services.items.5")}
                  </span>
                </div>
              </div>
            </div>

            {/* Right column with image */}
            <div className="order-1 md:order-2 mb-10">
              <div
                className="relative w-full md:w-[500px]"
                style={{ height: "400px" }}
              >
                <Image
                  src={getImageUrl("first_image", defaultImages.first_image)}
                  alt={t("railway_maintenance_page.alt_text.maintenance")}
                  fill
                  priority
                  className="object-cover"
                />
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
          </div>

          {/* Second content section with image and text */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 pb-10">
            {/* Left column with image */}
            <div>
              <div className="order-1 md:order-2 mb-10">
                <div
                  className="relative w-full md:w-[450px]"
                  style={{ height: "500px" }}
                >
                  <Image
                    src={getImageUrl(
                      "second_image",
                      defaultImages.second_image
                    )}
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
            </div>

            {/* Right column with heading and list */}
            <div>
              <h2 className="text-2xl font-medium text-black mb-10">
                {t("repair_renovation_page.quality.title")}
              </h2>

              <div className="space-y-4">
                <p className="text-md font-semibold text-gray-500">
                  {t("repair_renovation_page.capital_repair.intro")}
                </p>
                <p className="text-md font-semibold text-gray-500">
                  {t("repair_renovation_page.capital_repair.items.1")}
                </p>
                <p className="text-md font-semibold text-gray-500">
                  {t("repair_renovation_page.capital_repair.items.2")}
                </p>
                <p className="text-md font-semibold text-gray-500">
                  {t("repair_renovation_page.capital_repair.items.3")}
                </p>
                <p className="text-md font-semibold text-gray-500">
                  {t("repair_renovation_page.capital_repair.items.4")}
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-12"></div>

          {/* Bottom text sections */}
          <div className="max-w-3xl mx-auto space-y-8 mb-16 pt-10">
            <p className="text-md font-semibold text-gray-500 mb-2">
              {t("repair_renovation_page.bottom_sections.section1")}
            </p>

            <p className="text-md font-semibold text-gray-500 mb-2">
              {t("repair_renovation_page.bottom_sections.section2")}
            </p>

            <p className="text-md font-semibold text-gray-500 mb-2">
              {t("repair_renovation_page.bottom_sections.section3")}
            </p>

            <p className="text-md font-semibold text-gray-500 mb-2">
              {t("repair_renovation_page.bottom_sections.section4")}
            </p>
          </div>

          {/* Contact button */}
          <div className="text-center mb-12">
            <Link
              href="/kontakt"
              className="inline-flex items-center bg-black text-white px-6 py-3 rounded-full w-fit hover:bg-gray-600 transition-colors group"
            >
              {t("repair_renovation_page.cta")}
              <img src="/open.svg" alt="Arrow Right" className="w-7 h-7 ml-2" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RailwayRepairPage;
