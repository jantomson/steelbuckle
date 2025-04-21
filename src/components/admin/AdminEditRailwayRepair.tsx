"use client";

import React, { useState, useEffect, useRef } from "react";
import AdminSubpageHeader from "@/components/admin/AdminSubpageHeader";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { useEdit } from "@/contexts/EditContext";
import { usePageMedia, clearMediaCache } from "@/hooks/usePageMedia";

const AdminEditRailwayRepair = () => {
  const { t } = useTranslation();
  const [imageKeys, setImageKeys] = useState({
    first: Date.now().toString(),
    second: Date.now().toString(),
  });
  const [currentImageUrls, setCurrentImageUrls] = useState({
    first: "",
    second: "",
  });
  const hasFetchedRef = useRef(false);

  // Use the edit context
  const editContext = useEdit();
  const isEditMode = editContext?.isEditMode;

  // This component should only be used in admin mode where editContext is available
  if (!isEditMode) {
    return <div>Error: Edit mode not available</div>;
  }

  // Check if we're missing the language parameter in the URL - moved inside component
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

  // Use empty defaults to avoid hardcoded fallbacks
  const { getImageUrl, loading, forceMediaRefresh, mediaConfig } = usePageMedia(
    "repair_renovation_page",
    {} // Empty defaults - we'll handle fallbacks manually
  );

  // Directly fetch the images from API to avoid cache issues
  const fetchCurrentImages = async () => {
    if (hasFetchedRef.current) return;

    try {
      const response = await fetch(
        `/api/media?keys=repair_renovation_page.images.first_image,repair_renovation_page.images.second_image&pageId=repair_renovation_page&_t=${Date.now()}`
      );
      if (response.ok) {
        const data = await response.json();
        const newImageUrls = { ...currentImageUrls };

        if (data["repair_renovation_page.images.first_image"]) {
          newImageUrls.first =
            data["repair_renovation_page.images.first_image"];
        }

        if (data["repair_renovation_page.images.second_image"]) {
          newImageUrls.second =
            data["repair_renovation_page.images.second_image"];
        }

        setCurrentImageUrls(newImageUrls);
        hasFetchedRef.current = true;
      }
    } catch (error) {
      console.error("Error fetching images directly:", error);
    }
  };

  // Force a refresh on component mount
  useEffect(() => {
    // Clear the media cache to ensure fresh data
    clearMediaCache();
    // Force a refresh
    forceMediaRefresh();
    // Fetch directly from API on initial load
    fetchCurrentImages();
  }, [forceMediaRefresh]);

  // Listen for media updates
  useEffect(() => {
    const handleMediaUpdate = () => {
      console.log("AdminEditRailwayRepair: Media update detected");
      // Clear the entire cache
      clearMediaCache();
      // Force a refresh
      forceMediaRefresh();
      // Reset the fetch flag to allow a new fetch
      hasFetchedRef.current = false;
      // Fetch directly again
      fetchCurrentImages();
      // Update keys to force re-render
      setImageKeys({
        first: Date.now().toString(),
        second: Date.now().toString(),
      });
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

  // Update currentImageUrls when mediaConfig changes
  useEffect(() => {
    const newImageUrls = { ...currentImageUrls };
    let hasUpdates = false;

    if (
      mediaConfig["first_image"] ||
      mediaConfig["repair_renovation_page.images.first_image"]
    ) {
      newImageUrls.first =
        mediaConfig["repair_renovation_page.images.first_image"] ||
        mediaConfig["first_image"];
      hasUpdates = true;
    }

    if (
      mediaConfig["second_image"] ||
      mediaConfig["repair_renovation_page.images.second_image"]
    ) {
      newImageUrls.second =
        mediaConfig["repair_renovation_page.images.second_image"] ||
        mediaConfig["second_image"];
      hasUpdates = true;
    }

    if (hasUpdates) {
      console.log("Media config updated with new URLs:", newImageUrls);
      setCurrentImageUrls(newImageUrls);
    }
  }, [mediaConfig]);

  // Function to get content from edit context
  const getContent = (path: string) => {
    return editContext.getFieldContent(path);
  };

  // Get the first image URL with proper fallback chain
  const getFirstImageUrl = () => {
    // Priority 1: In edit mode, check the EditContext for immediate updates
    if (isEditMode) {
      const editedUrl = editContext.getMediaUrl(
        "repair_renovation_page.images.first_image",
        ""
      );
      if (editedUrl && editedUrl !== "") {
        console.log("Using edited URL from context:", editedUrl);
        return editedUrl;
      }
    }

    // Priority 2: Use URL from our direct API fetch
    if (currentImageUrls.first) {
      console.log(
        "Using directly fetched first image URL:",
        currentImageUrls.first
      );
      return currentImageUrls.first;
    }

    // Priority 3: Use URL from usePageMedia hook
    const hookUrl = getImageUrl("images.first_image", "");
    if (hookUrl && hookUrl !== "") {
      console.log("Using URL from usePageMedia hook:", hookUrl);
      return hookUrl;
    }

    // Priority 4: Fallback to a default image
    console.log("Using fallback URL for first image");
    return "/Liepaja_(61).jpg";
  };

  // Get the second image URL with proper fallback chain
  const getSecondImageUrl = () => {
    // Priority 1: In edit mode, check the EditContext for immediate updates
    if (isEditMode) {
      const editedUrl = editContext.getMediaUrl(
        "repair_renovation_page.images.second_image",
        ""
      );
      if (editedUrl && editedUrl !== "") {
        console.log("Using edited URL from context:", editedUrl);
        return editedUrl;
      }
    }

    // Priority 2: Use URL from our direct API fetch
    if (currentImageUrls.second) {
      console.log(
        "Using directly fetched second image URL:",
        currentImageUrls.second
      );
      return currentImageUrls.second;
    }

    // Priority 3: Use URL from usePageMedia hook
    const hookUrl = getImageUrl("images.second_image", "");
    if (hookUrl && hookUrl !== "") {
      console.log("Using URL from usePageMedia hook:", hookUrl);
      return hookUrl;
    }

    // Priority 4: Fallback to a default image
    console.log("Using fallback URL for second image");
    return "/Liepaja_(61).jpg";
  };

  // Helper to create editable elements
  const EditableText = ({
    path,
    className,
  }: {
    path: string;
    className?: string;
  }) => {
    const content = getContent(path);

    return (
      <span
        className={`${className} editable-content`}
        onClick={() => editContext.openEditor(path, content)}
      >
        {content}
      </span>
    );
  };

  return (
    <div className="w-full bg-white font-[family-name:var(--font-geist-sans)]">
      {/* Using the SubpageHeader component which has editable functionality built-in */}
      <AdminSubpageHeader titlePath="repair_renovation_page.title" />

      {/* Main content section */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        {/* Introduction text */}
        <div className="mb-16">
          <div className="max-w-3xl text-center mx-auto">
            <p className="text-md font-semibold leading-relaxed text-gray-500 pb-10 pt-10 max-w-2xl">
              <EditableText path="repair_renovation_page.intro" />
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
              <EditableText path="repair_renovation_page.services.title" />
            </h2>

            <div className="space-y-4">
              <div className="flex items-start">
                <span className="text-md font-semibold text-gray-400 mb-2">
                  <EditableText path="repair_renovation_page.services.items.1" />
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-md font-semibold text-gray-400 mb-2">
                  <EditableText path="repair_renovation_page.services.items.2" />
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-md font-semibold text-gray-400 mb-2">
                  <EditableText path="repair_renovation_page.services.items.3" />
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-md font-semibold text-gray-400 mb-2">
                  <EditableText path="repair_renovation_page.services.items.4" />
                </span>
              </div>
              <div className="flex items-start">
                <span className="text-md font-semibold text-gray-400 mb-10">
                  <EditableText path="repair_renovation_page.services.items.5" />
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
              {!loading ? (
                <Image
                  src={getFirstImageUrl() + `?_t=${imageKeys.first}`} // Add cache-busting
                  alt={t("railway_maintenance_page.alt_text.maintenance")}
                  fill
                  priority
                  className="object-cover"
                  unoptimized={isEditMode} // Only disable optimization in edit mode
                  key={imageKeys.first} // Force re-render when key changes
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                  <div className="animate-pulse text-gray-400">
                    Loading image...
                  </div>
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
              {/* Edit button for image */}
              {isEditMode && (
                <button
                  className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10"
                  onClick={() =>
                    editContext.openMediaPicker(
                      "repair_renovation_page.images.first_image",
                      getFirstImageUrl(),
                      "First Section Image"
                    )
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              )}
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
                {!loading ? (
                  <Image
                    src={getSecondImageUrl() + `?_t=${imageKeys.second}`} // Add cache-busting
                    alt={t("railway_maintenance_page.alt_text.maintenance")}
                    fill
                    priority
                    className="object-cover"
                    unoptimized={isEditMode} // Only disable optimization in edit mode
                    key={imageKeys.second} // Force re-render when key changes
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
                {/* Edit button for image */}
                {isEditMode && (
                  <button
                    className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10"
                    onClick={() =>
                      editContext.openMediaPicker(
                        "repair_renovation_page.images.second_image",
                        getSecondImageUrl(),
                        "Second Section Image"
                      )
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right column with heading and list */}
          <div>
            <h2 className="text-2xl font-medium text-black mb-10">
              <EditableText path="repair_renovation_page.quality.title" />
            </h2>

            <div className="space-y-4">
              <p className="text-md font-semibold text-gray-400">
                <EditableText path="repair_renovation_page.capital_repair.intro" />
              </p>
              <p className="text-md font-semibold text-gray-400 mb-2">
                <EditableText path="repair_renovation_page.capital_repair.items.1" />
              </p>
              <p className="text-md font-semibold text-gray-400 mb-2">
                <EditableText path="repair_renovation_page.capital_repair.items.2" />
              </p>
              <p className="text-md font-semibold text-gray-400 mb-2">
                <EditableText path="repair_renovation_page.capital_repair.items.3" />
              </p>
              <p className="text-md font-semibold text-gray-400 mb-2">
                <EditableText path="repair_renovation_page.capital_repair.items.4" />
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-12"></div>

        {/* Bottom text sections */}
        <div className="max-w-3xl mx-auto space-y-8 mb-16 pt-10">
          <p className="text-md font-semibold text-gray-500 mb-2">
            <EditableText path="repair_renovation_page.bottom_sections.section1" />
          </p>

          <p className="text-md font-semibold text-gray-500 mb-2">
            <EditableText path="repair_renovation_page.bottom_sections.section2" />
          </p>

          <p className="text-md font-semibold text-gray-500 mb-2">
            <EditableText path="repair_renovation_page.bottom_sections.section3" />
          </p>

          <p className="text-md font-semibold text-gray-500 mb-2">
            <EditableText path="repair_renovation_page.bottom_sections.section4" />
          </p>
        </div>

        {/* Contact button */}
        <div className="text-center mb-12">
          <button className="inline-flex items-center bg-black text-white px-6 py-2 rounded-full w-fit hover:bg-gray-600 transition-colors">
            <EditableText path="repair_renovation_page.cta" />
            <img src="/open.svg" alt="Arrow Right" className="w-7 h-7 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEditRailwayRepair;
