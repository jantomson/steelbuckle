"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { buildLocalizedUrl } from "@/config/routeTranslations";
import { SupportedLanguage } from "@/config/routeTranslations";
import { Noto_Serif } from "next/font/google";
import { useGlobalColorScheme } from "@/components/admin/GlobalColorSchemeProvider";
import { useEdit } from "@/contexts/EditContext";
import VideoUrlEditor from "./VideoURLEditor";

const notoSerif = Noto_Serif({
  subsets: ["latin", "cyrillic"],
  weight: ["600"],
  style: ["italic"],
});

const AdminHero = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isVideoEditorOpen, setIsVideoEditorOpen] = useState(false);
  const { t, currentLang } = useTranslation();
  const { colorScheme } = useGlobalColorScheme();

  // Use the edit context
  const editContext = useEdit();
  const isEditMode = editContext?.isEditMode;

  // Add isClient state to handle hydration issues
  const [isClient, setIsClient] = useState(false);

  // State for line variant - now gets from global color scheme
  const [lineVariant, setLineVariant] = useState<"dark" | "white">("dark");

  // Simplified - use a fixed text color based on line variant
  const ctaTextColor = lineVariant === "dark" ? "white" : "black";

  // Get media from edit context with proper fallbacks
  const getMediaUrlSafe = (key: string, defaultUrl?: string): string => {
    if (isEditMode && editContext?.getMediaUrl) {
      return editContext.getMediaUrl(key, defaultUrl || "");
    }
    return defaultUrl || t(key) || "";
  };

  // Set defaults for SSR to avoid hydration mismatch
  // Get video URL with proper fallbacks on client-side only
  const [videoEmbedUrl, setVideoEmbedUrl] = useState(
    "https://player.vimeo.com/video/1073950156?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
  );

  // Determine default SVG file based on line variant
  const defaultLineSvg =
    lineVariant === "dark" ? "/line_dark.svg" : "/line_white.svg";

  // Get line using simplified function
  const lineSvg = getMediaUrlSafe("line", defaultLineSvg);

  // Set client-side state and load any dependent data
  useEffect(() => {
    setIsClient(true);

    // Update the video URL after component mounts to avoid hydration errors
    setVideoEmbedUrl(
      getMediaUrlSafe("hero.video") ||
        getMediaUrlSafe("hero.youtube_embed") ||
        t("hero.video") ||
        t("hero.youtube_embed") ||
        "https://player.vimeo.com/video/1073950156?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
    );
  }, [t, isEditMode]);

  // Update line variant when global color scheme changes
  useEffect(() => {
    if (colorScheme) {
      setLineVariant(colorScheme.lineVariant);
      console.log(`AdminHero line variant updated: ${colorScheme.lineVariant}`);
    }
  }, [colorScheme]);

  // Fallback: Load line variant from localStorage if global system isn't available
  useEffect(() => {
    if (typeof window === "undefined" || colorScheme) return; // Skip if global scheme is available

    const savedLineVariant = localStorage.getItem("site.lineVariant");
    if (savedLineVariant === "dark" || savedLineVariant === "white") {
      setLineVariant(savedLineVariant);
    }

    // Listen for changes to the color scheme
    const handleStorageChange = () => {
      const updatedVariant = localStorage.getItem("site.lineVariant");
      if (updatedVariant === "dark" || updatedVariant === "white") {
        setLineVariant(updatedVariant);
      }
    };

    // Listen for localStorage changes (from other tabs)
    window.addEventListener("storage", handleStorageChange);

    // Listen for custom color scheme change events with payload
    const handleColorSchemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{
        logoVariant: "dark" | "white";
        lineVariant: "dark" | "white";
      }>;
      if (customEvent.detail && customEvent.detail.lineVariant) {
        setLineVariant(customEvent.detail.lineVariant);
      }
    };

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
  }, [isClient, colorScheme]);

  // Function to get the right content - from edit context if in edit mode, otherwise from translations
  const getContent = (path: string) => {
    if (isEditMode) {
      return editContext.getFieldContent(path);
    }
    return t(path);
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
        data-testid={`editable-${path.replace(/\./g, "-")}`}
      >
        {content}
      </span>
    );
  };

  // Function to handle video URL updates
  const handleVideoUrlUpdate = (key: string, url: string) => {
    // Update both keys for backward compatibility
    editContext.updateMedia("hero.video", url);
    editContext.updateMedia("hero.youtube_embed", url);

    // If the translation value is being used, we should also update that
    // This ensures the update applies to all languages
    if (
      !getMediaUrlSafe("hero.video", "") &&
      !getMediaUrlSafe("hero.youtube_embed", "")
    ) {
      // If we were using a translation value, update it for current language
      editContext.updateContent("hero.video", url);
    }

    // Update the local state
    setVideoEmbedUrl(url);
  };

  const openVideo = () => {
    setIsVideoOpen(true);
    if (isClient) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    }
  };

  const closeVideo = () => {
    setIsVideoOpen(false);
    if (isClient) {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
  };

  // Close video when ESC key is pressed
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleEscKey = (event: KeyboardEvent) => {
      if (isVideoOpen && event.key === "Escape") {
        closeVideo();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [isVideoOpen, isClient]);

  return (
    <>
      <div className="bg-primary-background md:min-h-[90vh] relative overflow-hidden">
        <div className="w-full px-4 md:px-8 lg:max-w-[100%] lg:mx-auto">
          <div className="relative mx-auto max-w-7xl md:grid md:grid-cols-2 gap-8">
            <div className="flex flex-col justify-start pt-16 pb-6 md:py-20 md:justify-center md:h-full z-10">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold mb-4 text-primary-text">
                <EditableText path="hero.title_start" />
                <br />
                <EditableText path="hero.title_span" />
                <br />
                <span
                  className={`italic text-primary-accent ${notoSerif.className}`}
                >
                  <EditableText path="hero.title_end" />
                </span>
                <img
                  src={lineSvg}
                  alt="Underline"
                  className="w-64 md:w-80 h-3.5 md:h-4 mt-1"
                  key={`admin-hero-line-${lineVariant}-${
                    colorScheme?.id || "default"
                  }`}
                />
              </h1>
              <p className="text-primary-text mb-8 mt-5 md:max-w-md">
                <EditableText path="hero.subtitle" />
              </p>
              <Link
                href={buildLocalizedUrl(
                  "contact",
                  currentLang as SupportedLanguage
                )}
                className={`inline-flex items-center bg-primary-text ${
                  ctaTextColor === "white" ? "text-white" : "text-black"
                } px-6 py-3 rounded-full w-fit hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1`}
              >
                <EditableText path="hero.cta" />
                {isClient && (
                  <div className="ml-2 flex items-center justify-center">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="transition-transform duration-300 transform group-hover:translate-x-1"
                    >
                      <path
                        d="M4.16666 10H15.8333"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 4.16669L15.8333 10L10 15.8334"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </Link>
            </div>
          </div>

          {/* SVG Design Area - Responsive layout */}
          {/* Mobile View */}
          <div className="md:hidden w-full z-10 -mx-4">
            <div className="h-10"></div>
            <div className="relative h-144 w-screen">
              {/* Background SVG */}
              <img
                src="/hero.svg"
                alt="Hero design"
                className="w-full h-full object-cover"
              />
              {/* Play Button */}
              <button
                onClick={openVideo}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110"
              >
                <img src="/video.svg" alt="Play" className="w-12 h-12" />
              </button>
            </div>
          </div>

          {/* Desktop/Tablet View */}
          <div className="hidden md:block absolute top-0 right-0 h-full w-[50%] z-10">
            <div className="relative h-full w-full">
              {/* Background SVG */}
              <img
                src="/hero.svg"
                alt="Hero design"
                className="h-full w-full object-cover"
              />
              {/* Play Button */}
              <button
                onClick={openVideo}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110"
              >
                <img src="/video.svg" alt="Play" className="w-12 h-12" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal Overlay - Click anywhere to close */}
      {isVideoOpen && isClient && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={closeVideo}
          style={{ top: 0, left: 0, right: 0, bottom: 0 }} // Ensure full coverage
        >
          {/* Video container with responsive sizing */}
          <div
            className="relative w-full h-full max-w-[95vw] max-h-[95vh] md:w-[800px] md:h-[450px] lg:w-[1000px] lg:h-[562px] mx-auto flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the video itself
          >
            {/* Close Button - Better positioning for mobile */}
            <button
              onClick={closeVideo}
              className="absolute -top-2 -right-2 md:-top-12 md:-right-2 w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-40 transition-all z-10 backdrop-blur-sm"
              aria-label="Close video"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Video Container with better mobile handling */}
            <div className="w-full h-full flex-1 min-h-0">
              <iframe
                src={videoEmbedUrl}
                className="w-full h-full rounded-lg md:rounded-none"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Promotional video"
              />
            </div>

            {/* Edit button - only visible in edit mode */}
            {isEditMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVideoEditorOpen(true);
                }}
                className="absolute bottom-4 right-4 bg-white rounded-full p-3 shadow-md hover:bg-gray-100 z-10"
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
      )}

      {/* Video URL Editor */}
      <VideoUrlEditor
        isOpen={isVideoEditorOpen}
        videoKey="hero.video"
        currentUrl={videoEmbedUrl}
        onClose={() => setIsVideoEditorOpen(false)}
        onUpdate={handleVideoUrlUpdate}
      />
    </>
  );
};

export default AdminHero;
