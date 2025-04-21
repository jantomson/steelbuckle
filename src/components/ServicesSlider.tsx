"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { usePageMedia } from "@/hooks/usePageMedia";
import { buildLocalizedUrl } from "@/config/routeTranslations";
import { SupportedLanguage } from "@/config/routeTranslations";

const ServicesSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now().toString());
  const { t, currentLang } = useTranslation();

  // Set up default images with full Cloudinary URLs
  const defaultImages: Record<string, string> = {
    "slide1.image":
      "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/foto_jooksev.jpg",
    "slide2.image":
      "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Remont_2.jpg",
    "slide3.image":
      "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Kazlu_Rida_2.jpg",
    "slide4.image":
      "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Skriveri_1.jpg",
    "services_slider.slide1.image":
      "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/foto_jooksev.jpg",
    "services_slider.slide2.image":
      "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Remont_2.jpg",
    "services_slider.slide3.image":
      "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Kazlu_Rida_2.jpg",
    "services_slider.slide4.image":
      "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Skriveri_1.jpg",
  };

  // Use our updated hook with the services_slider prefix
  const { getImageUrl, loading, forceMediaRefresh } = usePageMedia(
    "services_slider",
    defaultImages
  );

  // Force refresh when component mounts and listen for media updates
  useEffect(() => {
    // Force a refresh of the media data
    forceMediaRefresh();

    // Listen for media cache updates (e.g., when admin makes changes)
    const handleMediaUpdate = () => {
      console.log("ServicesSlider: Media update detected, refreshing...");
      forceMediaRefresh();
      setImageKey(Date.now().toString()); // Force Image component to re-render
    };

    // Set up the event listener
    window.addEventListener("media-cache-updated", handleMediaUpdate);

    return () => {
      window.removeEventListener("media-cache-updated", handleMediaUpdate);
    };
  }, [forceMediaRefresh]);

  // Helper function to get the correct image URL for each slide
  const getSlideImageUrl = (slideNum: number): string => {
    // Try all possible key formats for this slide
    const fullKey = `services_slider.slide${slideNum}.image`;
    const shortKey = `slide${slideNum}.image`;

    // Get the fallback URL from defaults
    const fallbackUrl = defaultImages[fullKey] || defaultImages[shortKey];

    // Use getImageUrl with proper fallback
    return getImageUrl(fullKey) || getImageUrl(shortKey) || fallbackUrl;
  };

  // Generate service items by checking translations that exist
  const serviceItems = [];

  // Determine how many service items there are by checking for existence
  for (let i = 1; i <= 4; i++) {
    const titlePath = `services_slider.items.${i - 1}.title`;
    const title = t(titlePath);

    // If we get back the key itself, it means the translation doesn't exist
    if (title === titlePath) break;

    // Get the image URL using our helper function
    const imageUrl = getSlideImageUrl(i);

    serviceItems.push({
      id: i,
      title: title,
      description: t(`services_slider.items.${i - 1}.description`),
      image: imageUrl,
    });
  }

  // If no translations are found, use fallback data but with proper image URLs
  const slides =
    serviceItems.length > 0
      ? serviceItems
      : [
          {
            id: 1,
            title: "Raudteede ja rajatiste jooksev korrashoid",
            description:
              "Jooksva korrashoiu teenuste osutamisel on meie peamine ülesanne süstemaatiline järelevalve raudteede ja raudteeseadmete üle eesmärgiga ennetada rikkeid, pikendada raudteeinfrastruktuuri elementide kasutusiga, tõsta turvalisuse taset ning tagada vagunite tõrgeteta etteandmine ja äraviimine.",
            image: getSlideImageUrl(1),
          },
          {
            id: 2,
            title: "Remont ja renoveerimine",
            description:
              "Pakume põhjalikke remondi- ja renoveerimistöid raudteeinfrastruktuurile, tagades kvaliteedi ja vastupidavuse.",
            image: getSlideImageUrl(2),
          },
          {
            id: 3,
            title: "Raudtee-ehitus",
            description:
              "Täielikud raudtee-ehitusteenused planeerimisest teostuseni, sealhulgas uute rööbaste paigaldamine ja infrastruktuuri arendamine.",
            image: getSlideImageUrl(3),
          },
          {
            id: 4,
            title: "Projekteerimine",
            description:
              "Professionaalsed projekteerimis- ja inseneriteenused raudteeprojektidele, sealhulgas tehnilise dokumentatsiooni ja projekti planeerimine.",
            image: getSlideImageUrl(4),
          },
        ];

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Get the route key for each service based on its ID
  const getServiceRouteKey = (id: number): string => {
    switch (id) {
      case 1:
        return "railway-maintenance";
      case 2:
        return "repair-renovation";
      case 3:
        return "railway-construction";
      case 4:
        return "design";
      default:
        return "railway-maintenance";
    }
  };

  return (
    <section className="relative py-16 bg-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-20">
        <div className="border-t border-gray-300 mb-8"></div>
        <div className="mb-8">
          <h2 className="text-sm text-gray-500 mb-10 md:px-4 lg:px-0 mt-10">
            {t("services_slider.title")}
          </h2>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-12 gap-0">
            <div className="md:col-span-5 relative">
              <div className="aspect-[4/3] md:aspect-auto md:h-full w-full relative">
                {loading ? (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <div className="animate-pulse text-gray-400">Laen...</div>
                  </div>
                ) : (
                  <Image
                    src={`${slides[currentSlide].image}?_t=${imageKey}`}
                    alt={slides[currentSlide].title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 40vw"
                    unoptimized={true} // Prevent Next.js image optimization to use Cloudinary directly
                    key={`${currentSlide}-${imageKey}`} // Force refresh when slide or imageKey changes
                    onError={(e) => {
                      // Fallback if image fails to load
                      console.error("Image failed to load, using fallback");
                      // @ts-ignore - TypeScript doesn't know about currentTarget.src
                      e.currentTarget.src =
                        defaultImages[
                          `services_slider.slide${slides[currentSlide].id}.image`
                        ];
                    }}
                  />
                )}

                <div className="absolute bottom-0 right-0 rotate-180 h-160 flex items-center">
                  <img
                    src="/footer-cutout.svg"
                    alt=""
                    className="h-full w-auto object-cover"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-7 p-6 md:p-12 lg:p-20 flex flex-col justify-between">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
                  {slides[currentSlide].title}
                </h3>
                <p className="text-gray-600 text-sm md:text-base mb-6 md:mb-8 max-w-xl">
                  {slides[currentSlide].description}
                </p>
                <Link
                  href={buildLocalizedUrl(
                    getServiceRouteKey(slides[currentSlide].id) as any,
                    currentLang as SupportedLanguage
                  )}
                  className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mt-2"
                >
                  {t("services_slider.read_more")}
                  <div className="rounded-full border border-gray-300 w-7 h-7 flex items-center justify-center">
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

              <div className="flex gap-2 mt-6 justify-end">
                <button
                  onClick={prevSlide}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  aria-label="Previous service"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  aria-label="Next service"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="absolute bottom-0 right-0 bg-white w-1/4 h-16"></div>
    </section>
  );
};

export default ServicesSlider;
