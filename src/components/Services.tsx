"use client";

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";

const Services = () => {
  const { t } = useTranslation();

  // Use keys that match the structure in common.json
  const services = [
    {
      id: 1,
      translationKey: "railway_maintenance",
      icon: "/service-1.svg",
    },
    {
      id: 2,
      translationKey: "repair_renovation",
      icon: "/service-2.svg",
    },
    {
      id: 3,
      translationKey: "railway_construction",
      icon: "/service-3.svg",
    },
    {
      id: 4,
      translationKey: "design",
      icon: "/service-4.svg",
    },
  ];

  return (
    <section className="relative py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <div className="border-t border-gray-300 w-full mb-4"></div>
        <h2 className="text-sm text-gray-500 mb-12 mt-10 text-left lg:text-left text-center font-medium">
          {t("services.title")}
        </h2>

        {/* Mobile View */}
        <div className="grid grid-cols-2 gap-8 lg:hidden">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex flex-col items-center text-center p-4"
            >
              <div className="w-16 h-16 mb-4 flex items-center justify-center">
                <img
                  src={service.icon}
                  alt={t(`services.${service.translationKey}`)}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-sm font-medium text-gray-800">
                {t(`services.${service.translationKey}`)}
              </h3>
            </div>
          ))}
        </div>

        {/* Desktop View */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className={`flex flex-col items-center text-center p-6 
              ${
                service.id !== services.length ? "border-r border-gray-300" : ""
              }`}
            >
              <div className="w-20 h-20 mb-6 flex items-center justify-center transition-all duration-300 hover:scale-105">
                <img
                  src={service.icon}
                  alt={t(`services.${service.translationKey}`)}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-lg font-medium text-gray-800 transition-all duration-300 hover:scale-105">
                {t(`services.${service.translationKey}`)}
              </h3>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 right-0 bg-white w-1/4 h-16"></div>
    </section>
  );
};

export default Services;
