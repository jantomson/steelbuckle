"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/admin/AdminSidebar";

interface Project {
  id: string;
  title: string;
  year: string;
  image: string;
  displayOrder: number;
  description?: string;
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isOrderChanged, setIsOrderChanged] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle highlight animation on reorder
  useEffect(() => {
    if (highlightedId) {
      const timer = setTimeout(() => {
        setHighlightedId(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [highlightedId]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      if (response.ok) {
        const data = await response.json();
        // Sort by displayOrder just to be sure
        const sortedData = [...data].sort(
          (a, b) => a.displayOrder - b.displayOrder
        );
        setProjects(sortedData);
      } else {
        setMessage("Projektide laadimine ebaõnnestus");
      }
    } catch (error) {
      setMessage("Viga projektide laadimisel");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm("Kas olete kindel, et soovite selle projekti kustutada?")
    )
      return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProjects(projects.filter((project) => project.id !== id));
        setMessage("Projekt edukalt kustutatud");
      } else {
        setMessage("Projekti kustutamine ebaõnnestus");
      }
    } catch (error) {
      setMessage("Viga projekti kustutamisel");
    }
  };

  // Move a project up in the order
  const moveUp = (index: number) => {
    if (index <= 0) return; // Can't move up if already at the top

    const projectsCopy = [...projects];
    const project = projectsCopy[index];

    // Swap positions
    projectsCopy[index] = projectsCopy[index - 1];
    projectsCopy[index - 1] = project;

    // Update display orders
    const updatedProjects = projectsCopy.map((project, idx) => ({
      ...project,
      displayOrder: idx,
    }));

    setProjects(updatedProjects);
    setIsOrderChanged(true);
    setHighlightedId(project.id);
  };

  // Move a project down in the order
  const moveDown = (index: number) => {
    if (index >= projects.length - 1) return; // Can't move down if already at the bottom

    const projectsCopy = [...projects];
    const project = projectsCopy[index];

    // Swap positions
    projectsCopy[index] = projectsCopy[index + 1];
    projectsCopy[index + 1] = project;

    // Update display orders
    const updatedProjects = projectsCopy.map((project, idx) => ({
      ...project,
      displayOrder: idx,
    }));

    setProjects(updatedProjects);
    setIsOrderChanged(true);
    setHighlightedId(project.id);
  };

  const saveProjectOrder = async () => {
    setIsSaving(true);
    try {
      // Prepare the order updates
      const orderUpdates = projects.map((project, index) => ({
        id: project.id,
        displayOrder: index,
      }));

      const response = await fetch("/api/projects/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderUpdates }),
      });

      if (response.ok) {
        setMessage("Projektide järjekord edukalt salvestatud");
        setIsOrderChanged(false);
      } else {
        setMessage("Projektide järjekorra salvestamine ebaõnnestus");
      }
    } catch (error) {
      console.error("Error saving project order:", error);
      setMessage("Viga projektide järjekorra salvestamisel");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-5xl mx-auto text-center pt-16 lg:pt-0">
          Laadimine...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <Sidebar activePage="projects" />

        {/* Main content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-semibold">
                Halda projekte
              </h2>
              <div className="flex space-x-2">
                {isOrderChanged && (
                  <button
                    onClick={saveProjectOrder}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
                  >
                    {isSaving ? "Salvestamine..." : "Salvesta järjekord"}
                  </button>
                )}
                <Link
                  href="/admin/projects/new"
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-center sm:text-left"
                >
                  Lisa projekt
                </Link>
              </div>
            </div>

            {message && (
              <div className="mb-4 p-3 sm:p-4 rounded-md bg-green-100 text-green-700">
                {message}
              </div>
            )}

            {projects.length === 0 ? (
              <div className="bg-white shadow-md rounded-md p-6 sm:p-8 text-center">
                Projekti pole veel lisatud. Alustage uue projekti loomisest.
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Järjekord
                        </th>
                        <th
                          scope="col"
                          className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Pilt
                        </th>
                        <th
                          scope="col"
                          className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Pealkiri
                        </th>
                        <th
                          scope="col"
                          className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                        >
                          Aasta
                        </th>
                        <th
                          scope="col"
                          className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Järjekord
                        </th>
                        <th
                          scope="col"
                          className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Tegevused
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {projects.map((project, index) => (
                        <tr
                          key={project.id}
                          className={`transition-all duration-300 hover:bg-gray-50 ${
                            highlightedId === project.id ? "bg-green-50" : ""
                          }`}
                        >
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-700">
                                {index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="relative h-10 w-10 sm:h-12 sm:w-12">
                              <Image
                                src={project.image}
                                alt={project.title}
                                fill
                                sizes="(max-width: 640px) 40px, 48px"
                                className="object-cover rounded"
                              />
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap max-w-[120px] sm:max-w-none">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {project.title}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                            <div className="text-sm text-gray-500">
                              {project.year}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => moveUp(index)}
                                disabled={index === 0}
                                className={`p-1 rounded-md ${
                                  index === 0
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-green-600 hover:bg-green-50"
                                }`}
                                title="Liiguta üles"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => moveDown(index)}
                                disabled={index === projects.length - 1}
                                className={`p-1 rounded-md ${
                                  index === projects.length - 1
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-green-600 hover:bg-green-50"
                                }`}
                                title="Liiguta alla"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-3">
                              <Link
                                href={`/admin/projects/${project.id}`}
                                className="text-green-600 hover:text-green-900"
                              >
                                Muuda
                              </Link>
                              <button
                                onClick={() => handleDelete(project.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Kustuta
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {projects.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 text-green-600 rounded-md">
                <p className="font-medium mb-1">
                  Kuidas projekti järjekorda muuta:
                </p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>
                    Kasutage projekti juures olevaid üles/alla nuppe, et muuta
                    järjekorda
                  </li>
                  <li>
                    Klõpsake "Salvesta järjekord" nuppu muudatuste
                    salvestamiseks
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
