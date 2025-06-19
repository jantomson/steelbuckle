"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSeoMetadata, getSeoKeyFromPath } from "@/lib/seo";
import { usePathname } from "next/navigation";
import { SupportedLanguage, defaultLanguage } from "@/config/routeTranslations";
import { extractLanguageFromPath, isAdminPath } from "@/utils/navigation";

interface SEOMetadataProps {
  // Optional explicit page key override
  pageKey?: string;
}

export default function SEOMetadata({
  pageKey: explicitPageKey,
}: SEOMetadataProps) {
  const { currentLang } = useLanguage();
  const [seo, setSeo] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchSeo() {
      try {
        // Skip SEO for admin pages
        if (isAdminPath(pathname)) {
          return;
        }

        // Determine which language to use - prioritize URL language over context
        const urlLang = extractLanguageFromPath(pathname);
        const effectiveLang = (urlLang ||
          currentLang ||
          defaultLanguage) as SupportedLanguage;

        // Determine which page key to use - either explicit, or derived from path
        const effectivePageKey = explicitPageKey || pathname;

        // console.log(
        //   `Fetching SEO data: page=${effectivePageKey}, lang=${effectiveLang}`
        // );
        const data = await getSeoMetadata(effectivePageKey, effectiveLang);
        setSeo(data);

        // Only update document if we got data back
        if (data) {
          // Update the document title
          document.title = data.title;

          // Update meta description
          updateMetaTag("description", data.metaDescription);

          // Update keywords
          if (data.keywords) {
            updateMetaTag("keywords", data.keywords);
          }

          // Update Open Graph tags
          updateMetaTag("og:title", data.ogTitle || data.title, "property");
          updateMetaTag(
            "og:description",
            data.ogDescription || data.metaDescription,
            "property"
          );
          updateMetaTag("og:type", "website", "property");
          updateMetaTag("og:image", "/og-image.jpg", "property");

          // Update locale based on language
          const locale = getLocaleFromLanguage(effectiveLang);
          updateMetaTag("og:locale", locale, "property");
        }
      } catch (error) {
        console.error("Error fetching SEO metadata:", error);
      }
    }

    // Only fetch SEO if we have a pathname
    if (pathname) {
      fetchSeo();
    }

    // Cleanup function (optional)
    return () => {
      // Optional cleanup
    };
  }, [pathname, currentLang, explicitPageKey]);

  // Helper function to update or create meta tags
  function updateMetaTag(
    name: string,
    content: string,
    attributeName: string = "name"
  ) {
    // Try to find existing meta tag
    let meta = document.querySelector(`meta[${attributeName}="${name}"]`);

    // If it doesn't exist, create it
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute(attributeName, name);
      document.head.appendChild(meta);
    }

    // Set the content
    meta.setAttribute("content", content);
  }

  // Helper to map language code to locale for Open Graph
  function getLocaleFromLanguage(language: string): string {
    switch (language) {
      case "et":
        return "et_EE";
      case "en":
        return "en_US";
      case "ru":
        return "ru_RU";
      case "lv":
        return "lv_LV";
      default:
        return "et_EE";
    }
  }

  // This component doesn't render anything visible
  return null;
}
