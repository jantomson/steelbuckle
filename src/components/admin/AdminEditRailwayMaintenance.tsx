"use client";

import React, { useState, useEffect, useRef } from "react";
import AdminSubpageHeader from "@/components/admin/AdminSubpageHeader";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { useEdit } from "@/contexts/EditContext";
import { usePageMedia, clearMediaCache } from "@/hooks/usePageMedia";

const AdminEditRailwayMaintenance = () => {
  const { t } = useTranslation();
  const [imageKeys, setImageKeys] = useState({
    maintenance: Date.now().toString(),
    branchOwners: Date.now().toString(),
  });
  const [currentImageUrls, setCurrentImageUrls] = useState({
    maintenance: "",
    branchOwners: "",
  });
  const hasFetchedRef = useRef(false);

  // Define the exact DB keys - MATCHING the keys used in page.tsx
  // Updated to match the frontend component keys
  const MAINTENANCE_IMAGE_KEY = "railway_maintenance_page.images.first_image";
  const BRANCH_OWNERS_IMAGE_KEY =
    "railway_maintenance_page.images.second_image";

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
    "railway_maintenance_page",
    {} // Empty defaults - we'll handle fallbacks manually
  );

  // Directly fetch the images from API to avoid cache issues
  const fetchCurrentImages = async () => {
    if (hasFetchedRef.current) return;

    try {
      const response = await fetch(
        `/api/media?keys=${MAINTENANCE_IMAGE_KEY},${BRANCH_OWNERS_IMAGE_KEY}&pageId=railway_maintenance_page&_t=${Date.now()}`
      );
      if (response.ok) {
        const data = await response.json();
        const newImageUrls = { ...currentImageUrls };

        if (data[MAINTENANCE_IMAGE_KEY]) {
          newImageUrls.maintenance = data[MAINTENANCE_IMAGE_KEY];
        }

        if (data[BRANCH_OWNERS_IMAGE_KEY]) {
          newImageUrls.branchOwners = data[BRANCH_OWNERS_IMAGE_KEY];
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
      console.log("AdminEditRailwayMaintenance: Media update detected");
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
        maintenance: Date.now().toString(),
        branchOwners: Date.now().toString(),
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

    if (mediaConfig[MAINTENANCE_IMAGE_KEY]) {
      newImageUrls.maintenance = mediaConfig[MAINTENANCE_IMAGE_KEY];
      hasUpdates = true;
    }

    if (mediaConfig[BRANCH_OWNERS_IMAGE_KEY]) {
      newImageUrls.branchOwners = mediaConfig[BRANCH_OWNERS_IMAGE_KEY];
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

  // Get the maintenance image URL with proper fallback chain
  const getMaintenanceImageUrl = () => {
    // Priority 1: In edit mode, check the EditContext for immediate updates
    if (isEditMode) {
      const editedUrl = editContext.getMediaUrl(MAINTENANCE_IMAGE_KEY, "");
      if (editedUrl && editedUrl !== "") {
        console.log("Using edited URL from context:", editedUrl);
        return editedUrl;
      }
    }

    // Priority 2: Use URL from our direct API fetch
    if (currentImageUrls.maintenance) {
      console.log("Using directly fetched URL:", currentImageUrls.maintenance);
      return currentImageUrls.maintenance;
    }

    // Priority 3: Use URL from usePageMedia hook
    const hookUrl = getImageUrl(MAINTENANCE_IMAGE_KEY, "");
    if (hookUrl && hookUrl !== "") {
      console.log("Using URL from usePageMedia hook:", hookUrl);
      return hookUrl;
    }

    // Priority 4: Fallback to a default image
    console.log("Using fallback URL for maintenance image");
    return "/foto_jooksev.jpg";
  };

  // Get the branch owners image URL with proper fallback chain
  const getBranchOwnersImageUrl = () => {
    // Priority 1: In edit mode, check the EditContext for immediate updates
    if (isEditMode) {
      const editedUrl = editContext.getMediaUrl(BRANCH_OWNERS_IMAGE_KEY, "");
      if (editedUrl && editedUrl !== "") {
        console.log("Using edited URL from context:", editedUrl);
        return editedUrl;
      }
    }

    // Priority 2: Use URL from our direct API fetch
    if (currentImageUrls.branchOwners) {
      console.log("Using directly fetched URL:", currentImageUrls.branchOwners);
      return currentImageUrls.branchOwners;
    }

    // Priority 3: Use URL from usePageMedia hook
    const hookUrl = getImageUrl(BRANCH_OWNERS_IMAGE_KEY, "");
    if (hookUrl && hookUrl !== "") {
      console.log("Using URL from usePageMedia hook:", hookUrl);
      return hookUrl;
    }

    // Priority 4: Fallback to a default image
    console.log("Using fallback URL for branch owners image");
    return "/Liepaja_(57).jpg";
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
      <AdminSubpageHeader titlePath="railway_maintenance_page.title" />

      {/* Main content section */}
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        {/* Introduction text with vertical line */}
        <div className="relative md:mb-12 mb-5 flex justify-end">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 hidden md:block"></div>
          <div className="max-w-3xl">
            <p className="text-base leading-relaxed text-gray-700">
              <EditableText path="railway_maintenance_page.intro" />
            </p>
          </div>
        </div>

        {/* Maintenance section with image and list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 pt-10">
          {/* Left column with image - responsive width */}
          <div className="flex justify-center md:justify-start">
            <div
              className="relative w-full md:w-[400px]"
              style={{ height: "600px" }}
            >
              {!loading ? (
                <Image
                  src={
                    getMaintenanceImageUrl() + `?_t=${imageKeys.maintenance}`
                  } // Add cache-busting
                  alt={t("railway_maintenance_page.alt_text.maintenance")}
                  fill
                  priority
                  className="object-cover"
                  unoptimized={isEditMode} // Only disable optimization in edit mode
                  key={imageKeys.maintenance} // Force re-render when key changes
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                  <div className="animate-pulse text-gray-400">Laen...</div>
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
                      MAINTENANCE_IMAGE_KEY,
                      getMaintenanceImageUrl(),
                      "Maintenance Section Image"
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
            <h2 className="text-2xl font-medium text-center md:text-right text-black mb-10 max-w-lg mx-auto md:mx-0 md:ml-auto">
              <EditableText path="railway_maintenance_page.maintenance_includes.title" />
            </h2>

            <div className="space-y-6 max-w-md mx-auto pt-5">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="flex items-start gap-4">
                  <span className="text-gray-400 font-light text-sm min-w-8 text-right pt-1">
                    {num.toString().padStart(2, "0")}
                  </span>
                  <span className="text-md font-semibold text-gray-500 mb-2">
                    <EditableText
                      path={`railway_maintenance_page.maintenance_includes.items.${num}`}
                    />
                  </span>
                </div>
              ))}
              <div className="pt-5 flex justify-center md:justify-start">
                <button className="inline-flex items-center bg-black text-white px-6 py-2 rounded-full w-fit hover:bg-gray-600 transition-colors">
                  <EditableText path="railway_maintenance_page.cta" />
                  <img
                    src="/open.svg"
                    alt="Arrow Right"
                    className="w-7 h-7 ml-2"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Middle gray text block */}
        <div className="max-w-7xl mx-auto">
          <div className="border-t border-b py-12 mb-20 mt-20">
            <p className="text-gray-600 max-w-3xl mx-auto mt-10 mb-10">
              <EditableText path="railway_maintenance_page.middle_text" />
            </p>
          </div>
        </div>

        {/* Branch track owners section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-7xl mb-10">
          <div className="flex justify-center md:justify-start">
            <div
              className="relative w-full md:w-[400px]"
              style={{ height: "600px" }}
            >
              {!loading ? (
                <Image
                  src={
                    getBranchOwnersImageUrl() + `?_t=${imageKeys.branchOwners}`
                  } // Add cache-busting
                  alt={t("railway_maintenance_page.alt_text.maintenance")}
                  fill
                  priority
                  className="object-cover"
                  unoptimized={isEditMode} // Only disable optimization in edit mode
                  key={imageKeys.branchOwners} // Force re-render when key changes
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
                      BRANCH_OWNERS_IMAGE_KEY,
                      getBranchOwnersImageUrl(),
                      "Branch Owners Section Image"
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

          <div className="space-y-6 max-w-md mx-auto md:mx-0 pb-20">
            {[1, 2, 3, 4].map((num) => (
              <p key={num} className="text-md font-semibold text-gray-600 pb-5">
                <EditableText
                  path={`railway_maintenance_page.branch_owners.paragraphs.${num}`}
                />
              </p>
            ))}

            <div className="flex justify-center md:justify-start">
              <button className="inline-flex items-center bg-black text-white px-6 py-2 rounded-full w-fit hover:bg-gray-600 transition-colors">
                <EditableText path="railway_maintenance_page.cta" />
                <img
                  src="/open.svg"
                  alt="Arrow Right"
                  className="w-7 h-7 ml-2"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditRailwayMaintenance;
