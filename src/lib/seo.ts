// lib/seo.ts

/**
 * Retrieves SEO metadata for a specific page and language
 * @param pageKey The key identifying the page
 * @param lang The language code (defaults to 'est')
 * @returns SEO metadata for the specified page and language
 */
export async function getSeoMetadata(pageKey: string, lang: string = "est") {
  try {
    const response = await fetch(`/api/seo?pageKey=${pageKey}&lang=${lang}`);

    if (!response.ok) {
      // Return default SEO data if not found
      return {
        title: "Steel Buckle - Railway Construction & Maintenance",
        metaDescription:
          "Professional railway construction and maintenance services across the Baltics.",
        keywords:
          "railway construction, railway maintenance, railway repair, Estonia, Latvia, Lithuania",
        language: lang,
        pageKey: pageKey,
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching SEO metadata:", error);

    // Return default SEO data in case of error
    return {
      title: "Steel Buckle - Railway Construction & Maintenance",
      metaDescription:
        "Professional railway construction and maintenance services across the Baltics.",
      keywords:
        "railway construction, railway maintenance, railway repair, Estonia, Latvia, Lithuania",
      language: lang,
      pageKey: pageKey,
    };
  }
}
