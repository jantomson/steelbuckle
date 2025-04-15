"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { useEdit } from "@/contexts/EditContext";
import VideoUrlEditor from "./VideoURLEditor"; // Use your existing component

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

interface ColorSchemeEventDetail {
  logoVariant: "dark" | "white";
  lineVariant: "dark" | "white";
}

const AdminHero = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isVideoEditorOpen, setIsVideoEditorOpen] = useState(false);
  const { t, reloadTranslations } = useTranslation();

  // Use the edit context
  const editContext = useEdit();
  const isEditMode = editContext?.isEditMode;
  const { getMediaUrl } = useEdit();

  // State for line variant and CTA button text color
  const [lineVariant, setLineVariant] = useState<"dark" | "white">("dark");
  const [ctaTextColor, setCtaTextColor] = useState<string>("white");

  // Simplified video URL handling - prioritize hero.video as the canonical source
  const videoEmbedUrl = getMediaUrl(
    "hero.video",
    getMediaUrl("hero.youtube_embed", "") ||
      t("hero.video") ||
      t("hero.youtube_embed") ||
      "https://player.vimeo.com/video/1073950156?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
  );

  // Determine default SVG file based on line variant
  const defaultLineSvg =
    lineVariant === "dark" ? "/line_dark.svg" : "/line_white.svg";

  // Get line from media context if available, otherwise use the default
  const lineSvg = getMediaUrl("line", defaultLineSvg);

  // Function to handle video URL updates
  const handleVideoUrlUpdate = (key: string, url: string) => {
    // Update both keys for backward compatibility
    editContext.updateMedia("hero.video", url);
    editContext.updateMedia("hero.youtube_embed", url);

    // If the translation value is being used, we should also update that
    // This ensures the update applies to all languages
    if (
      !getMediaUrl("hero.video", "") &&
      !getMediaUrl("hero.youtube_embed", "")
    ) {
      // If we were using a translation value, update it for current language
      editContext.updateContent("hero.video", url);
    }
  };

  // Load line variant from localStorage on component mount
  useEffect(() => {
    const loadVariants = () => {
      const savedLineVariant = localStorage.getItem("site.lineVariant");
      if (savedLineVariant === "dark" || savedLineVariant === "white") {
        setLineVariant(savedLineVariant);
      }

      // Get the primary text color from CSS variables to determine button text color
      const textColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary-text")
        .trim();

      // Convert color to RGB and check if it's dark
      const isDark = isColorDark(textColor);
      if (isDark) {
        setCtaTextColor("text-white");
      } else {
        setCtaTextColor("text-primary-background");
      }
    };

    // Helper function to check if a color is dark by converting to RGB values
    const isColorDark = (color: string): boolean => {
      // Create a temporary element to compute the color
      const tempElement = document.createElement("div");
      tempElement.style.color = color;
      document.body.appendChild(tempElement);

      // Get computed RGB values
      const computedColor = window.getComputedStyle(tempElement).color;
      document.body.removeChild(tempElement);

      // Extract RGB values
      const rgb = computedColor.match(/\d+/g);
      if (!rgb || rgb.length < 3) return true; // Default to dark if can't parse

      // Calculate luminance
      const r = parseInt(rgb[0]);
      const g = parseInt(rgb[1]);
      const b = parseInt(rgb[2]);

      // Calculate perceived brightness (standard formula)
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;

      // If brightness < 128, color is considered dark
      return brightness < 128;
    };

    // Initial load
    loadVariants();

    // Listen for changes to the color scheme
    const handleStorageChange = () => {
      loadVariants();
    };

    // Listen for localStorage changes (from other tabs)
    window.addEventListener("storage", handleStorageChange);

    // Listen for custom color scheme change events with payload
    const handleColorSchemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<ColorSchemeEventDetail>;
      if (customEvent.detail && customEvent.detail.lineVariant) {
        setLineVariant(customEvent.detail.lineVariant);
      }
      // Always recalculate text color when color scheme changes
      loadVariants();
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
  }, []);

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

  const openVideo = () => {
    setIsVideoOpen(true);
    document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
  };

  const closeVideo = () => {
    setIsVideoOpen(false);
    document.body.style.overflow = "unset"; // Re-enable scrolling
  };

  // Close video when ESC key is pressed
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (isVideoOpen && event.key === "Escape") {
        closeVideo();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [isVideoOpen]);

  return (
    <>
      <div className="bg-primary-background md:min-h-[90vh] relative overflow-hidden">
        <div className="w-full px-4 md:px-8 lg:max-w-[100%] lg:mx-auto">
          <div className="relative mx-auto max-w-7xl md:grid md:grid-cols-2 gap-8">
            <div className="flex flex-col justify-start pt-16 pb-6 md:py-20 md:justify-center md:h-full z-10">
              <h1 className="text-5xl md:text-7xl font-semibold mb-4 text-primary-text">
                <EditableText path="hero.title_start" />
                <br />
                <EditableText path="hero.title_span" />
                <br />
                <span className="italic text-primary-accent">
                  <EditableText path="hero.title_end" />
                </span>
                <img
                  src={lineSvg}
                  alt="Underline"
                  className="w-64 md:w-80 h-3 md:h-4 mt-1 -ml-2"
                  key={`admin-hero-line-${lineVariant}`}
                />
              </h1>
              <p className="text-primary-text mb-8 mt-5 md:max-w-md">
                <EditableText path="hero.subtitle" />
              </p>
              <Link
                href="/admin/pages/edit/contact"
                className={`inline-flex items-center bg-primary-text ${ctaTextColor} px-6 py-3 rounded-full w-fit hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1`}
                style={{ color: ctaTextColor === "text-white" ? "white" : "" }}
              >
                <EditableText path="hero.cta" />
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
      {isVideoOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center"
          onClick={closeVideo}
        >
          {/* Video container with responsive sizing */}
          <div
            className="relative w-[95vw] h-[95vh] md:w-[800px] md:h-[450px] lg:w-[1000px] lg:h-[562px] mx-auto"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the video itself
          >
            {/* Close Button */}
            <button
              onClick={closeVideo}
              className="absolute -top-12 md:-top-12 right-0 w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-40 transition-all z-10"
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

            {/* Video Container with fixed dimensions */}
            <div className="w-full h-full">
              <iframe
                src={videoEmbedUrl}
                className="w-full h-full"
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
