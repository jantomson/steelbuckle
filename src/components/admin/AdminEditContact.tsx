"use client";

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useEdit } from "@/contexts/EditContext";
import AdminSubpageHeader from "@/components/admin/AdminSubpageHeader";
import ContactContent from "../ContactContent";

// The AdminEditContact component has been simplified to avoid nested EditProviders
const AdminEditContact = () => {
  const { t } = useTranslation();
  const editContext = useEdit();

  // Function to create editable content elements
  const EditableField = ({
    path,
    className = "",
  }: {
    path: string;
    className?: string;
  }) => {
    const content = editContext.getFieldContent(path);

    return (
      <span
        className={`${className} editable-content`}
        onClick={() => editContext.openEditor(path, content)}
      >
        {content}
      </span>
    );
  };

  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <div className="w-full bg-white text-black">
        <AdminSubpageHeader titlePath="contact.title" />
        <ContactContent />
      </div>
    </div>
  );
};

export default AdminEditContact;
