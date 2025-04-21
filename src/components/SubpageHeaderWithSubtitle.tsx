"use client";

import React from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface PageHeaderWithSubtitleProps {
  titleKey: string;
  subtitleKey: string;
}

export const SubpageHeaderWithSubtitle: React.FC<
  PageHeaderWithSubtitleProps
> = ({ titleKey, subtitleKey }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-primary-background py-10 sm:py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <h1 className="text-md text-primary-accent mb-10">{t(titleKey)}</h1>
        <p className="text-2xl sm:text-3xl font-medium text-primary-text pb-8 sm:pb-8 md:pb-8">
          {t(subtitleKey)}
        </p>
      </div>
    </div>
  );
};

// Add default export for backward compatibility
export default SubpageHeaderWithSubtitle;
