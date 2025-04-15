import { useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useState } from "react";

export interface TranslationField {
  path: string;
  key: string;
  content: string;
  type: string;
}

export interface PageData {
  id: string;
  title: string;
  sections: TranslationField[];
}

export interface PageTemplate {
  [key: string]: PageData;
}

// Storage keys
const STORAGE_KEY = "pageEditorContent";
const TRANSLATION_KEY = "translationData";
let translationData: any = null;

// Function to determine field type based on key naming convention
const getFieldType = (key: string): string => {
  if (key.includes("title")) return "h1";
  if (key.includes("subtitle")) return "h2";
  if (key.includes("intro")) return "p";
  if (key.includes("description")) return "p";
  if (key.includes("text")) return "p";
  return "p";
};

// Initialize the page templates based on translations
export const generatePageTemplatesFromTranslations = (
  translationData: any
): PageTemplate => {
  // If no translation data, return empty templates
  if (!translationData) {
    return {};
  }

  const pages: PageTemplate = {
    home: {
      id: "home", // Added the id property
      title: "Home Page",
      sections: [
        {
          path: "hero.title_start",
          key: "title_start",
          content: translationData.hero?.title_start || "",
          type: "h1",
        },
        {
          path: "hero.title_span",
          key: "title_span",
          content: translationData.hero?.title_span || "",
          type: "h1",
        },
        {
          path: "hero.title_end",
          key: "title_end",
          content: translationData.hero?.title_end || "",
          type: "h1",
        },
        {
          path: "hero.subtitle",
          key: "subtitle",
          content: translationData.hero?.subtitle || "",
          type: "p",
        },
        {
          path: "hero.cta",
          key: "cta",
          content: translationData.hero?.cta || "",
          type: "p",
        },
        {
          path: "about.title",
          key: "title",
          content: translationData.about?.title || "",
          type: "h2",
        },
        {
          path: "about.text_1",
          key: "text_1",
          content: translationData.about?.text_1 || "",
          type: "p",
        },
        {
          path: "about.text_2",
          key: "text_2",
          content: translationData.about?.text_2 || "",
          type: "p",
        },
        {
          path: "about.read_more",
          key: "read_more",
          content: translationData.about?.read_more || "",
          type: "p",
        },
      ],
    },
    about: {
      id: "about", // Added the id property
      title: "About Us",
      sections: [
        {
          path: "about_page.title",
          key: "title",
          content: translationData.about_page?.title || "",
          type: "h1",
        },
        {
          path: "about_page.content.intro",
          key: "intro",
          content: translationData.about_page?.content?.intro || "",
          type: "p",
        },
        {
          path: "about_page.content.history",
          key: "history",
          content: translationData.about_page?.content?.history || "",
          type: "p",
        },
        {
          path: "about_page.content.materials",
          key: "materials",
          content: translationData.about_page?.content?.materials || "",
          type: "p",
        },
        {
          path: "about_page.content.locations",
          key: "locations",
          content: translationData.about_page?.content?.locations || "",
          type: "p",
        },
        {
          path: "about_page.content.invitation",
          key: "invitation",
          content: translationData.about_page?.content?.invitation || "",
          type: "p",
        },
        {
          path: "about_page.services.title",
          key: "services_title",
          content: translationData.about_page?.services?.title || "",
          type: "h2",
        },
      ],
    },
    services: {
      id: "services", // Added the id property
      title: "Our Services",
      sections: [
        {
          path: "services.title",
          key: "title",
          content: translationData.services?.title || "",
          type: "h1",
        },
        {
          path: "services.railway_maintenance",
          key: "railway_maintenance",
          content: translationData.services?.railway_maintenance || "",
          type: "h2",
        },
        {
          path: "services.repair_renovation",
          key: "repair_renovation",
          content: translationData.services?.repair_renovation || "",
          type: "h2",
        },
        {
          path: "services.railway_construction",
          key: "railway_construction",
          content: translationData.services?.railway_construction || "",
          type: "h2",
        },
        {
          path: "services.design",
          key: "design",
          content: translationData.services?.design || "",
          type: "h2",
        },
        {
          path: "services_slider.title",
          key: "slider_title",
          content: translationData.services_slider?.title || "",
          type: "h2",
        },
        {
          path: "services_slider.read_more",
          key: "read_more",
          content: translationData.services_slider?.read_more || "",
          type: "p",
        },
      ],
    },
    projects: {
      id: "projects", // Added the id property
      title: "Projects",
      sections: [
        {
          path: "projects.title",
          key: "title",
          content: translationData.projects?.title || "",
          type: "h1",
        },
        {
          path: "projects.text",
          key: "text",
          content: translationData.projects?.text || "",
          type: "p",
        },
        {
          path: "projects_page.page_subtitle",
          key: "page_subtitle",
          content: translationData.projects_page?.page_subtitle || "",
          type: "h2",
        },
        {
          path: "projects_page.page_title",
          key: "page_title",
          content: translationData.projects_page?.page_title || "",
          type: "p",
        },
      ],
    },
    contact: {
      id: "contact", // Added the id property
      title: "Contact",
      sections: [
        {
          path: "contact.title",
          key: "title",
          content: translationData.contact?.title || "",
          type: "h1",
        },
        {
          path: "contact.form.response_time",
          key: "response_time",
          content: translationData.contact?.form?.response_time || "",
          type: "p",
        },
        {
          path: "contact.form.submit",
          key: "submit",
          content: translationData.contact?.form?.submit || "",
          type: "p",
        },
        {
          path: "contact.info.contact_title",
          key: "contact_title",
          content: translationData.contact?.info?.contact_title || "",
          type: "h2",
        },
      ],
    },
    // Add templates for railway-related pages
    "railway-repair": {
      id: "railway-repair", // Added the id property
      title: "Raudteede remont ja renoveerimine",
      sections: [], // You can add appropriate sections here
    },
    "railway-design": {
      id: "railway-design", // Added the id property
      title: "Raudteede projekteerimine",
      sections: [], // You can add appropriate sections here
    },
    "railway-maintenance": {
      id: "railway-maintenance", // Added the id property
      title: "Raudteede jooksev korrashoid",
      sections: [], // You can add appropriate sections here
    },
    "railway-infrastructure": {
      id: "railway-infrastructure", // Added the id property
      title: "Raudtee infrastruktuuri ehitus",
      sections: [], // You can add appropriate sections here
    },
  };

  return pages;
};

