import type { Metadata } from "next";
import fs from "fs";
import path from "path";

// Base URL for the site
export const siteUrl = "https://steelbuckle.ee";

/**
 * Load translations from the filesystem for server-side metadata
 */
export async function getServerTranslations(lang = "est") {
  try {
    // Path to the translations file - adjust if your structure is different
    const filePath = path.join(
      process.cwd(),
      "public",
      "locales",
      lang,
      "common.json"
    );

    // Read the file
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Parse the JSON
    const translations = JSON.parse(fileContent);

    return translations;
  } catch (error) {
    console.error(`Error loading ${lang} translations:`, error);

    // Fallback to Estonian if there's an error
    if (lang !== "est") {
      return getServerTranslations("est");
    }

    // If even Estonian fails, return an empty object
    return {};
  }
}

/**
 * Get a translation value from the translations object
 */
export function getTranslationValue(translations: any, key: string) {
  const keys = key.split(".");
  let value = translations;

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) return key;
  }

  return value;
}

// Default metadata values
export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Steel Buckle OÜ",
    template: "%s | Steel Buckle OÜ",
  },
  description:
    "Raudteede ehitus ja remont. Enam kui 35 aastat edukat tegevust turul.",
  keywords: [
    "raudtee",
    "infrastruktuur",
    "hooldus",
    "remont",
    "ehitus",
    "Eesti",
    "Balti",
  ],
  authors: [{ name: "Steel Buckle OÜ" }],
  creator: "Steel Buckle OÜ",
  publisher: "Steel Buckle OÜ",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  openGraph: {
    type: "website",
    siteName: "Steel Buckle OÜ",
    title: {
      default: "Steel Buckle OÜ",
      template: "%s | Steel Buckle OÜ",
    },
    description:
      "Raudteede ehitus ja remont. Enam kui 35 aastat edukat tegevust turul.",
    locale: "et",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: "Steel Buckle OÜ",
      template: "%s | Steel Buckle OÜ",
    },
    description:
      "Raudteede ehitus ja remont. Enam kui 35 aastat edukat tegevust turul.",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#FFD800", // Yellow theme color
      },
    ],
  },
  manifest: "/site.webmanifest",
  alternates: {
    languages: {
      en: `${siteUrl}?lang=en`,
      est: `${siteUrl}?lang=est`,
      ru: `${siteUrl}?lang=ru`,
      lv: `${siteUrl}?lang=lv`,
    },
  },
  other: {
    "msapplication-TileColor": "#FFD800", // Yellow theme color
  },
};

// Helper function to merge default metadata with page-specific metadata
export function mergeMetadata(metadata: Metadata): Metadata {
  return {
    ...defaultMetadata,
    ...metadata,
    openGraph: {
      ...defaultMetadata.openGraph,
      ...metadata.openGraph,
    },
    twitter: {
      ...defaultMetadata.twitter,
      ...metadata.twitter,
    },
  };
}

// Generate translated metadata for pages
export async function generateTranslatedMetadata(
  titleKey: string,
  descriptionKey: string,
  lang = "est"
): Promise<Metadata> {
  try {
    // Load translations
    const translations = await getServerTranslations(lang);

    // Get translated values
    const title = getTranslationValue(translations, titleKey);
    const description = getTranslationValue(translations, descriptionKey);

    // Return merged metadata
    return mergeMetadata({
      title,
      description,
      openGraph: {
        title,
        description,
      },
      twitter: {
        title,
        description,
      },
    });
  } catch (error) {
    console.error("Error generating translated metadata:", error);
    return defaultMetadata;
  }
}

// Function to create service page metadata using translations
export async function createServicePageMetadata(
  serviceName: string,
  titleKey: string,
  descriptionKey: string,
  lang = "est"
): Promise<Metadata> {
  try {
    // Load translations
    const translations = await getServerTranslations(lang);

    // Get translated values
    const title = getTranslationValue(translations, titleKey);
    const description = getTranslationValue(translations, descriptionKey);

    return mergeMetadata({
      title,
      description,
      openGraph: {
        title,
        description,
      },
    });
  } catch (error) {
    console.error("Error creating service page metadata:", error);
    return defaultMetadata;
  }
}
