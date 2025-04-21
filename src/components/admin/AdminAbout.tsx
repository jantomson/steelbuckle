"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { useEdit } from "@/contexts/EditContext";
import { usePageMedia, clearMediaCache } from "@/hooks/usePageMedia";

const AboutSection = () => {
  const { t } = useTranslation();
  const [imageKey, setImageKey] = useState(Date.now().toString());
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const hasFetchedRef = useRef(false);

  // Use the edit context
  const editContext = useEdit();
  const isEditMode = editContext?.isEditMode;

  // Define the exact DB key for the image - IMPORTANT: match the exact key used elsewhere
  const MAIN_IMAGE_KEY = "about.main_image";

  // Use empty defaults to avoid hardcoded fallbacks
  const { getImageUrl, loading, forceMediaRefresh, mediaConfig } = usePageMedia(
    "about",
    {} // Empty defaults - we'll handle fallbacks manually
  );

  // Directly fetch the image from API to avoid cache issues
  const fetchCurrentImage = async () => {
    if (hasFetchedRef.current) return;

    try {
      // Use the exact key for the API request
      const response = await fetch(
        `/api/media?keys=${MAIN_IMAGE_KEY}&pageId=about&_t=${Date.now()}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data[MAIN_IMAGE_KEY]) {
          setCurrentImageUrl(data[MAIN_IMAGE_KEY]);
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
      console.log("AdminAbout: Media update detected");
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
    if (mediaConfig[MAIN_IMAGE_KEY]) {
      const newUrl = mediaConfig[MAIN_IMAGE_KEY];
      console.log("Media config updated with new URL:", newUrl);
      setCurrentImageUrl(newUrl);
    }
  }, [mediaConfig]);

  // Function to get content - from edit context if in edit mode, otherwise from translations
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
      const editedUrl = editContext.getMediaUrl(MAIN_IMAGE_KEY, "");
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
    const hookUrl = getImageUrl(MAIN_IMAGE_KEY, "");
    if (hookUrl && hookUrl !== "") {
      console.log("Using URL from usePageMedia hook:", hookUrl);
      return hookUrl;
    }

    // Priority 4: Fallback to a default image from Cloudinary if available
    const fallbackUrl =
      "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Shkirotava_(14).jpg";
    console.log("Using fallback URL:", fallbackUrl);
    return fallbackUrl;
  };

  // Improved image component in render section:

  <div className="relative h-[400px] overflow-hidden mb-10">
    {!loading ? (
      <Image
        src={getMainImageUrl() + `?_t=${imageKey}`} // Add cache-busting
        alt="Railway tracks"
        fill
        className="object-cover"
        unoptimized={isEditMode} // Only disable optimization in edit mode
        key={imageKey} // Force re-render when key changes
        priority={true} // Load the image with priority
        onError={(e) => {
          // Fallback if image fails to load
          console.error("Image failed to load, using fallback");
          // @ts-ignore - TypeScript doesn't know about currentTarget.src
          e.currentTarget.src =
            "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Shkirotava_(14).jpg";
        }}
      />
    ) : (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="animate-pulse text-gray-400">Laen...</div>
      </div>
    )}

    {/* Edit button only shows in edit mode */}
    {isEditMode && (
      <button
        className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10"
        onClick={() => {
          const url = getMainImageUrl();
          console.log("Opening media picker with URL:", url);
          editContext.openMediaPicker(
            MAIN_IMAGE_KEY,
            url,
            "About Section Image"
          );
        }}
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
  </div>;

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

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="border-t border-gray-200 w-full mb-4"></div>
        <h2 className="text-sm text-gray-500 mb-20 mt-10">
          <EditableText path="about.title" />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Left column with text */}
          <div className="space-y-20">
            <p className="text-xl font-normal text-gray-800 leading-relaxed">
              <EditableText path="about.text_1" />
            </p>

            <div className="pt-2">
              <Link
                href="/ettevottest"
                className="inline-flex items-center text-sm text-gray-500 group duration-300 hover:gray-600"
              >
                <EditableText path="about.read_more" />
                <div className="rounded-full border border-gray-300 w-6 h-6 ml-2 flex items-center justify-center">
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
          </div>

          {/* Right column with images */}
          <div className="space-y-4">
            <div className="relative">
              {/* Main image with improved loading approach */}
              <div className="grid grid-cols-1 gap-2">
                <div className="relative h-[400px] overflow-hidden mb-10">
                  {!loading ? (
                    <Image
                      src={getMainImageUrl() + `?_t=${imageKey}`} // Add cache-busting
                      alt="Railway tracks"
                      fill
                      className="object-cover"
                      unoptimized={isEditMode} // Only disable optimization in edit mode
                      key={imageKey} // Force re-render when key changes
                      priority={true} // Load the image with priority
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100">
                      <div className="animate-pulse text-gray-400">Laen...</div>
                    </div>
                  )}

                  {/* Edit button only shows in edit mode */}
                  {isEditMode && (
                    <button
                      className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 z-10"
                      onClick={() => {
                        const url = getMainImageUrl();
                        editContext.openMediaPicker(
                          MAIN_IMAGE_KEY,
                          url,
                          "About Section Image"
                        );
                      }}
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

            <p className="text-normal text-gray-500 pt-2 max-w-md ml-auto">
              <EditableText path="about.text_2" />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
