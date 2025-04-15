"use client";

import React from "react";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { usePageMedia } from "@/hooks/usePageMedia";

const Benefits = () => {
  const { t } = useTranslation();

  // Use our updated hook with the benefits prefix
  const defaultImages: Record<string, string> = {
    main_image: "/Avaleht_Renome_EST.jpg",
  };

  const { getImageUrl, loading } = usePageMedia("benefits", defaultImages);

  // Get the benefitItems array directly instead of nested object
  // The issue was that t("benefits.items") returns the raw array or object
  // We need to manually access the array structure
  const benefitItems = [];

  // Determine how many benefit items there are by checking for existence
  // Using a while loop with proper bounds check
  let i = 1;
  const MAX_ITEMS = 7; // Safety limit to prevent infinite loops
  let hasMoreItems = true;

  while (hasMoreItems && i <= MAX_ITEMS) {
    const id = String(i).padStart(2, "0"); // Format as "01", "02", etc.
    const titlePath = `benefits.items.${i - 1}.title`;
    const title = t(titlePath);

    // If we get back the key itself, it means the translation doesn't exist
    if (title === titlePath) {
      hasMoreItems = false;
    } else {
      benefitItems.push({
        id: id,
        title: title,
        description: t(`benefits.items.${i - 1}.description`),
      });
      i++;
    }
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="border-t border-gray-200 mb-8"></div>
        <h2 className="text-sm text-gray-500 mb-20 mt-10">
          {t("benefits.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          <div className="space-y-6">
            <h3 className="text-3xl font-medium text-gray-800 mb-20 md:max-w-md">
              {t("benefits.subtitle")}
            </h3>
            <div className="relative h-[600px] lg:w-[400px]">
              {/* Main Image - now using getImageUrl */}
              <Image
                src={getImageUrl("main_image", "/Avaleht_Renome_EST.jpg")}
                alt="Railway tracks at sunset"
                fill
                className="object-cover"
              />

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

          <div className="space-y-8">
            <p className="text-gray-600 mb-20 md:max-w-lg">
              {t("benefits.intro")}
            </p>
            <div className="space-y-8 pt-5 max-w-lg pb-10">
              {benefitItems.map((benefit) => (
                <div key={benefit.id} className="flex gap-4">
                  <span className="text-gray-500 font-medium min-w-[24px] self-start mt-1">
                    {benefit.id}
                  </span>
                  <div>
                    <h4 className="font-bold text-2xl text-gray-600 mb-3 max-w-[250px] leading-tight">
                      {benefit.title}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
