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
  return "et";
}

const ProjectsUser = () => {
  const { t } = useTranslation();
  const { currentLang, isLanguageLoaded } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const pathname = usePathname();

  // Scrolling state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // Default Cloudinary URLs for project placeholders
  const defaultProjectImage =
    "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Skriveri_1.jpg";
  const defaultImages = {
    project_placeholder: defaultProjectImage,
    "projects.project_placeholder": defaultProjectImage,
    "projects.images.project_placeholder": defaultProjectImage,
  };

  const { getImageUrl, loading: mediaLoading } = usePageMedia(
    "projects",
    defaultImages
  );

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || "ontouchstart" in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch projects
  const fetchProjects = useCallback(
    async (lang: string) => {
      if (!isLanguageLoaded) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/projects?lang=${lang}&_t=${Date.now()}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch projects: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
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

  useEffect(() => {
    if (isLanguageLoaded && pathname) {
      const lang = extractLanguageFromPath(pathname);
      fetchProjects(lang);
    }
  }, [pathname, isLanguageLoaded, fetchProjects]);

  // Desktop mouse drag handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile || !scrollContainerRef.current) return;

      setIsDragging(true);
      setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
      setScrollLeft(scrollContainerRef.current.scrollLeft);
      scrollContainerRef.current.style.cursor = "grabbing";
      scrollContainerRef.current.style.userSelect = "none";
    },
    [isMobile]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile || !isDragging || !scrollContainerRef.current) return;

      e.preventDefault();
      const x = e.pageX - scrollContainerRef.current.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    },
    [isMobile, isDragging, startX, scrollLeft]
  );

  const handleMouseUp = useCallback(() => {
    if (isMobile) return;

    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab";
      scrollContainerRef.current.style.userSelect = "";
    }
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (isMobile) return;

    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab";
      scrollContainerRef.current.style.userSelect = "";
    }
  }, [isMobile]);

  // Mobile touch handlers - simplified for native scrolling
  const handleTouchStart = useCallback(() => {
    setIsScrolling(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    // Small delay to prevent modal opening immediately after scroll
    setTimeout(() => {
      setIsScrolling(false);
    }, 100);
  }, []);

  // Modal handlers
  const openModal = (project: Project, e: React.MouseEvent) => {
    if (isDragging || isScrolling) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    const index = projects.findIndex((p) => p.id === project.id);
    setSelectedProject(project);
    setSelectedIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedProject(null);
    setSelectedIndex(-1);
    document.body.style.overflow = "auto";
  };

  const navigatePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex > 0) {
      const prevIndex = selectedIndex - 1;
      setSelectedIndex(prevIndex);
      setSelectedProject(projects[prevIndex]);
    }
  };

  const navigateNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex < projects.length - 1) {
      const nextIndex = selectedIndex + 1;
      setSelectedIndex(nextIndex);
      setSelectedProject(projects[nextIndex]);
    }
  };

  // Global event listeners for smooth dragging
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (!isMobile && isDragging) {
        handleMouseUp();
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isMobile && isDragging && scrollContainerRef.current) {
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
      }
    };

    if (isDragging) {
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.addEventListener("mousemove", handleGlobalMouseMove);
    }

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.body.style.overflow = "auto";
    };
  }, [isDragging, isMobile, startX, scrollLeft, handleMouseUp]);

  if (!isLanguageLoaded || loading || mediaLoading) {
    return (
      <section className="relative py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">Laen projekte...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative py-16 bg-gray-100 w-full">
        <div className="max-w-7xl mx-auto px-4">
          <div className="border-t border-gray-300 w-full mb-4"></div>

          <h2 className="text-sm text-gray-500 mb-8 mt-10">
            {t("projects.title")}
          </h2>
          <div className="mb-8 max-w-md">
            <h3 className="text-2xl text-gray-800 mb-4">
              {t("projects.text")}
            </h3>
          </div>

          <div className="relative -mx-4 px-4 overflow-hidden">
            <div
              className="flex overflow-x-scroll hide-scrollbar"
              ref={scrollContainerRef}
              onMouseDown={!isMobile ? handleMouseDown : undefined}
              onMouseMove={!isMobile ? handleMouseMove : undefined}
              onMouseUp={!isMobile ? handleMouseUp : undefined}
              onMouseLeave={!isMobile ? handleMouseLeave : undefined}
              onTouchStart={isMobile ? handleTouchStart : undefined}
              onTouchEnd={isMobile ? handleTouchEnd : undefined}
              style={{
                cursor: isMobile ? "default" : isDragging ? "grabbing" : "grab",
                WebkitOverflowScrolling: "touch",
                scrollBehavior: isMobile ? "auto" : "smooth",
                userSelect: isDragging ? "none" : "auto",
                touchAction: isMobile ? "pan-x" : "none",
                overscrollBehaviorX: "contain",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className={`group relative flex-shrink-0 ${
                    isMobile
                      ? "w-[280px] min-w-[280px]"
                      : "w-[300px] md:w-[400px] lg:w-[450px] min-w-[300px] md:min-w-[400px] lg:min-w-[450px]"
                  } pr-4 pb-8 ${index === 0 ? "pl-4" : ""}`}
                >
                  <div
                    className="relative h-[500px] w-full mb-4 cursor-pointer transition-transform duration-300 hover:scale-[1.02] select-none"
                    onClick={(e) => openModal(project, e)}
                  >
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover rounded-lg pointer-events-none"
                      unoptimized={true}
                      draggable={false}
                      priority={index < 3}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300 pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="w-12 h-12 flex items-center justify-center">
                        <img
                          src="/image_open.svg"
                          alt="Open"
                          className="w-10 h-10 transition-transform duration-300 group-hover:scale-110"
                          draggable={false}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="max-w-md select-none">
                    <h6 className="text-sm font-small text-gray-500">
                      {project.year}
                    </h6>
                    <h4 className="text-base font-medium text-gray-800 max-w-xs">
                      {project.title}
                    </h4>
                  </div>
                </div>
              ))}
              {/* Add extra space at end for better scrolling */}
              <div className="flex-shrink-0 w-8"></div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 bg-white w-1/4 h-16"></div>
      </section>

      {/* Fixed fullscreen modal */}
      {selectedProject && (
        <div
          className="modal-fullscreen flex items-center justify-center"
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-black opacity-70"></div>

          {/* Close button */}
          <button
            className="fixed top-8 right-8 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-40 transition-all backdrop-blur-sm z-[10001]"
            onClick={closeModal}
          >
            <svg
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

          {/* Modal content container */}
          <div
            className="relative z-[10000] max-w-4xl w-full mx-4 max-h-[90vh] bg-transparent flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image container with navigation buttons */}
            <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px]">
              {/* Navigation buttons positioned relative to image */}
              {selectedIndex > 0 && (
                <button
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-40 transition-all z-[10001] backdrop-blur-sm"
                  onClick={navigatePrevious}
                  aria-label="Previous project"
                >
                  <svg
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

              {selectedIndex < projects.length - 1 && (
                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-40 transition-all z-[10001] backdrop-blur-sm"
                  onClick={navigateNext}
                  aria-label="Next project"
                >
                  <svg
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

              <Image
                src={selectedProject.image}
                alt={selectedProject.title}
                fill
                className="object-contain"
                unoptimized={true}
              />
            </div>

            {/* Info box matching ProjectsGrid */}
            <div className="bg-white text-black p-6 w-full h-24 mt-0 flex flex-col justify-center">
              <p className="text-sm text-gray-400">{selectedProject.year}</p>
              <h2 className="md:text-md text-sm font-medium mt-1">
                {selectedProject.title}
              </h2>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .hide-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
          overflow: -moz-scrollbars-none !important;
        }
        @media (max-width: 768px) {
          .hide-scrollbar {
            -webkit-overflow-scrolling: touch !important;
            overscroll-behavior-x: contain !important;
            scroll-snap-type: none !important;
          }
        }
        .hide-scrollbar * {
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
        }

        /* Force fullscreen modal positioning */
        .modal-fullscreen {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          z-index: 9999 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      `}</style>
    </>
  );
};

export default ProjectsUser;
