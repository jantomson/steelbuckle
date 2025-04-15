"use client";

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface SubpageHeaderProps {
  titleKey: string;
}

export const SubpageHeader: React.FC<SubpageHeaderProps> = ({ titleKey }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-primary-background py-10 sm:py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <h1 className="text-2xl sm:text-3xl font-medium text-primary-text pb-12 sm:pb-16 md:pb-24">
          {t(titleKey)}
        </h1>
      </div>
    </div>
  );
};

// Add default export for backward compatibility
export default SubpageHeader;
