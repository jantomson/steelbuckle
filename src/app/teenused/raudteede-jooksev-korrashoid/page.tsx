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

const RailwayMaintenancePage = () => {
  const { t } = useTranslation();
  const [imageKey, setImageKey] = useState(Date.now().toString());
  const lastRefreshRef = useRef(Date.now());

  // Direct API call to fetch the latest images from the database
  const [directImageUrls, setDirectImageUrls] = useState({
    maintenanceImage: "",
    branchOwnersImage: "",
  });

  // Define the exact DB keys
  const MAINTENANCE_IMAGE_KEY =
    "railway_maintenance_page.images.maintenance_image";
  const BRANCH_OWNERS_IMAGE_KEY =
    "railway_maintenance_page.images.branch_owners_image";

  // Set up default images that will be used as fallbacks
  const defaultImages = {
    [MAINTENANCE_IMAGE_KEY]: "/foto_jooksev.jpg",
    [BRANCH_OWNERS_IMAGE_KEY]: "/Liepaja_(57).jpg",
  };

  // Use our updated hook with the railway_maintenance_page prefix
  const { getImageUrl, loading, forceMediaRefresh } = usePageMedia(
    "railway_maintenance_page",
    defaultImages
  );

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

  // Function to directly fetch images from the API
  const fetchImagesDirectly = async () => {
    try {
      // Build query string with the exact DB keys
      const keys = [MAINTENANCE_IMAGE_KEY, BRANCH_OWNERS_IMAGE_KEY].join(",");

      const response = await fetch(
        `/api/media?keys=${encodeURIComponent(keys)}&_t=${Date.now()}`
      );

      if (response.ok) {
        const data = await response.json();

        // Update direct image URLs
        setDirectImageUrls({
          maintenanceImage:
            data[MAINTENANCE_IMAGE_KEY] || defaultImages[MAINTENANCE_IMAGE_KEY],
          branchOwnersImage:
            data[BRANCH_OWNERS_IMAGE_KEY] ||
            defaultImages[BRANCH_OWNERS_IMAGE_KEY],
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
      console.log("RailwayMaintenancePage: Media update detected");
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

  // Helper function to get the maintenance image URL with fallback chain
  const getMaintenanceImageUrl = () => {
    // First try the direct API fetch result
    if (directImageUrls.maintenanceImage) {
      return directImageUrls.maintenanceImage;
    }

    // Then try the usePageMedia hook with the exact DB key
    return getImageUrl(
      MAINTENANCE_IMAGE_KEY,
      defaultImages[MAINTENANCE_IMAGE_KEY]
    );
  };

  // Helper function to get the branch owners image URL with fallback chain
  const getBranchOwnersImageUrl = () => {
    // First try the direct API fetch result
    if (directImageUrls.branchOwnersImage) {
      return directImageUrls.branchOwnersImage;
    }

    // Then try the usePageMedia hook with the exact DB key
    return getImageUrl(
      BRANCH_OWNERS_IMAGE_KEY,
      defaultImages[BRANCH_OWNERS_IMAGE_KEY]
    );
  };

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
                {!loading ? (
                  <Image
                    src={`${getMaintenanceImageUrl()}?_t=${imageKey}`}
                    alt={t("railway_maintenance_page.alt_text.maintenance")}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                    unoptimized={true}
                    key={`maintenance-image-${imageKey}`}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <div className="animate-pulse text-gray-400">Laen...</div>
                  </div>
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
                    href="/kontakt"
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
                {!loading ? (
                  <Image
                    src={`${getBranchOwnersImageUrl()}?_t=${imageKey}`}
                    alt={t("railway_maintenance_page.alt_text.maintenance")}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                    unoptimized={true}
                    key={`branch-owners-image-${imageKey}`}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <div className="animate-pulse text-gray-400">Laen...</div>
                  </div>
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

            <div className="space-y-6 max-w-md mx-auto md:mx-0 pb-20">
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
                  href="/kontakt"
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
