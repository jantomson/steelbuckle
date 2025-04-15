"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/contexts/LanguageContext";

interface Project {
  id: string;
  image: string;
  title: string;
  year: string;
}

const ProjectsGrid: React.FC = () => {
  const { t } = useTranslation();
  const { currentLang, isLanguageLoaded } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  useEffect(() => {
    if (isLanguageLoaded) {
      console.log(
        "ProjectsGrid: Fetching projects with language:",
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
          console.log("ProjectsGrid: Fetched projects:", data);
          setProjects(data);
          setError(null);
        } catch (err) {
          console.error("Error fetching projects:", err);
          setError("Error loading projects. Please try again later.");
        } finally {
          setLoading(false);
        }
      };

      fetchProjects();
    }
  }, [currentLang, isLanguageLoaded]);

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

  if (!isLanguageLoaded || loading) {
    return (
      <div className="w-full bg-white text-black p-16 text-center">
        Laen projekte...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white text-black p-16 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-16 mt-10">
        {projects.length === 0 ? (
          <div className="text-center py-8">Projektid pole saadaval.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {projects.map((project) => (
              <div key={project.id} className="mb-8 flex flex-col h-full">
                {/* Fixed height container - 400px on desktop, responsive on smaller screens */}
                <div className="relative w-full h-96 sm:h-80 md:h-96 lg:h-[500px] mb-4 group overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
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

                {/* Meta information with consistent spacing */}
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
        )}
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
        {/* Close button */}
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
          {/* Fixed height for modal images */}
          <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px]">
            {/* Navigation buttons positioned relative to image container */}
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
            />
          </div>

          {/* Info box with fixed height and same width as image */}
          <div className="bg-white text-black p-6 w-full h-24 mt-0 flex flex-col justify-center">
            <p className="text-sm text-gray-400">{project.year}</p>
            <h2 className="text-lg font-medium mt-1">{project.title}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsGrid;
