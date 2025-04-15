"use client";

import React, { useState, useEffect, useRef } from "react";
import AdminSubpageHeader from "@/components/admin/AdminSubpageHeader";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { useEdit } from "@/contexts/EditContext";
import { usePageMedia, clearMediaCache } from "@/hooks/usePageMedia";

const AdminEditRailwayDesign = () => {
  const { t } = useTranslation();
  const [imageKey, setImageKey] = useState(Date.now().toString());
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const hasFetchedRef = useRef(false);

  // Use the edit context
  const editContext = useEdit();
  const isEditMode = editContext?.isEditMode;

  // This component should only be used in admin mode where editContext is available
  if (!isEditMode) {
    return <div>Error: Edit mode not available</div>;
  }

  // Use empty defaults to avoid hardcoded fallbacks
  const { getImageUrl, loading, forceMediaRefresh, mediaConfig } = usePageMedia(
    "railway_design_page",
    {} // Empty defaults - we'll handle fallbacks manually
  );

  // Directly fetch the image from API to avoid cache issues
  const fetchCurrentImage = async () => {
    if (hasFetchedRef.current) return;

    try {
      const response = await fetch(
        `/api/media?keys=railway_design_page.images.main_image&pageId=railway_design_page&_t=${Date.now()}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data["railway_design_page.images.main_image"]) {
          setCurrentImageUrl(data["railway_design_page.images.main_image"]);
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
      console.log("AdminEditRailwayDesign: Media update detected");
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
    if (
      mediaConfig["main_image"] ||
      mediaConfig["railway_design_page.images.main_image"]
    ) {
      const newUrl =
        mediaConfig["railway_design_page.images.main_image"] ||
        mediaConfig["main_image"];
      console.log("Media config updated with new URL:", newUrl);
      setCurrentImageUrl(newUrl);
    }
  }, [mediaConfig]);

  // Function to get content from edit context
  const getContent = (path: string) => {
    return editContext.getFieldContent(path);
  };

  // Get the main image URL with proper fallback chain
  const getMainImageUrl = () => {
    // Priority 1: In edit mode, check the EditContext for immediate updates
    if (isEditMode) {
      const editedUrl = editContext.getMediaUrl(
        "railway_design_page.images.main_image",
        ""
      );
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
    const hookUrl = getImageUrl("images.main_image", "");
    if (hookUrl && hookUrl !== "") {
      console.log("Using URL from usePageMedia hook:", hookUrl);
      return hookUrl;
    }

    // Priority 4: Fallback to a default image
    console.log("Using fallback URL");
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
      <AdminSubpageHeader titlePath="railway_design_page.title" />

      {/* Main content section */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12 mt-10">
        {/* Railway image and services list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 pb-10">
          {/* Left column with image */}
          <div>
            <div
              className="relative w-full md:w-[400px]"
              style={{ height: "400px" }}
            >
              {!loading ? (
                <Image
                  src={getMainImageUrl() + `?_t=${imageKey}`} // Add cache-busting
                  alt={t("railway_maintenance_page.alt_text.maintenance")}
                  fill
                  priority
                  className="object-cover"
                  unoptimized={isEditMode} // Only disable optimization in edit mode
                  key={imageKey} // Force re-render when key changes
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                  <div className="animate-pulse text-gray-400">
                    Loading image...
                  </div>
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
                      "railway_design_page.images.main_image",
                      getMainImageUrl(),
                      "Design Page Main Image"
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

          {/* Right column with heading and list */}
          <div>
            <h2 className="text-2xl font-medium mb-8 text-black">
              <EditableText path="railway_design_page.services.title" />
            </h2>

            <div className="space-y-6 max-w-md mt-10">
              <div className="flex items-start gap-4">
                <span className="text-gray-300 font-light text-sm min-w-8 text-right pt-1">
                  01
                </span>
                <span className="text-md font-semibold text-gray-500 mb-2">
                  <EditableText path="railway_design_page.services.items.1" />
                </span>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-gray-300 font-light text-sm min-w-8 text-right pt-1">
                  02
                </span>
                <span className="text-md font-semibold text-gray-500 mb-2">
                  <EditableText path="railway_design_page.services.items.2" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-12"></div>

        {/* Bottom text section */}
        <div className="max-w-3xl mx-auto mb-16 pt-10">
          <p className="text-md font-semibold text-gray-500 text-center">
            <EditableText path="railway_design_page.bottom_section" />
          </p>
        </div>

        {/* Contact button */}
        <div className="mb-12 flex justify-center">
          <button className="inline-flex items-center bg-black text-white px-6 py-2 rounded-full w-fit hover:bg-gray-600 transition-colors">
            <EditableText path="railway_design_page.cta" />{" "}
            <img src="/open.svg" alt="Arrow Right" className="w-7 h-7 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEditRailwayDesign;
