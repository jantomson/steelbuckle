"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useEdit } from "@/contexts/EditContext";

interface YellowHeaderProps {
  titlePath: string;
}

const AdminSubpageHeader: React.FC<YellowHeaderProps> = ({ titlePath }) => {
  const { t } = useTranslation();
  const editContext = useEdit();
  const isEditMode = editContext?.isEditMode;

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

  return (
    <div className="bg-primary-background py-10 sm:py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <h1 className="text-2xl sm:text-3xl font-medium text-primary-text pb-12 sm:pb-16 md:pb-24">
          <EditableText path={titlePath} />
        </h1>
      </div>
    </div>
  );
};

export default AdminSubpageHeader;
