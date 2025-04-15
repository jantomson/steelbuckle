"use client";

import React from "react";
import AdminSubpageHeaderWithSubtitle from "@/components/admin/AdminSubpageHeaderWithSubtitle";
import ProjectsGrid from "@/components/ProjectsGrid";
import { useTranslation } from "@/hooks/useTranslation";
import { useEdit } from "@/contexts/EditContext";

// Admin Projects Edit Component
const AdminEditProjects = () => {
  const { t } = useTranslation();
  const editContext = useEdit();
  const isEditMode = editContext?.isEditMode;

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
