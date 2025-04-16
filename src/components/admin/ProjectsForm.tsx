// components/admin/ProjectsForm.tsx
"use client";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Sidebar from "@/components/admin/AdminSidebar";

// Media grid component for consistent rendering
const MediaGrid = ({
  mediaLibrary,
  selectedImage,
  onSelect,
  isLoading,
}: {
  mediaLibrary: string[];
  selectedImage: string;
  onSelect: (url: string) => void;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40 w-full">
        <p className="text-gray-500">Laen...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {mediaLibrary.map((url, index) => (
        <div
          key={index}
          onClick={() => onSelect(url)}
          className={`cursor-pointer border rounded-lg overflow-hidden 
          hover:border-blue-500 transition-all
          ${selectedImage === url ? "ring-2 ring-blue-500" : ""}
        `}
        >
          <div className="relative h-40 w-full bg-gray-100 flex items-center justify-center">
            <img
              src={url}
              alt={`Meedia valik ${index + 1}`}
              className="max-h-32 max-w-full object-contain"
              onError={(e) => {
                if (
                  !(e.target as HTMLImageElement).src.includes("placeholder")
                ) {
                  (e.target as HTMLImageElement).src = "/placeholder.png";
                  (e.target as HTMLImageElement).alt = "Pilt pole saadaval";
                }
              }}
            />
          </div>
          <div className="p-2 text-xs text-gray-500 truncate">
            {url.split("/").pop()}
          </div>
        </div>
      ))}
    </div>
  );
};

