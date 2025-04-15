// components/admin/ProjectsForm.tsx
"use client";
import { useState, useEffect, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Sidebar from "@/components/admin/AdminSidebar";

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
    est: "",
    lv: "",
    ru: "",
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const isEditMode = !!projectId;

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
          setTranslations({
            en: translationsData.en || "",
            est: translationsData.est || "",
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

    if (name === "est" || name === "en" || name === "lv" || name === "ru") {
      // Update translations
      setTranslations((prev) => ({
        ...prev,
        [name]: value,
      }));

      // For Estonian, also update the main title field
      if (name === "est") {
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

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);

    // Clear the image path since we're using a file now
    setFormData((prev) => ({
      ...prev,
      image: "",
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
      submitData.append("title", translations.est); // Use Estonian title
      submitData.append("year", formData.year);
      submitData.append("language", "est"); // Default language

      // Handle image
      if (fileInputRef.current?.files?.length) {
        submitData.append("image", fileInputRef.current.files[0]);
      } else if (formData.image) {
        submitData.append("imageUrl", formData.image);
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
                  htmlFor="est"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Pealkiri (Eesti) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="est"
                  name="est"
                  value={translations.est}
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

              {/* Image Upload */}
              <div className="mb-4">
                <label
                  htmlFor="image"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Pilt <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Preview image */}
                  {previewImage && (
                    <div className="relative h-32 w-32 border rounded">
                      <Image
                        src={previewImage}
                        alt="Preview"
                        fill
                        sizes="128px"
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    {/* Image upload */}
                    <input
                      type="file"
                      id="image"
                      name="image"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      accept="image/*"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Valige uus pilt üleslaadimiseks
                    </p>
                  </div>
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
    </div>
  );
}
