"use client";

import React from "react";
import Link from "next/link";
import { getLanguageFromUrl } from "@/utils/languageUtils";

// Component for navigation links that preserves the current language
interface LanguagePreservingNavLinkProps {
  href: string;
  className?: string;
  activeClassName?: string;
  children: React.ReactNode;
}

const LanguagePreservingNavLink: React.FC<LanguagePreservingNavLinkProps> = ({
  href,
  className = "",
  activeClassName = "",
  children,
}) => {
  // Get current language from URL
  const currentLang = getLanguageFromUrl();

  // Add language parameter to the href
  const languagePreservedHref = href.includes("?")
    ? `${href}&lang=${currentLang}`
    : `${href}?lang=${currentLang}`;

  // Check if this link is for the current page
  const isActive =
    typeof window !== "undefined" &&
    window.location.pathname === href.split("?")[0];

  // Combine classes
  const combinedClassName = isActive
    ? `${className} ${activeClassName}`.trim()
    : className;

  return (
    <Link href={languagePreservedHref} className={combinedClassName}>
      {children}
    </Link>
  );
};

export default LanguagePreservingNavLink;
