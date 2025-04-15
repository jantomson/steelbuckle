"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSeoMetadata } from "@/lib/seo";

interface SEOMetadataProps {
  pageKey: string;
}

export default function SEOMetadata({ pageKey }: SEOMetadataProps) {
  const { currentLang } = useLanguage();
  const [seo, setSeo] = useState<any>(null);

  useEffect(() => {
    async function fetchSeo() {
      try {
        const data = await getSeoMetadata(pageKey, currentLang);
        setSeo(data);

        // Directly update the document title and meta tags
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
          const locale =
            currentLang === "est"
              ? "et_EE"
              : currentLang === "en"
              ? "en_US"
              : currentLang === "ru"
              ? "ru_RU"
              : "lv_LV";
          updateMetaTag("og:locale", locale, "property");
        }
      } catch (error) {
        console.error("Error fetching SEO metadata:", error);
      }
    }

    fetchSeo();

    // Cleanup function to reset title when component unmounts
    return () => {
      // Optional: reset title on unmount if needed
    };
  }, [pageKey, currentLang]);

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

  // This component doesn't render anything visible
  return null;
}
