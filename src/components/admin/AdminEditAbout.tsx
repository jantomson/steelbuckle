"use client";

import React, { useState, useEffect } from "react";
import AdminSubpageHeader from "@/components/admin/AdminSubpageHeader";
import AdminAbout from "@/components/admin/AdminAbout";
import { useTranslation } from "@/hooks/useTranslation";
import { useEdit } from "@/contexts/EditContext";
import { useGlobalColorScheme } from "@/components/admin/GlobalColorSchemeProvider";

// Admin About Edit Component
const AdminEditAbout = () => {
  const { t } = useTranslation();
  const editContext = useEdit();
  const isEditMode = editContext?.isEditMode;
  const { colorScheme } = useGlobalColorScheme();

  // State for logo variant - now gets from global color scheme
  const [logoVariant, setLogoVariant] = useState<"dark" | "white">("dark");

  // Dynamic logo URL based on logoVariant
  const logoUrl = `/logo_${logoVariant}.svg`;

  // Check if we're missing the language parameter in the URL
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !window.location.search.includes("lang=")
    ) {
      // Get the language from storage
      const storedLang =
        sessionStorage.getItem("adminEditingLanguage") ||
        sessionStorage.getItem("editingLanguage") ||
        localStorage.getItem("adminLastEditedLanguage") ||
        "et";

      // Update the URL with the language
      const url = new URL(window.location.href);
      url.searchParams.set("lang", storedLang);
      window.history.replaceState({}, "", url.toString());

      console.log(`Added missing language parameter to URL: ${storedLang}`);
    }
  }, []);

  // Update logo variant when global color scheme changes
  useEffect(() => {
    if (colorScheme) {
      setLogoVariant(colorScheme.logoVariant);
      console.log(
        `AdminEditAbout logo variant updated: ${colorScheme.logoVariant}`
      );
    }
  }, [colorScheme]);

  // Fallback: Load logo variant from localStorage if global system isn't available
  useEffect(() => {
    if (typeof window === "undefined" || colorScheme) return; // Skip if global scheme is available

    const savedLogoVariant = localStorage.getItem("site.logoVariant");
    if (savedLogoVariant === "dark" || savedLogoVariant === "white") {
      setLogoVariant(savedLogoVariant);
    }

    // Listen for changes to the color scheme
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "site.logoVariant") {
        const updatedVariant = localStorage.getItem("site.logoVariant");
        if (updatedVariant === "dark" || updatedVariant === "white") {
          setLogoVariant(updatedVariant);
        }
      }
    };

    // Listen for custom color scheme change events with payload
    const handleColorSchemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{
        logoVariant: "dark" | "white";
        lineVariant: "dark" | "white";
      }>;
      if (customEvent.detail && customEvent.detail.logoVariant) {
        setLogoVariant(customEvent.detail.logoVariant);
      } else {
        // Fallback to localStorage if the event doesn't have the expected data
        const savedVariant = localStorage.getItem("site.logoVariant");
        if (savedVariant === "dark" || savedVariant === "white") {
          setLogoVariant(savedVariant);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "colorSchemeChanged",
      handleColorSchemeChange as EventListener
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "colorSchemeChanged",
        handleColorSchemeChange as EventListener
      );
    };
  }, [colorScheme]);

  // This component should only be used in admin mode where editContext is available
  if (!isEditMode) {
    return <div>Error: Edit mode not available</div>;
  }

  // Default text for new paragraph in case translation isn't available yet
  const defaultStaffText =
    "Ettevõte on aastaid pidevalt koolitanud professionaalseid töötajaid. Koolitust viivad läbi parimad ehitusinsenerid ja raudteetranspordi spetsialistid. Koolitatud, kogemustega inseneri-tehniliste töötajate olemasolu võimaldab korraldada tööd kõrgel tasemel, tagades kõrge kvaliteedi ja liikumisohutuse.";

  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <div className="w-full bg-white text-black">
        {/* Using the SubpageHeader component which has editable functionality built-in */}
        <AdminSubpageHeader titlePath="about_page.title" />

        {/* Services sidebar section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Left sidebar with logo and services - stacks on mobile */}
            <div className="col-span-1 mb-8 md:mb-0">
              <div className="mb-6 md:mb-8 relative">
                <img
                  src={logoUrl}
                  alt="Steel Buckle"
                  className="w-24 h-24"
                  key={`admin-about-logo-${logoVariant}-${
                    colorScheme?.id || "default"
                  }`}
                />
              </div>

              <h3 className="font-medium text-black mb-3 md:mb-4">
                {t("about_page.services.title")}
              </h3>

              <ul className="space-y-2 sm:space-y-3 text-sm text-gray-500">
                <li
                  className="py-1 editable-content"
                  onClick={() =>
                    editContext.openEditor(
                      "about_page.services.list.maintenance",
                      t("about_page.services.list.maintenance")
                    )
                  }
                >
                  {t("about_page.services.list.maintenance")}
                </li>
                <li
                  className="py-1 border-t border-gray-200 editable-content"
                  onClick={() =>
                    editContext.openEditor(
                      "about_page.services.list.repair",
                      t("about_page.services.list.repair")
                    )
                  }
                >
                  {t("about_page.services.list.repair")}
                </li>
                <li
                  className="py-1 border-t border-gray-200 editable-content"
                  onClick={() =>
                    editContext.openEditor(
                      "about_page.services.list.construction",
                      t("about_page.services.list.construction")
                    )
                  }
                >
                  {t("about_page.services.list.construction")}
                </li>
                <li
                  className="py-1 border-t border-gray-200 editable-content"
                  onClick={() =>
                    editContext.openEditor(
                      "about_page.services.list.design",
                      t("about_page.services.list.design")
                    )
                  }
                >
                  {t("about_page.services.list.design")}
                </li>
              </ul>
            </div>

            {/* Right content area - takes full width on mobile */}
            <div className="col-span-1 md:col-span-2 space-y-6 md:space-y-8 text-gray-500 max-w-xl md:ml-auto mb-10 md:mb-20">
              <p
                className="text-sm sm:text-base editable-content"
                onClick={() =>
                  editContext.openEditor(
                    "about_page.content.intro",
                    t("about_page.content.intro")
                  )
                }
              >
                {t("about_page.content.intro")}
              </p>

              <p
                className="text-sm sm:text-base editable-content"
                onClick={() =>
                  editContext.openEditor(
                    "about_page.content.history",
                    t("about_page.content.history")
                  )
                }
              >
                {t("about_page.content.history")}
              </p>

              {/* New paragraph about staff training */}
              <p
                className="text-sm sm:text-base editable-content"
                onClick={() =>
                  editContext.openEditor(
                    "about_page.content.staff",
                    t("about_page.content.staff") || defaultStaffText
                  )
                }
              >
                {t("about_page.content.staff") || defaultStaffText}
              </p>

              <p
                className="text-sm sm:text-base text-black font-medium editable-content"
                onClick={() =>
                  editContext.openEditor(
                    "about_page.content.materials",
                    t("about_page.content.materials")
                  )
                }
              >
                {t("about_page.content.materials")}
              </p>

              <p
                className="text-sm sm:text-base editable-content"
                onClick={() =>
                  editContext.openEditor(
                    "about_page.content.locations",
                    t("about_page.content.locations")
                  )
                }
              >
                {t("about_page.content.locations")}
              </p>

              <p
                className="text-sm sm:text-base text-black font-medium editable-content"
                onClick={() =>
                  editContext.openEditor(
                    "about_page.content.invitation",
                    t("about_page.content.invitation")
                  )
                }
              >
                {t("about_page.content.invitation")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .editable-content {
          position: relative;
          cursor: pointer;
        }

        .editable-content:hover {
          outline: 2px dashed #007bff;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default AdminEditAbout;
