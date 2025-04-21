"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { usePageMedia } from "@/hooks/usePageMedia";
import { buildLocalizedUrl } from "@/config/routeTranslations";
import { SupportedLanguage } from "@/config/routeTranslations";

const AboutSection = () => {
  const { t, currentLang } = useTranslation();
  const [imageKey, setImageKey] = useState(Date.now().toString());

  // Important: Use the exact same key that the AdminAbout component uses
  const MAIN_IMAGE_KEY = "about.main_image";

  // Define the Cloudinary URL directly as the default - this is essential
  const cloudinaryUrl =
    "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Shkirotava_(14).jpg";

  // Create a detailed mediaConfig object with all possible key formats
  const defaultConfig = {
    [MAIN_IMAGE_KEY]: cloudinaryUrl,
    main_image: cloudinaryUrl,
    "about.images.main_image": cloudinaryUrl,
  };

  // Use the hook with the updated default config
  const { getImageUrl, loading, mediaConfig, forceMediaRefresh } = usePageMedia(
    "about",
    defaultConfig
  );

  // Force refresh when component mounts and listen for media updates
  useEffect(() => {
    // Force a refresh of the media data
    forceMediaRefresh();

    // Listen for media cache updates (e.g., when admin makes changes)
    const handleMediaUpdate = () => {
      console.log("About: Media update detected, refreshing...");
      forceMediaRefresh();
      setImageKey(Date.now().toString()); // Force Image component to re-render
    };

    // Set up the event listener
    window.addEventListener("media-cache-updated", handleMediaUpdate);

    return () => {
      window.removeEventListener("media-cache-updated", handleMediaUpdate);
    };
  }, [forceMediaRefresh]);

  // Get the main image URL with proper fallback chain
  const getMainImageUrl = () => {
    // Try the exact key used in admin component first
    const mainImage = getImageUrl(MAIN_IMAGE_KEY);
    if (mainImage) return mainImage;

    // Fall back to other possible keys
    const alternativeUrl =
      getImageUrl("main_image") || getImageUrl("about.images.main_image");
    if (alternativeUrl) return alternativeUrl;

    // Final fallback to default URL
    return cloudinaryUrl;
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="border-t border-gray-200 w-full mb-4"></div>
        <h2 className="text-sm text-gray-500 mb-10 mt-10">
          {t("about.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Left column with text */}
          <div className="space-y-10">
            <p className="text-xl font-normal text-gray-800 leading-relaxed">
              {t("about.text_1")}
            </p>

            <div className="pt-2">
              <Link
                href={buildLocalizedUrl(
                  "about",
                  currentLang as SupportedLanguage
                )}
                className="inline-flex items-center text-md text-gray-500 group duration-300 hover:gray-600"
              >
                {t("about.read_more")}
                <div className="rounded-full border border-gray-300 w-6 h-6 ml-2 flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>

          {/* Right column with images */}
          <div className="space-y-4">
            <div className="relative">
              <div className="grid grid-cols-1 gap-2">
                <div className="relative h-[400px] overflow-hidden mb-6">
                  {loading ? (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">Laen...</p>
                    </div>
                  ) : (
                    <Image
                      src={`${getMainImageUrl()}?_t=${imageKey}`} // Add cache busting
                      alt="Railway tracks"
                      fill
                      className="object-cover"
                      unoptimized={true}
                      key={imageKey} // Force re-render when key changes
                      priority={true} // Load with priority
                      onError={(e) => {
                        // Fallback if image fails to load
                        console.error("Image failed to load, using fallback");
                        // @ts-ignore - TypeScript doesn't know about currentTarget.src
                        e.currentTarget.src = cloudinaryUrl;
                      }}
                    />
                  )}
                </div>
                {/* SVG Overlay Positioned to the Right */}
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

            <p className="text-normal text-gray-500 pt-2 max-w-md">
              {t("about.text_2")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
