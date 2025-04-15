"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { useEdit } from "@/contexts/EditContext";
import { usePageMedia, clearMediaCache } from "@/hooks/usePageMedia";

const AdminBenefits = () => {
  const { t } = useTranslation();
  const [imageKey, setImageKey] = useState(Date.now().toString());
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const hasFetchedRef = useRef(false);

  // Use the edit context
  const editContext = useEdit();
  const isEditMode = editContext?.isEditMode;

  // Use empty defaults to avoid hardcoded fallbacks
  const { getImageUrl, loading, forceMediaRefresh, mediaConfig } = usePageMedia(
    "benefits",
    {} // Empty defaults - we'll handle fallbacks manually
  );

  // Directly fetch the image from API to avoid cache issues
  const fetchCurrentImage = async () => {
    if (hasFetchedRef.current) return;

    try {
      const response = await fetch(
        `/api/media?keys=benefits.main_image&pageId=benefits&_t=${Date.now()}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data["benefits.main_image"]) {
          setCurrentImageUrl(data["benefits.main_image"]);
          hasFetchedRef.current = true;
        }
      }
    } catch (error) {
      console.error("Error fetching image directly:", error);
    }
  };

  // Force a refresh on component mount
  useEffect(() => {
    // Clear the media cache to ensure fresh data
    clearMediaCache();
    // Force a refresh
    forceMediaRefresh();
    // Fetch directly from API on initial load
    fetchCurrentImage();
  }, [forceMediaRefresh]);

  // Listen for media updates
  useEffect(() => {
    const handleMediaUpdate = () => {
      console.log("AdminBenefits: Media update detected");
      // Clear the entire cache
      clearMediaCache();
      // Force a refresh
      forceMediaRefresh();
      // Reset the fetch flag to allow a new fetch
      hasFetchedRef.current = false;
      // Fetch directly again
      fetchCurrentImage();
      // Update key to force re-render
      setImageKey(Date.now().toString());
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

  // Update currentImageUrl when mediaConfig changes
  useEffect(() => {
    if (mediaConfig["main_image"] || mediaConfig["benefits.main_image"]) {
      const newUrl =
        mediaConfig["benefits.main_image"] || mediaConfig["main_image"];
      console.log("Media config updated with new URL:", newUrl);
      setCurrentImageUrl(newUrl);
    }
  }, [mediaConfig]);

  // Function to get content from edit context if in edit mode, otherwise from translations
  const getContent = (path: string) => {
    if (isEditMode) {
      return editContext.getFieldContent(path);
    }
    return t(path);
  };

  // Get the main image URL with proper fallback chain
  const getMainImageUrl = () => {
    // Priority 1: In edit mode, check the EditContext for immediate updates
    if (isEditMode) {
      const editedUrl = editContext.getMediaUrl("benefits.main_image", "");
      if (editedUrl && editedUrl !== "") {
        console.log("Using edited URL from context:", editedUrl);
        return editedUrl;
      }
    }

    // Priority 2: Use URL from our direct API fetch
    if (currentImageUrl) {
      console.log("Using directly fetched URL:", currentImageUrl);
      return currentImageUrl;
    }

    // Priority 3: Use URL from usePageMedia hook
    const hookUrl = getImageUrl("main_image", "");
    if (hookUrl && hookUrl !== "") {
      console.log("Using URL from usePageMedia hook:", hookUrl);
      return hookUrl;
    }

    // Priority 4: Fallback to a default image
    console.log("Using fallback URL");
    return "/Avaleht_Renome_EST.jpg";
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

    if (!isEditMode) {
      return <span className={className}>{content}</span>;
    }

    return (
      <span
        className={`${className} editable-content`}
        onClick={() => editContext.openEditor(path, content)}
      >
        {content}
      </span>
    );
  };

  // Function to determine if a translation exists
  const translationExists = (path: string) => {
    if (isEditMode) {
      // In edit mode, we either have a value from editContext or from t()
      const content = editContext.getFieldContent(path);
      return content !== path; // If content equals path, translation doesn't exist
    }

    // In normal mode, just check if t() returns the key itself
    return t(path) !== path;
  };

  // Generate benefit items by checking what exists in the database
  const generateBenefitItems = () => {
    const items = [];
    let index = 0;
    const MAX_ITEMS = 7; // Safety limit to prevent potential infinite loops
    let hasMoreItems = true;

    // Using a while loop with proper bounds check
    while (hasMoreItems && index < MAX_ITEMS) {
      const titlePath = `benefits.items.${index}.title`;

      // If this item doesn't exist in translations, we've reached the end
      if (!translationExists(titlePath)) {
        hasMoreItems = false;
      } else {
        // Add this item to our list
        items.push({
          id: String(index + 1).padStart(2, "0"), // Format as "01", "02", etc.
          titlePath: titlePath,
          descriptionPath: `benefits.items.${index}.description`,
        });

        index++;
      }
    }

    // Log warning if we hit the safety limit
    if (index >= MAX_ITEMS) {
      console.warn(
        "Reached maximum number of benefit items. Check for potential issues in translation data."
      );
    }

    return items;
  };

  // Get all benefit items from the database
  const benefitItems = generateBenefitItems();

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="border-t border-gray-200 mb-8"></div>
        <h2 className="text-sm text-gray-500 mb-20 mt-10">
          <EditableText path="benefits.title" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          <div className="space-y-6">
            <h3 className="text-3xl font-medium text-gray-800 mb-20 md:max-w-md">
              <EditableText path="benefits.subtitle" />
            </h3>
            <div className="relative h-[600px] lg:w-[400px]">
              {/* Main Image with improved loading approach */}
              <div className="relative w-full h-full">
                {!loading ? (
                  <Image
                    src={getMainImageUrl() + `?_t=${imageKey}`} // Add cache-busting
                    alt="Railway tracks at sunset"
                    fill
                    className="object-cover"
                    unoptimized={isEditMode} // Only disable optimization in edit mode
                    key={imageKey} // Force re-render when key changes
                    priority={true} // Load the image with priority
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <div className="animate-pulse text-gray-400">
                      Loading image...
                    </div>
                  </div>
                )}

                {/* Edit button only shows in edit mode */}
                {isEditMode && (
                  <button
                    className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10"
                    onClick={() =>
                      editContext.openMediaPicker(
                        "benefits.main_image",
                        getMainImageUrl(),
                        "Benefits Section Image"
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
              <EditableText path="benefits.intro" />
            </p>
            <div className="space-y-8 pt-5 max-w-lg pb-10">
              {benefitItems.map((benefit) => (
                <div key={benefit.id} className="flex gap-4">
                  <span className="text-gray-500 font-medium min-w-[24px] self-start mt-1">
                    {benefit.id}
                  </span>
                  <div>
                    <h4 className="font-bold text-2xl text-gray-600 mb-3 max-w-[250px] leading-tight">
                      <EditableText path={benefit.titlePath} />
                    </h4>
                    <p className="text-gray-600 text-sm">
                      <EditableText path={benefit.descriptionPath} />
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

export default AdminBenefits;
