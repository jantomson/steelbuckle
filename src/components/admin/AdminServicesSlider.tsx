"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { useEdit } from "@/contexts/EditContext";
import { usePageMedia, clearMediaCache } from "@/hooks/usePageMedia";

const AdminServicesSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now().toString());
  const { t } = useTranslation();

  // Use the edit context
  const editContext = useEdit();
  const isEditMode = editContext?.isEditMode;

  // Track directly fetched images
  const [slideImages, setSlideImages] = useState<Record<string, string>>({});
  const hasFetchedRef = useRef(false);

  // Set up default images that will be used as fallbacks - UPDATED to match the exact format in ServicesSlider
  const defaultImages: Record<string, string> = {
    "services_slider.slide1.image": "/Krievu_Sala_3.jpg",
    "services_slider.slide2.image": "/Kazlu_Rida_3.jpg",
    "services_slider.slide3.image": "/Liepaja_(61).jpg",
    "services_slider.slide4.image": "/Skriveri_1.jpg",
  };

  // Define the type for the key to avoid TypeScript errors (same as in ServicesSlider)
  type DefaultImageKeys = keyof typeof defaultImages;

  // Use the usePageMedia hook with the services_slider prefix
  const { getImageUrl, loading, forceMediaRefresh, mediaConfig } = usePageMedia(
    "services_slider",
    defaultImages
  );

  // Directly fetch all slide images from API to avoid cache issues
  const fetchSlideImages = async () => {
    if (hasFetchedRef.current) return;

    try {
      // Create a keys string for all slide images - now using only 4 slides like ServicesSlider
      const keys = [
        "slide1.image",
        "slide2.image",
        "slide3.image",
        "slide4.image",
      ]
        .map((key) => `services_slider.${key}`)
        .join(",");

      const response = await fetch(
        `/api/media?keys=${encodeURIComponent(
          keys
        )}&pageId=services_slider&_t=${Date.now()}`
      );
      if (response.ok) {
        const data = await response.json();
        const images: Record<string, string> = {};

        // Process the response data
        Object.entries(data).forEach(([key, url]) => {
          if (url && typeof url === "string") {
            images[key] = url;
          }
        });

        if (Object.keys(images).length > 0) {
          console.log("Fetched slide images:", images);
          setSlideImages(images);
          hasFetchedRef.current = true;
        }
      }
    } catch (error) {
      console.error("Error fetching slide images directly:", error);
    }
  };

  // Force a refresh on component mount
  useEffect(() => {
    // Clear the media cache to ensure fresh data
    clearMediaCache();
    // Force a refresh
    forceMediaRefresh();
    // Fetch directly from API on initial load
    fetchSlideImages();
  }, [forceMediaRefresh]);

  // Listen for media updates
  useEffect(() => {
    const handleMediaUpdate = () => {
      console.log("AdminServicesSlider: Media update detected");
      // Clear the entire cache
      clearMediaCache();
      // Force a refresh
      forceMediaRefresh();
      // Reset the fetch flag to allow a new fetch
      hasFetchedRef.current = false;
      // Fetch directly again
      fetchSlideImages();
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

  // Update slideImages when mediaConfig changes
  useEffect(() => {
    const newImages: Record<string, string> = {};
    let hasUpdates = false;

    // Look for all slide keys in mediaConfig
    Object.entries(mediaConfig).forEach(([key, value]) => {
      if (key.includes("slide") && key.includes("image")) {
        newImages[key] = value;
        hasUpdates = true;
      }
    });

    if (hasUpdates) {
      console.log("Media config updated with new slide images:", newImages);
      setSlideImages((prev) => ({ ...prev, ...newImages }));
    }
  }, [mediaConfig]);

  // Function to get content from edit context if in edit mode, otherwise from translations
  const getContent = (path: string) => {
    if (isEditMode) {
      return editContext.getFieldContent(path);
    }
    return t(path);
  };

  // Get slide image URL with improved fallback chain
  const getSlideImageUrl = (slideImageKey: string) => {
    // Make sure we have the full key format
    const fullKey = slideImageKey.startsWith("services_slider.")
      ? slideImageKey
      : `services_slider.${slideImageKey}`;

    const defaultImage =
      defaultImages[fullKey as DefaultImageKeys] || "/naissaare.png";

    // Priority 1: In edit mode, check the EditContext for immediate updates
    if (isEditMode) {
      const editedUrl = editContext.getMediaUrl(fullKey, "");
      if (editedUrl && editedUrl !== "") {
        console.log(`Using edited URL for ${fullKey}:`, editedUrl);
        return editedUrl;
      }
    }

    // Priority 2: Use URL from our direct API fetch
    if (slideImages[fullKey]) {
      console.log(
        `Using directly fetched URL for ${fullKey}:`,
        slideImages[fullKey]
      );
      return slideImages[fullKey];
    }

    // Priority 3: Use URL from usePageMedia hook
    const hookUrl = getImageUrl(fullKey, "");
    if (hookUrl && hookUrl !== "") {
      console.log(`Using URL from usePageMedia hook for ${fullKey}:`, hookUrl);
      return hookUrl;
    }

    // Priority 4: Fallback to a default image
    console.log(`Using fallback URL for ${fullKey}:`, defaultImage);
    return defaultImage;
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

  // Generate service items by checking translations that exist - similar to ServicesSlider
  const serviceItems = [];

  // Determine how many service items there are by checking for existence - limited to 4 just like ServicesSlider
  for (let i = 1; i <= 4; i++) {
    const titlePath = `services_slider.items.${i - 1}.title`;
    let title;

    // In edit mode, we need to check differently
    if (isEditMode) {
      title = editContext.getFieldContent(titlePath);
      // If we don't get anything back or get the key itself, it doesn't exist
      if (!title || title === titlePath) {
        // Add a default item in edit mode even if it doesn't exist yet
        serviceItems.push({
          id: i,
          titlePath: titlePath,
          descriptionPath: `services_slider.items.${i - 1}.description`,
          slideImageKey: `services_slider.slide${i}.image`,
        });
        continue;
      }
    } else {
      title = t(titlePath);
      // If we get back the key itself, it means the translation doesn't exist
      if (title === titlePath) break;
    }

    // Get the image path using the full key format
    const slideImageKey = `services_slider.slide${i}.image`;

    serviceItems.push({
      id: i,
      titlePath: titlePath,
      descriptionPath: `services_slider.items.${i - 1}.description`,
      slideImageKey: slideImageKey,
    });
  }

  // Always provide fallback data to ensure at least one slide exists
  // If no translations or items were found, or we're in edit mode with empty DB
  const slides = [
    ...serviceItems,
    // Add default fallbacks if we don't have enough items
    ...(serviceItems.length < 4
      ? [
          {
            id: Math.max(1, serviceItems.length + 1),
            titlePath: "services_slider.items.0.title",
            descriptionPath: "services_slider.items.0.description",
            slideImageKey: "services_slider.slide1.image",
          },
          {
            id: Math.max(2, serviceItems.length + 1),
            titlePath: "services_slider.items.1.title",
            descriptionPath: "services_slider.items.1.description",
            slideImageKey: "services_slider.slide2.image",
          },
          {
            id: Math.max(3, serviceItems.length + 1),
            titlePath: "services_slider.items.2.title",
            descriptionPath: "services_slider.items.2.description",
            slideImageKey: "services_slider.slide3.image",
          },
          {
            id: Math.max(4, serviceItems.length + 1),
            titlePath: "services_slider.items.3.title",
            descriptionPath: "services_slider.items.3.description",
            slideImageKey: "services_slider.slide4.image",
          },
        ].slice(0, 4 - serviceItems.length)
      : []),
  ].slice(0, 4); // Ensure we have at most 4 slides

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
    if (slides.length === 0) return; // Guard against empty slides array
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (slides.length === 0) return; // Guard against empty slides array
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Safety check - if currentSlide is out of bounds, reset it
  useEffect(() => {
    if (slides.length > 0 && currentSlide >= slides.length) {
      setCurrentSlide(0);
    }
  }, [slides, currentSlide]);

  // Get the appropriate URL for each service based on its ID
  const getServiceUrl = (id: number) => {
    switch (id) {
      case 1:
        return "teenused/raudteede-jooksev-korrashoid";
      case 2:
        return "/teenused/remont-ja-renoveerimine";
      case 3:
        return "/teenused/raudtee-ehitus";
      case 4:
        return "/teenused/projekteerimine";
      default:
        return "/teenused/raudteede-jooksev-korrashoid";
    }
  };

  return (
    <section className="relative py-16 bg-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-20">
        <div className="border-t border-gray-300 mb-8"></div>
        <div className="mb-8">
          <h2 className="text-sm text-gray-500 mb-10 md:px-4 lg:px-0 mt-10">
            <EditableText path="services_slider.title" />
          </h2>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-12 gap-0">
            <div className="md:col-span-5 relative">
              <div className="aspect-[4/3] md:aspect-auto md:h-full w-full relative">
                {!loading && slides.length > 0 && slides[currentSlide] ? (
                  <Image
                    src={
                      getSlideImageUrl(slides[currentSlide].slideImageKey) +
                      `?_t=${imageKey}`
                    } // Add cache-busting
                    alt={getContent(slides[currentSlide].titlePath)}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 40vw"
                    unoptimized={isEditMode} // Only disable optimization in edit mode
                    key={`${imageKey}-${currentSlide}`} // Force re-render when key or slide changes
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
                      // Safety check for slides array
                      if (slides.length === 0 || !slides[currentSlide]) {
                        console.error(
                          "Cannot edit image: No slide available at index",
                          currentSlide
                        );
                        return;
                      }

                      const slideKey = slides[currentSlide].slideImageKey;
                      console.log(
                        `Opening media picker for ${slideKey} with current URL:`,
                        getSlideImageUrl(slideKey)
                      );

                      editContext.openMediaPicker(
                        slideKey,
                        getSlideImageUrl(slideKey),
                        `Slide ${currentSlide + 1} Image`
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
                {slides.length > 0 && slides[currentSlide] ? (
                  <>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
                      <EditableText path={slides[currentSlide].titlePath} />
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base mb-6 md:mb-8 max-w-xl">
                      <EditableText
                        path={slides[currentSlide].descriptionPath}
                      />
                    </p>
                    <Link
                      href={getServiceUrl(slides[currentSlide].id)}
                      className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mt-2"
                    >
                      <EditableText path="services_slider.read_more" />
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
                  </>
                ) : (
                  <div className="text-gray-500">
                    {isEditMode
                      ? "Add content in the admin panel"
                      : "Content loading..."}
                  </div>
                )}
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

        .editable-content {
          position: relative;
          cursor: pointer;
        }

        .editable-content:hover {
          outline: 2px dashed #007bff;
          outline-offset: 2px;
        }
      `}</style>
      <div className="absolute bottom-0 right-0 bg-white w-1/4 h-16"></div>
    </section>
  );
};

export default AdminServicesSlider;
