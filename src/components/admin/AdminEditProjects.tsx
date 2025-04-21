"use client";

import React from "react";
import AdminSubpageHeaderWithSubtitle from "@/components/admin/AdminSubpageHeaderWithSubtitle";
import ProjectsGrid from "@/components/ProjectsGrid";
import { useTranslation } from "@/hooks/useTranslation";
import { useEdit } from "@/contexts/EditContext";
import { useEffect } from "react";

// Admin Projects Edit Component
const AdminEditProjects = () => {
  const { t } = useTranslation();
  const editContext = useEdit();
  const isEditMode = editContext?.isEditMode;

  // Check if we're missing the language parameter in the URL
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !window.location.search.includes("lang=")
    ) {
      // Get the language from storage
      const storedLang =
        sessionStorage.getItem("adminEditingLanguage") ||
        sessionStorage.getItem("editingLanguage") ||
        localStorage.getItem("adminLastEditedLanguage") ||
        "et";

      // Update the URL with the language
      const url = new URL(window.location.href);
      url.searchParams.set("lang", storedLang);
      window.history.replaceState({}, "", url.toString());

      console.log(`Added missing language parameter to URL: ${storedLang}`);
    }
  }, []);

  // This component should only be used in admin mode where editContext is available
  if (!isEditMode) {
    return <div>Error: Edit mode not available</div>;
  }

  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <div className="w-full bg-white text-black">
        {/* Using the SubpageHeader component which has editable functionality built-in */}
        <AdminSubpageHeaderWithSubtitle
          titlePath="projects_page.page_title"
          subtitlePath="projects_page.page_subtitle"
        />

        {/* Projects grid component */}
        <ProjectsGrid />
      </div>
    </div>
  );
};

export default AdminEditProjects;
