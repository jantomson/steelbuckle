"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { Playfair_Display } from "next/font/google";
import Link from "next/link";
import { buildLocalizedUrl } from "@/config/routeTranslations";
import { SupportedLanguage } from "@/config/routeTranslations";

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const CTA = () => {
  const { t, currentLang } = useTranslation();
  const [isClient, setIsClient] = useState(false);

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
                <Image
                  src="/giphy.gif"
                  alt="Gif"
                  fill
                  style={{ objectFit: "cover" }}
                />
                {/* GIF overlay with semi-transparent background */}
                <div className="absolute inset-0 bg-black bg-opacity-30 z-10">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                      <Image
                        src="/gif_overlay.svg"
                        alt="Overlay animation"
                        fill
                        style={{ objectFit: "cover" }}
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
                    <span className="text-gray-500 italic inline-block">
                      {t("cta.title_span")}
                      <img
                        src="/line_dark.svg"
                        alt="Underline"
                        className="w-50 h-4 mb-2 mt-1 mx-auto"
                      />
                    </span>
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
            style={{ height: "400px", maxWidth: "400px" }}
          >
            {/* Base image */}
            <Image
              src="/giphy.gif"
              alt="Gif"
              fill
              style={{ objectFit: "cover" }}
            />

            {/* GIF overlay with semi-transparent background */}
            <div className="absolute inset-0 bg-black bg-opacity-30 z-10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  <Image
                    src="/gif_overlay.svg"
                    alt="Overlay animation"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Text Content - Better spacing */}
          <div className="w-full">
            <h2 className="text-4xl sm:text-5xl font-medium text-black leading-tight mt-4 text-center">
              {t("cta.title_start")}
              <br />
              <span className="italic text-gray-400 inline-block relative">
                {t("cta.title_span")}
                <img
                  src="/line_dark.svg"
                  alt="Underline"
                  className="w-50 h-3 mx-auto"
                />
              </span>{" "}
              <br />
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