// Media picker component
const MediaPicker = ({
  isOpen,
  selectedImage,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  selectedImage: string;
  onClose: () => void;
  onSelect: (url: string) => void;
}) => {
  if (!isOpen) return null;

  // State for media library
  const [mediaLibrary, setMediaLibrary] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch media library on component mount
  useEffect(() => {
    fetchMediaLibrary();
  }, []);

  // Function to fetch media library
  const fetchMediaLibrary = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/media/library");

      if (response.ok) {
        const data = await response.json();
        setMediaLibrary(data.items || []);
      } else {
        console.error("Failed to fetch media library");
        // Fallback to some default media
        setMediaLibrary([
          "/logo.svg",
          "/naissaare.png",
          "/Liepaja_(61).jpg",
          "/valgaraudteejaam.jpg",
        ]);
      }
    } catch (error) {
      console.error("Error fetching media library:", error);
      setMediaLibrary([
        "/logo.svg",
        "/naissaare.png",
        "/Liepaja_(61).jpg",
        "/valgaraudteejaam.jpg",
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
    >
      <div className="bg-white rounded-lg m-4 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center bg-green-800 text-white p-4 rounded-t-lg">
          <h3 className="text-xl font-medium">Vali pilt</h3>
          <button onClick={onClose} className="text-white">
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

        <div className="p-6">
          {/* Media library grid */}
          <h4 className="font-medium text-gray-700 mb-3">Olemasolev meedia</h4>
          <MediaGrid
            mediaLibrary={mediaLibrary}
            selectedImage={selectedImage}
            onSelect={onSelect}
            isLoading={isLoading}
          />
        </div>

        <div className="p-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Valmis
          </button>
        </div>
      </div>
    </div>
  );
};

interface ProjectData {
  id?: string;
  title: string;
  year: string;
  image: string;
  translations?: Record<string, string>;
}

interface ProjectsFormProps {
  projectId?: string | null;
}

export default function ProjectForm({ projectId }: ProjectsFormProps) {
  const [formData, setFormData] = useState<ProjectData>({
    title: "",
    year: "",
    image: "",
  });
  const [translations, setTranslations] = useState<Record<string, string>>({
    en: "",
    et: "", // Changed from 'est' to 'et' to match the database language code
    lv: "",
    ru: "",
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });
  const router = useRouter();
  const isEditMode = !!projectId;

  // Media picker state
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Fetch project data if in edit mode
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return;

      setIsLoading(true);
      try {
        // Fetch basic project data
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) throw new Error("Failed to fetch project");

        const projectData = await response.json();
        setFormData({
          id: projectData.id,
          title: projectData.title,
          year: projectData.year,
          image: projectData.image,
        });

        // Set preview image
        setPreviewImage(projectData.image);

        // Fetch translations
        const translationsResponse = await fetch(
          `/api/projects/${projectId}/translations`
        );
        if (translationsResponse.ok) {
          const translationsData = await translationsResponse.json();
          // Make sure to match database language codes
          setTranslations({
            en: translationsData.en || "",
            et: translationsData.et || "", // Changed from 'est' to 'et'
            lv: translationsData.lv || "",
            ru: translationsData.ru || "",
          });
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        setMessage({
          text: "Projekti laadimine ebaõnnestus",
          isError: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "et" || name === "en" || name === "lv" || name === "ru") {
      // Update translations
      setTranslations((prev) => ({
        ...prev,
        [name]: value,
      }));

      // For Estonian, also update the main title field
      if (name === "et") {
        setFormData((prev) => ({
          ...prev,
          title: value,
        }));
      }
    } else {
      // Update other form fields
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Open media picker
  const openMediaPicker = () => {
    setIsMediaPickerOpen(true);
  };

  // Close media picker
  const closeMediaPicker = () => {
    setIsMediaPickerOpen(false);
  };

  // Handle media selection from picker
  const handleMediaSelect = (url: string) => {
    setPreviewImage(url);
    setFormData((prev) => ({
      ...prev,
      image: url,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: "", isError: false });

    try {
      // Create FormData object
      const submitData = new FormData();

      // Add form fields
      submitData.append("title", translations.et); // Use Estonian title
      submitData.append("year", formData.year);
      submitData.append("language", "et"); // Default language - changed from 'est' to 'et'

      // Handle image
      if (formData.image || previewImage) {
        submitData.append("imageUrl", formData.image || previewImage || "");
      }

      // Choose API endpoint based on mode
      const url = isEditMode ? `/api/projects/${projectId}` : "/api/projects";

      const method = isEditMode ? "PUT" : "POST";

      // Submit the form
      const response = await fetch(url, {
        method,
        body: submitData,
      });

      if (!response.ok) throw new Error("Failed to save project");

      const savedProject = await response.json();

      // Now update all translations
      if (savedProject.id) {
        const translationResponse = await fetch(
          `/api/projects/${savedProject.id}/translations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              projectId: savedProject.id,
              translations: translations,
            }),
          }
        );

        if (!translationResponse.ok) {
          throw new Error("Failed to save translations");
        }
      }

      setMessage({
        text: `Projekt edukalt ${isEditMode ? "uuendatud" : "loodud"}`,
        isError: false,
      });

      // Redirect after a brief delay to show the success message
      setTimeout(() => {
        router.push("/admin/projects");
      }, 1500);
    } catch (error) {
      console.error("Error saving project:", error);
      setMessage({
        text: `Projekti ${isEditMode ? "uuendamine" : "loomine"} ebaõnnestus`,
        isError: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Navigate back to projects page
  const handleGoBack = () => {
    router.push("/admin/projects");
  };

  // Clear form fields or go back to projects
  const handleReset = () => {
    // Redirect back to projects page
    router.push("/admin/projects");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-5xl mx-auto text-center pt-16 lg:pt-0">
          Laadimine...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <Sidebar activePage="projects" />

        {/* Main content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">
                {isEditMode ? "Muuda projekti" : "Lisa uus projekt"}
              </h2>
              <button
                onClick={handleGoBack}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Tagasi projektide juurde
              </button>
            </div>

            {message.text && (
              <div
                className={`mb-4 p-4 rounded-md ${
                  message.isError
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {message.text}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="bg-white shadow-md rounded-md p-6"
            >
              {/* Estonian Title */}
              <div className="mb-4">
                <label
                  htmlFor="et"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Pealkiri (Eesti) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="et"
                  name="et"
                  value={translations.et}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>

              {/* English Title */}
              <div className="mb-4">
                <label
                  htmlFor="en"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Pealkiri (Inglise)
                </label>
                <input
                  type="text"
                  id="en"
                  name="en"
                  value={translations.en}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              {/* Latvian Title */}
              <div className="mb-4">
                <label
                  htmlFor="lv"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Pealkiri (Läti)
                </label>
                <input
                  type="text"
                  id="lv"
                  name="lv"
                  value={translations.lv}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              {/* Russian Title */}
              <div className="mb-4">
                <label
                  htmlFor="ru"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Pealkiri (Vene)
                </label>
                <input
                  type="text"
                  id="ru"
                  name="ru"
                  value={translations.ru}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              {/* Year */}
              <div className="mb-4">
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Aasta <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="year"
                  name="year"
                  placeholder="Nt: 2022 või 2020-2022"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Saate sisestada ühe aasta (nt 2022) või ajavahemiku (nt
                  2020-2022)
                </p>
              </div>

              {/* Image Selection - Only using media picker */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilt <span className="text-red-500">*</span>
                </label>

                {/* Preview image */}
                {previewImage && (
                  <div className="mb-4 border rounded p-4 bg-gray-50">
                    <div className="relative h-48 w-full max-w-md mx-auto">
                      <Image
                        src={previewImage}
                        alt="Preview"
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Image selection options */}
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    type="button"
                    onClick={openMediaPicker}
                    className="inline-flex items-center px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Vali meediaraamatukogust
                  </button>

                  {/* Clear image button - only shown if we have an image */}
                  {previewImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setFormData((prev) => ({ ...prev, image: "" }));
                      }}
                      className="inline-flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Eemalda pilt
                    </button>
                  )}
                </div>
              </div>

              {/* Form actions */}
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={isSaving}
                >
                  Tühista
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  disabled={isSaving}
                >
                  {isSaving ? "Salvestamine..." : "Salvesta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      {isMediaPickerOpen && (
        <MediaPicker
          isOpen={isMediaPickerOpen}
          selectedImage={previewImage || ""}
          onClose={closeMediaPicker}
          onSelect={handleMediaSelect}
        />
      )}
    </div>
  );
}
