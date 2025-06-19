"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import { buildLocalizedUrl } from "@/config/routeTranslations";
import { SupportedLanguage } from "@/config/routeTranslations";
import { usePageMedia } from "@/hooks/usePageMedia";
import { Noto_Serif } from "next/font/google";

const notoSerif = Noto_Serif({
  subsets: ["latin", "cyrillic"],
  weight: ["600"],
  style: ["italic"],
});

// Inline SVG Component for the underline
const LineUnderline = ({ className = "w-52 h-4 mt-1" }) => (
  <svg
    className={className}
    viewBox="0 0 251 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      opacity="0.4"
      d="M32.5539 4.26925C89.6109 2.30931 146.668 1.00084 203.776 1.00084C204.332 1.00084 202.649 0.984946 202.109 1.09163C198.664 1.77222 195.381 3.41128 191.939 4.22385C181.814 6.6147 171.171 7.0319 160.683 7.49226C138.701 8.45708 116.671 8.48106 94.6649 8.76331C65.7723 9.13388 37.0246 8.92454 8.47942 11.5778C7.20228 11.6965 5.91037 11.5726 4.62981 11.6232C3.80827 11.6556 2.98427 11.7985 2.21662 12.0317C-4.05983 13.9389 15.6593 12.4403 22.384 12.4403C86.4485 12.4403 150.513 12.4403 214.578 12.4403C226.643 12.4403 238.709 12.4403 250.775 12.4403"
      stroke="black"
      strokeWidth="1.6"
    />
  </svg>
);

const CTA = () => {
  const { t, currentLang } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  // Define the Cloudinary URLs directly as defaults
  const defaultGifUrl = "/giphy.gif";
  const defaultOverlayUrl = "/gif_overlay.svg";

  // Create a detailed mediaConfig object with all possible key formats
  const defaultConfig = {
    gif_image: defaultGifUrl,
    "cta.gif_image": defaultGifUrl,
    "cta.images.gif_image": defaultGifUrl,
    overlay_image: defaultOverlayUrl,
    "cta.overlay_image": defaultOverlayUrl,
    "cta.images.overlay_image": defaultOverlayUrl,
  };

  // Use the hook with the updated default config
  const { getImageUrl, loading } = usePageMedia("cta", defaultConfig);

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 my-10">
        {/* Desktop/Tablet Layout (Default) */}
        <div className="hidden md:block">
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
              {/* Image Container - Modified for better responsiveness */}
              <div className="relative h-[500px] sm:h-[550px] lg:h-[650px] w-full lg:col-span-5 rounded-[60px] lg:rounded-[100px] overflow-hidden">
                {loading ? (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">Laen...</p>
                  </div>
                ) : (
                  <Image
                    src={getImageUrl("gif_image", defaultGifUrl)}
                    alt="Gif"
                    fill
                    style={{ objectFit: "cover" }}
                    unoptimized={true}
                  />
                )}
                {/* GIF overlay with semi-transparent background */}
                <div className="absolute inset-0 bg-black bg-opacity-30 z-10">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                      <Image
                        src={getImageUrl("overlay_image", defaultOverlayUrl)}
                        alt="Overlay animation"
                        fill
                        style={{ objectFit: "cover" }}
                        unoptimized={true}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Content - Improved spacing for tablet */}
              <div className="lg:col-span-7 px-4 lg:pl-12 text-center lg:text-center">
                <h2 className="text-4xl sm:text-5xl font-semibold mb-4 text-black">
                  {t("cta.title_start")}
                  <br />
                  <div className="whitespace-nowrap mt-2 text-center mx-auto">
                    <div className="flex flex-col items-center">
                      <span
                        className={`italic text-gray-400 ${notoSerif.className}`}
                      >
                        {t("cta.title_span")}
                      </span>
                      <LineUnderline />
                    </div>
                  </div>
                  {t("cta.title_end")}
                </h2>
                <p className="text-gray-600 mb-8 mt-8 lg:mt-10">
                  {t("cta.description")}
                </p>
                <div className="flex justify-center">
                  <Link
                    href={buildLocalizedUrl(
                      "contact",
                      currentLang as SupportedLanguage
                    )}
                    className="inline-flex items-center bg-black text-white px-6 py-3 rounded-full hover:bg-gray-600 transition-colors"
                  >
                    {t("cta.button")}
                    {isClient && (
                      <img
                        src="/open.svg"
                        alt="Arrow Right"
                        className="w-7 h-7 ml-2"
                      />
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex flex-col md:hidden px-4">
          {/* Image Container - Improved rounding and size */}
          <div
            className="relative w-full rounded-[40px] overflow-hidden mx-auto mb-6"
            style={{ height: "450px", maxWidth: "300px" }}
          >
            {/* Base image */}
            {loading ? (
              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">Laen...</p>
              </div>
            ) : (
              <Image
                src={getImageUrl("gif_image", defaultGifUrl)}
                alt="Gif"
                fill
                style={{ objectFit: "cover" }}
                unoptimized={true}
              />
            )}

            {/* GIF overlay with semi-transparent background */}
            <div className="absolute inset-0 bg-black bg-opacity-30 z-10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  <img
                    src={defaultOverlayUrl}
                    alt="Overlay animation"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Text Content - Better spacing */}
          <div className="w-full">
            <h2 className="text-4xl sm:text-4xl font-semibold text-black leading-tight mt-4 text-center">
              {t("cta.title_start")}
              <br />
              <div className="flex flex-col items-center mb-2">
                <span className={`italic text-gray-400 ${notoSerif.className}`}>
                  {t("cta.title_span")}
                </span>
                <LineUnderline className="w-48 h-3" />
              </div>
              {t("cta.title_end")}
            </h2>
            <p className="text-gray-600 mt-6 mb-6 text-center">
              {t("cta.description")}
            </p>
            <div className="flex justify-center">
              <Link
                href={buildLocalizedUrl(
                  "contact",
                  currentLang as SupportedLanguage
                )}
                className="inline-flex items-center bg-black text-white px-6 py-3 rounded-full hover:bg-gray-600 transition-colors"
              >
                {t("cta.button")}
                {isClient && (
                  <img
                    src="/open.svg"
                    alt="Arrow Right"
                    className="w-7 h-7 ml-2"
                  />
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
