"use client";
import React, { useState, useEffect, useRef } from "react";
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

const ProjectsGrid: React.FC = () => {
  const { t } = useTranslation();
  const { currentLang, isLanguageLoaded } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Use ref to prevent multiple simultaneous requests
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasLoadedRef = useRef<Set<string>>(new Set());
  const pathname = usePathname();

  // Default Cloudinary URLs for project placeholders
  const defaultProjectImage =
    "https://res.cloudinary.com/dxr4omqbd/image/upload/v1744754188/media/Skriveri_1.jpg";

  const defaultImages = {
    project_placeholder: defaultProjectImage,
    "projects_grid.project_placeholder": defaultProjectImage,
    "projects_grid.images.project_placeholder": defaultProjectImage,
  };

  const { getImageUrl, loading: mediaLoading } = usePageMedia(
    "projects_grid",
    defaultImages
  );

  // Extract language from URL
  const urlLang = pathname ? extractLanguageFromPath(pathname) : currentLang;

  // Simple, clean fetch function - NO useCallback to prevent recreation
  const fetchProjects = async (lang: string) => {
    // Prevent duplicate requests for the same language
    const cacheKey = `projects-${lang}`;
    if (hasLoadedRef.current.has(cacheKey)) {
      console.log(
        `[ProjectsGrid] Already loaded projects for ${lang}, skipping`
      );
      return;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      console.log(`[ProjectsGrid] Fetching projects for language: ${lang}`);

      // Simple fetch - NO cache busting, let browser handle caching
      const response = await fetch(`/api/projects?lang=${lang}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Only update if request wasn't cancelled
      if (!abortControllerRef.current.signal.aborted) {
        console.log(
          `[ProjectsGrid] Successfully loaded ${data.length} projects for ${lang}`
        );
        setProjects(data);
        setError(null);

        // Mark this language as loaded
        hasLoadedRef.current.add(cacheKey);
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("[ProjectsGrid] Request was cancelled");
        return;
      }

      console.error("Error fetching projects:", error);

      if (!abortControllerRef.current.signal.aborted) {
        setError("Error loading projects. Please try again later.");
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  };

  // Single useEffect with minimal dependencies - NO FUNCTION IN DEPS
  useEffect(() => {
    if (!isLanguageLoaded || !pathname) return;

    const lang = extractLanguageFromPath(pathname);
    console.log(`[ProjectsGrid] Path changed: ${pathname}, language: ${lang}`);

    fetchProjects(lang);

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [pathname, isLanguageLoaded]); // Only these two dependencies, NO fetchProjects

  const openModal = (project: Project) => {
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

  // Loading state
  if (!isLanguageLoaded || loading || mediaLoading) {
    return (
      <div className="w-full bg-white text-black p-16 text-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p>Laen projekte...</p>
        </div>
      </div>
    );
  }

  // Error state - simple, clean error handling
  if (error) {
    return (
      <div className="w-full bg-white text-black p-16 text-center">
        <div className="max-w-md mx-auto">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              hasLoadedRef.current.clear(); // Clear cache
              const lang = pathname
                ? extractLanguageFromPath(pathname)
                : currentLang;
              fetchProjects(lang);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Proovi uuesti
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <div className="w-full bg-white text-black p-16 text-center">
        <p className="text-gray-600">Projektid pole saadaval.</p>
      </div>
    );
  }

  // Main render
  return (
    <div className="w-full bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {projects.map((project) => (
            <div key={project.id} className="mb-8 flex flex-col h-full">
              <div className="relative w-full h-96 sm:h-80 md:h-96 lg:h-[500px] mb-4 group overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover"
                  unoptimized={true}
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                  onClick={() => openModal(project)}
                >
                  <button
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center z-10"
                    aria-label={`Open modal for ${project.title}`}
                  >
                    <span className="text-2xl font-light">+</span>
                  </button>
                  <div className="absolute inset-0 bg-black opacity-10 group-hover:opacity-30 transition-opacity"></div>
                </div>
              </div>

              <div className="mt-2">
                <span className="text-xs text-gray-500 block">
                  {project.year}
                </span>
                <h3 className="text-base font-medium mt-1 mb-4">
                  {project.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProject && (
        <Modal
          project={selectedProject}
          closeModal={closeModal}
          navigatePrevious={navigatePrevious}
          navigateNext={navigateNext}
          isFirst={selectedIndex === 0}
          isLast={selectedIndex === projects.length - 1}
        />
      )}
    </div>
  );
};

interface ModalProps {
  project: Project;
  closeModal: () => void;
  navigatePrevious: (e: React.MouseEvent) => void;
  navigateNext: (e: React.MouseEvent) => void;
  isFirst: boolean;
  isLast: boolean;
}

const Modal: React.FC<ModalProps> = ({
  project,
  closeModal,
  navigatePrevious,
  navigateNext,
  isFirst,
  isLast,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={closeModal}
    >
      <div className="absolute inset-0 bg-black opacity-70"></div>

      <div
        className="relative z-10 max-w-4xl w-full mx-4 max-h-[90vh] bg-transparent flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="fixed top-8 right-8 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-40 transition-all"
          onClick={closeModal}
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

        <div className="flex flex-col">
          <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px]">
            {!isFirst && (
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

            {!isLast && (
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

            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-contain"
              unoptimized={true}
            />
          </div>

          <div className="bg-white text-black p-6 w-full h-24 mt-0 flex flex-col justify-center">
            <p className="text-sm text-gray-400">{project.year}</p>
            <h2 className="md:text-md text-sm font-medium mt-1">
              {project.title}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsGrid;
