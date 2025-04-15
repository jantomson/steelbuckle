"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { useEdit } from "@/contexts/EditContext";
import { useLanguage } from "@/contexts/LanguageContext"; // Add language context

interface Project {
  id: string;
  image: string;
  title: string;
  year: string;
  description: string;
}

const Projects = () => {
  const { t } = useTranslation();
  // Use the edit context
  const editContext = useEdit();
  const isEditMode = editContext?.isEditMode;
  const { currentLang, isLanguageLoaded } = useLanguage(); // Get language context with loading state

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects from API
  useEffect(() => {
    // Only fetch if language is loaded from localStorage
    if (isLanguageLoaded) {
      console.log(
        "AdminProjects: Fetching projects with language:",
        currentLang
      );
      const fetchProjects = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/projects?lang=${currentLang}`);

          if (!response.ok) {
            throw new Error("Failed to fetch projects");
          }

          const data = await response.json();
          console.log("AdminProjects: Fetched data:", data);
          setProjects(data);
          setError(null);
        } catch (err) {
          setError("Error loading projects. Please try again later.");
          console.error("Error fetching projects:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchProjects();
    }
  }, [currentLang, isLanguageLoaded]); // Add isLanguageLoaded as dependency

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
      >
        {content}
      </span>
    );
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [lastX, setLastX] = useState(0);
  const [lastTimestamp, setLastTimestamp] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const openImageOverlay = (image: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering drag events
    setSelectedImage(image);
  };

  const closeImageOverlay = () => {
    setSelectedImage(null);
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

  // If language is still loading or projects are loading, show loading indicator
  if (!isLanguageLoaded || loading) {
    return (
      <section className="relative py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading projects...</div>
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
    <section className="relative py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="border-t border-gray-300 w-full mb-4 ml-4"></div>
        {/* Title not editable */}
        <h2 className="text-sm text-gray-500 mb-8 mt-10 pl-4">
          {t("projects.title")}
        </h2>
        <div className="mb-8 max-w-md pl-4">
          {/* Only this text is editable */}
          <h3 className="text-2xl text-gray-800 mb-4">
            <EditableText path="projects.text" />
          </h3>
        </div>

        <div className="relative overflow-hidden">
          {/* Dynamic horizontal scroll container */}
          <div
            className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory pl-4"
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
              projects.map((project) => (
                <div
                  key={project.id}
                  className={`group relative flex-shrink-0 ${
                    isMobile
                      ? "w-[70vw]"
                      : "w-[300px] md:w-[400px] lg:w-[450px]"
                  } pr-4 pb-8 snap-center`}
                >
                  <div
                    className="relative h-[500px] w-[95%] mb-4 cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                    onClick={(e) => openImageOverlay(project.image, e)}
                  >
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover rounded-lg"
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
                  <div className="mb-8 max-w-md">
                    <h6 className="text-sm font-small text-gray-500">
                      {project.year}
                    </h6>
                    <h4 className="text-base font-medium text-gray-800 max-w-xs">
                      {project.title}
                    </h4>
                  </div>
                </div>
              ))}
          </div>

          {/* Image Overlay */}
          {selectedImage && (
            <div
              className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center"
              onClick={closeImageOverlay}
            >
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
                  />
                </div>
              </div>

              {/* Completely separate close button with fixed position */}
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

          <style jsx>{`
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

export default Projects;
