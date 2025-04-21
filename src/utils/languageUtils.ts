// languageUtils.ts
// This utility file provides consistent language handling across admin pages

export const ensureLanguageParam = () => {
  if (typeof window === "undefined") return;

  if (!window.location.search.includes("lang=")) {
    // Get the language from storage using a consistent priority order
    const storedLang =
      sessionStorage.getItem("adminEditingLanguage") ||
      sessionStorage.getItem("editingLanguage") ||
      localStorage.getItem("adminLastEditedLanguage") ||
      localStorage.getItem("language") ||
      "et";

    // Update the URL with the language
    const url = new URL(window.location.href);
    url.searchParams.set("lang", storedLang);
    window.history.replaceState({}, "", url.toString());

    console.log(`Added missing language parameter to URL: ${storedLang}`);
  }
};

export const getLanguageFromUrl = (): string => {
  if (typeof window === "undefined") return "et";

  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("lang") || "et";
};

// For use in navigation links to preserve language
export const addLanguageToPath = (path: string): string => {
  if (typeof window === "undefined") return path;

  const currentLang = getLanguageFromUrl();

  // If the path already has query parameters
  if (path.includes("?")) {
    return `${path}&lang=${currentLang}`;
  }

  // If the path doesn't have query parameters
  return `${path}?lang=${currentLang}`;
};

// Updates links/buttons to preserve language when navigating
export const setupLanguagePreservingLinks = () => {
  if (typeof window === "undefined") return;

  // Get current language
  const currentLang = getLanguageFromUrl();

  // Find all admin navigation links
  document.querySelectorAll('a[href^="/admin/"]').forEach((link) => {
    const anchorElement = link as HTMLAnchorElement;
    const currentHref = anchorElement.getAttribute("href") || "";

    // Skip if link already has language parameter
    if (currentHref.includes("lang=")) return;

    // Add language parameter
    if (currentHref.includes("?")) {
      anchorElement.setAttribute("href", `${currentHref}&lang=${currentLang}`);
    } else {
      anchorElement.setAttribute("href", `${currentHref}?lang=${currentLang}`);
    }
  });
};
