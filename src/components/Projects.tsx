"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePathname } from "next/navigation";
import { usePageMedia } from "@/hooks/usePageMedia";

interface Project {
  id: string;
  image: string;
  title: string;
  year: string;
}

// Helper to extract language from URL path
function extractLanguageFromPath(path: string): string {
  if (path.startsWith("/en")) return "en";
  if (path.startsWith("/lv")) return "lv";
  if (path.startsWith("/ru")) return "ru";
  if (path.startsWith("/et")) return "et";
  return "et"; // Default
}

// Helper to add cache busting to image URLs
function addCacheBuster(url: string): string {
  // Skip cache busting for Cloudinary URLs as they already have version control
  if (url.includes("cloudinary.com")) {
    return url;
  }
  // Skip if already has cache busting
  if (url.includes("?_t=")) {
    return url;
  }
  // Add timestamp to prevent caching
  return `${url}?_t=${Date.now()}`;
}

const ProjectsUser = () => {
  const { t } = useTranslation();
  const { currentLang, isLanguageLoaded } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname(); // Get current URL path

  // Directly use URL-based language for fetching to avoid race conditions
  const urlLang = pathname ? extractLanguageFromPath(pathname) : currentLang;

  // Default Cloudinary URLs for project placeholders
  const defaultProjectImage =
    "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Skriveri_1.jpg";

  // Set up default media configuration with project placeholder images
  const defaultImages = {
    project_placeholder: defaultProjectImage,
    "projects.project_placeholder": defaultProjectImage,
    "projects.images.project_placeholder": defaultProjectImage,
  };

  // Use our media hook for Cloudinary image management
  const { getImageUrl, loading: mediaLoading } = usePageMedia(
    "projects",
    defaultImages
  );

  // Enhanced fetch function with improved error handling and cache busting
  // Now using URL-based language directly
  const fetchProjects = useCallback(
    async (lang: string) => {
      if (!isLanguageLoaded) return;

      try {
        console.log(
          `ProjectsUser: Fetching projects with language from URL: ${lang}`
        );
        setLoading(true);

        // Add cache-busting parameter to avoid cached responses
        const response = await fetch(
          `/api/projects?lang=${lang}&_t=${Date.now()}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch projects: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log(
          `ProjectsUser: Fetched ${data.length} projects for language: ${lang}`
        );
        setProjects(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Error loading projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    },
    [isLanguageLoaded]
  );

  // Fetch projects whenever URL path changes
  useEffect(() => {
    if (isLanguageLoaded && pathname) {
      // Use language from URL directly to avoid context synchronization issues
      const lang = extractLanguageFromPath(pathname);
      console.log(
        `ProjectsUser: URL path changed to ${pathname}, language: ${lang}`
      );
      fetchProjects(lang);
    }
  }, [pathname, isLanguageLoaded, fetchProjects]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [lastX, setLastX] = useState(0);
  const [lastTimestamp, setLastTimestamp] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;

    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    setLastX(e.pageX);
    setLastTimestamp(Date.now());
    setVelocity(0);

    // Add active cursor styling
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grabbing";
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current || e.touches.length !== 1) return;

    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    setLastX(e.touches[0].pageX);
    setLastTimestamp(Date.now());
    setVelocity(0);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab";
    }

    // Apply inertia on release
    applyInertia();
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    applyInertia();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      applyInertia();
    }
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab";
    }
  };

  const applyInertia = () => {
    if (!scrollContainerRef.current || Math.abs(velocity) < 0.5) return;

    let currentVelocity = velocity;
    const decelerate = () => {
      if (Math.abs(currentVelocity) < 0.5 || !scrollContainerRef.current)
        return;

      scrollContainerRef.current.scrollLeft -= currentVelocity * 10;
      currentVelocity *= 0.95; // Deceleration factor
      requestAnimationFrame(decelerate);
    };

    requestAnimationFrame(decelerate);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current) return;

    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Smooth scroll speed
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;

    // Calculate velocity for inertia
    const now = Date.now();
    const dt = now - lastTimestamp;
    if (dt > 0) {
      const dx = e.pageX - lastX;
      setVelocity(dx / dt);
    }
    setLastX(e.pageX);
    setLastTimestamp(now);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollContainerRef.current || e.touches.length !== 1)
      return;

    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;

    // Calculate velocity for inertia
    const now = Date.now();
    const dt = now - lastTimestamp;
    if (dt > 0) {
      const dx = e.touches[0].pageX - lastX;
      setVelocity(dx / dt);
    }
    setLastX(e.touches[0].pageX);
    setLastTimestamp(now);
  };

  const openImageOverlay = (
    image: string,
    projectIndex: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent triggering drag events
    setSelectedImage(image);
    setSelectedIndex(projectIndex);
  };

  const closeImageOverlay = () => {
    setSelectedImage(null);
    setSelectedIndex(-1);
  };

  const navigatePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex > 0) {
      const prevIndex = selectedIndex - 1;
      setSelectedIndex(prevIndex);
      setSelectedImage(projects[prevIndex].image);
    }
  };

  const navigateNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex < projects.length - 1) {
      const nextIndex = selectedIndex + 1;
      setSelectedIndex(nextIndex);
      setSelectedImage(projects[nextIndex].image);
    }
  };

  useEffect(() => {
    // Add event listeners to document to handle mouse up outside the container
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleTouchEnd);

    // Lock scroll when overlay is open
    if (selectedImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleTouchEnd);
      document.body.style.overflow = "";
    };
  }, [isDragging, selectedImage]);

  // If language is still loading or component is fetching projects, show loading
  if (!isLanguageLoaded || loading || mediaLoading) {
    return (
      <section className="relative py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Laen projekte...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 bg-gray-100 overflow-hidden w-full">
      <div className="max-w-7xl mx-auto px-4">
        <div className="border-t border-gray-300 w-full mb-4"></div>
        {/* Title */}
        <h2 className="text-sm text-gray-500 mb-8 mt-10">
          {t("projects.title")}
        </h2>
        <div className="mb-8 max-w-md">
          {/* Normal text */}
          <h3 className="text-2xl text-gray-800 mb-4">{t("projects.text")}</h3>
        </div>

        <div className="relative">
          {/* Dynamic horizontal scroll container */}
          <div
            className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory"
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            style={{ cursor: "grab", WebkitOverflowScrolling: "touch" }}
          >
            {projects.length > 0 &&
              projects.map((project, index) => (
                <div
                  key={project.id}
                  className={`group relative flex-shrink-0 ${
                    isMobile
                      ? "w-[85vw] md:w-[300px]"
                      : "w-[300px] md:w-[400px] lg:w-[450px]"
                  } pr-4 pb-8 snap-center ${index === 0 ? "ml-4" : ""}`}
                >
                  <div
                    className="relative h-[500px] w-full mb-4 cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                    onClick={(e) => openImageOverlay(project.image, index, e)}
                  >
                    {/* Use Image with Cloudinary support */}
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover rounded-lg"
                      unoptimized={true}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-12 h-12 flex items-center justify-center">
                        <img
                          src="/image_open.svg"
                          alt="Open"
                          className="w-10 h-10 transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="max-w-md">
                    <h6 className="text-sm font-small text-gray-500">
                      {project.year}
                    </h6>
                    <h4 className="text-base font-medium text-gray-800 max-w-xs">
                      {project.title}
                    </h4>
                  </div>
                </div>
              ))}
            {/* Add a spacer at the end to ensure proper right spacing on mobile */}
            <div className={`flex-shrink-0 ${isMobile ? "w-4" : "w-0"}`}></div>
          </div>

          {/* Image Overlay with Navigation Buttons */}
          {selectedImage && (
            <div
              className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center"
              onClick={closeImageOverlay}
            >
              {/* Navigation buttons - Previous */}
              {selectedIndex > 0 && (
                <button
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-40 transition-all z-20"
                  onClick={navigatePrevious}
                  aria-label="Previous project"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}

              {/* Navigation buttons - Next */}
              {selectedIndex < projects.length - 1 && (
                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-40 transition-all z-20"
                  onClick={navigateNext}
                  aria-label="Next project"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}

              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-4xl max-h-[80vh]">
                <div
                  className="relative w-full"
                  style={{ paddingBottom: "75%" }}
                >
                  <Image
                    src={selectedImage}
                    alt="Enlarged view"
                    fill
                    sizes="(max-width: 768px) 90vw, 80vw"
                    className="object-contain"
                    priority
                    unoptimized={true}
                  />
                </div>
              </div>

              {/* Close button */}
              <button
                className="fixed top-8 right-8 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-40 transition-all"
                onClick={closeImageOverlay}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          <style jsx global>{`
            /* Hide scrollbar for Chrome, Safari and Opera */
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }

            /* IE and Edge */
            .hide-scrollbar {
              -ms-overflow-style: none;
            }

            /* Firefox */
            .hide-scrollbar {
              scrollbar-width: none;
            }
          `}</style>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 bg-white w-1/4 h-16"></div>
    </section>
  );
};

export default ProjectsUser;