// Helper function to set a nested value in an object
const setNestedValue = (obj: any, path: string, value: any): any => {
  const parts = path.split(".");
  const lastKey = parts.pop()!;

  let current = obj;
  for (const part of parts) {
    if (!current[part]) current[part] = {};
    current = current[part];
  }

  current[lastKey] = value;
  return obj;
};

// Hook to handle page templates using the translation data
export function usePageTemplates() {
  const { t, currentLang } = useTranslation();
  const [allTemplates, setAllTemplates] = useState<PageTemplate>({});
  const [isLoading, setIsLoading] = useState(true);

  // Get translation data using your hook's internal state
  useEffect(() => {
    const generateTemplates = async () => {
      setIsLoading(true);

      try {
        // Fetch the full translation object
        const response = await fetch(`/locales/${currentLang}/common.json`);
        const translationData = await response.json();

        // Generate templates from the loaded data
        const templates =
          generatePageTemplatesFromTranslations(translationData);
        setAllTemplates(templates);
      } catch (error) {
        console.error("Error generating page templates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    generateTemplates();
  }, [currentLang]);

  // Get a specific page template
  const getPageTemplate = (pageId: string): PageData | null => {
    return allTemplates[pageId] || null;
  };

  // Save changes to a page template
  const savePageTemplate = async (
    pageId: string,
    pageData: PageData
  ): Promise<boolean> => {
    try {
      // Fetch the current translations to get the full object
      const response = await fetch(`/locales/${currentLang}/common.json`);
      const translationData = await response.json();

      // Update translations with the new content
      pageData.sections.forEach((section) => {
        setNestedValue(translationData, section.path, section.content);
      });

      // In a real app, you'd send this updated data to your server
      console.log("Updated translation data:", translationData);

      // For demonstration, we'll save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `saved_translations_${currentLang}`,
          JSON.stringify(translationData)
        );
      }

      // Here you would typically use a fetch POST request to update the file on your server
      // Example: await fetch('/api/update-translations', {
      //    method: 'POST',
      //    headers: { 'Content-Type': 'application/json' },
      //    body: JSON.stringify({ language: currentLang, data: translationData })
      // });

      return true;
    } catch (error) {
      console.error("Error saving translation data:", error);
      return false;
    }
  };

  // Export the translation data for download
  const exportTranslationData = async (): Promise<string> => {
    try {
      const response = await fetch(`/locales/${currentLang}/common.json`);
      const translationData = await response.json();

      // If we have saved edits in localStorage, use those instead
      if (typeof window !== "undefined") {
        const savedData = localStorage.getItem(
          `saved_translations_${currentLang}`
        );
        if (savedData) {
          return savedData;
        }
      }

      return JSON.stringify(translationData, null, 2);
    } catch (error) {
      console.error("Error exporting translation data:", error);
      return "{}";
    }
  };

  return {
    allTemplates,
    isLoading,
    getPageTemplate,
    savePageTemplate,
    exportTranslationData,
  };
}
