"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { usePageMedia } from "@/hooks/usePageMedia";
import { buildLocalizedUrl } from "@/config/routeTranslations";
import { SupportedLanguage } from "@/config/routeTranslations";

const AboutSection = () => {
  const { t, currentLang } = useTranslation();

  // Use the hook with proper default images
  const { getImageUrl, loading } = usePageMedia("about", {
    main_image: "/Shkirotava_(14).jpg", // Default fallback image
  });

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
                className="inline-flex items-center text-sm text-gray-500 group duration-300 hover:gray-600"
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
                <div className="relative h-[400px] overflow-hidden mb-10">
                  {/* Use the getImageUrl function to retrieve the image from DB or fallback */}
                  <Image
                    src={getImageUrl("main_image", "/Avaleht_Valga_2.jpg")}
                    alt="Railway tracks"
                    fill
                    className="object-cover"
                    unoptimized={true}
                  />
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

            <p className="text-normal text-gray-500 pt-2 max-w-md ml-auto">
              {t("about.text_2")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
