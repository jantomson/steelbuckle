"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useEdit } from "@/contexts/EditContext";

interface YellowHeaderWithSubtitleProps {
  titlePath: string;
  subtitlePath: string;
}

const AdminSubpageHeaderWithSubtitle: React.FC<
  YellowHeaderWithSubtitleProps
> = ({ titlePath, subtitlePath }) => {
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
        <h1 className="text-md text-primary-accent mb-10">
          <EditableText path={titlePath} />
        </h1>
        <p className="text-2xl sm:text-3xl font-medium text-primary-text pb-8 sm:pb-8 md:pb-8">
          <EditableText path={subtitlePath} />
        </p>
      </div>
    </div>
  );
};

export default AdminSubpageHeaderWithSubtitle;
