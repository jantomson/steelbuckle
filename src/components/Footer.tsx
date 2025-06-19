// components/Footer.tsx - Updated to use global color scheme
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";
import { useContactInfo } from "@/hooks/useContactInfo";
import { buildLocalizedUrl } from "@/config/routeTranslations";
import { SupportedLanguage } from "@/config/routeTranslations";
import { useGlobalColorScheme } from "@/components/admin/GlobalColorSchemeProvider";

const Footer: React.FC = () => {
  const { t, currentLang: currentLanguage } = useTranslation();
  const router = useRouter();
  const { contactInfo, isLoading, getPhoneByLabel } = useContactInfo();
  const [isClient, setIsClient] = useState(false);
  const { colorScheme } = useGlobalColorScheme();

  // State for logo variant - now gets from global color scheme
  const [logoVariant, setLogoVariant] = useState<"dark" | "white">("dark");
  const [kodaLogoVariant, setKodaLogoVariant] = useState<"dark" | "white">(
    "dark"
  );

  // State for handling Koda logo errors
  const [kodaLogoError, setKodaLogoError] = useState(false);

  // Dynamic logo URL based on logoVariant
  const logoUrl = `/logo_${logoVariant}.svg`;

  // Initialize mainPhone to avoid hydration issues
  const [mainPhone, setMainPhone] = useState<any>(null);

  // Set client-side state and load dynamic data after component mounts
  useEffect(() => {
    setIsClient(true);

    // Get specific phones if available
    const phone =
      getPhoneByLabel("Üldtelefon") ||
      getPhoneByLabel("main") ||
      getPhoneByLabel("üld") ||
      (contactInfo.phones.length > 0 ? contactInfo.phones[0] : undefined);

    setMainPhone(phone);
  }, [getPhoneByLabel, contactInfo.phones]);

  // Update logo variants when global color scheme changes
  useEffect(() => {
    if (colorScheme) {
      setLogoVariant(colorScheme.logoVariant);
      setKodaLogoVariant(colorScheme.logoVariant);
      // console.log(`Footer logo variants updated: ${colorScheme.logoVariant}`);
    }
  }, [colorScheme]);

  // Fallback: Load logo variant from localStorage if global system isn't available
  useEffect(() => {
    if (typeof window === "undefined" || colorScheme) return; // Skip if global scheme is available

    const loadLogoVariant = () => {
      const savedLogoVariant = localStorage.getItem("site.logoVariant");
      if (savedLogoVariant === "dark" || savedLogoVariant === "white") {
        setLogoVariant(savedLogoVariant);
        setKodaLogoVariant(savedLogoVariant);
      }
    };

    // Initial load
    loadLogoVariant();

    // Listen for localStorage changes (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "site.logoVariant") {
        loadLogoVariant();
      }
    };

    // Listen for custom color scheme change events with payload
    const handleColorSchemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{
        logoVariant: "dark" | "white";
        lineVariant: "dark" | "white";
      }>;
      if (customEvent.detail && customEvent.detail.logoVariant) {
        setLogoVariant(customEvent.detail.logoVariant);
        setKodaLogoVariant(customEvent.detail.logoVariant);
      } else {
        // Fallback to localStorage if the event doesn't have the expected data
        loadLogoVariant();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "colorSchemeChanged",
      handleColorSchemeChange as EventListener
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "colorSchemeChanged",
        handleColorSchemeChange as EventListener
      );
    };
  }, [colorScheme]);

  const getKodaLogo = () => {
    const base = "Kaubanduskoda-liikmelogo";
    const variant = kodaLogoVariant === "dark" ? "dark" : "white";

    // Improved logic with better fallbacks
    let logoPath;
    switch (currentLanguage) {
      case "en":
        logoPath = `/${base}_ENG_horiz_${variant}.png`;
        break;
      case "ru":
        logoPath = `/${base}_RUS_horiz_${variant}.png`;
        break;
      case "lv":
        // Use Estonian as fallback for Latvian since RUS version might not exist
        logoPath = `/${base}_RUS_horiz_${variant}.png`;
        break;
      default:
        logoPath = `/${base}_EST_horiz_${variant}.png`;
    }

    return logoPath;
  };

  // Debug logging for Koda logo
  useEffect(() => {
    if (isClient) {
    }
  }, [currentLanguage, kodaLogoVariant, isClient]);

  // Function to handle Koda logo error
  const [showKodaLogo, setShowKodaLogo] = useState(true);
  const [kodaFallbackAttempted, setKodaFallbackAttempted] = useState(false);

  // Replace the existing handleKodaLogoError function with this:
  const handleKodaLogoError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Koda logo failed to load:", getKodaLogo());

    if (!kodaFallbackAttempted) {
      // First failure - try Estonian fallback
      setKodaFallbackAttempted(true);
      const fallbackLogo = `/Kaubanduskoda-liikmelogo_EST_horiz_${kodaLogoVariant}.png`;
      // console.log("Attempting fallback logo:", fallbackLogo);
      e.currentTarget.src = fallbackLogo;
    } else {
      // Fallback also failed - hide the logo completely
      console.error("Koda logo fallback also failed, hiding logo");
      setShowKodaLogo(false);
      setKodaLogoError(true);
    }
  };

  // Add this function to handle successful logo loads
  const handleKodaLogoLoad = () => {
    setKodaLogoError(false);
    setShowKodaLogo(true);
  };

  // Reset states when logo variant or language changes
  useEffect(() => {
    setShowKodaLogo(true);
    setKodaLogoError(false);
    setKodaFallbackAttempted(false);
  }, [kodaLogoVariant, currentLanguage]);

  // Function to handle navigation in edit mode
  const handleAdminNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    if (!isClient) return;

    // Check for admin edit mode using URL or other method
    const isAdminMode = window.location.pathname.includes("/admin");

    if (isAdminMode) {
      e.preventDefault();

      // Extract the page identifier from the path
      let pageId = "";

      if (path === "/") {
        pageId = "home";
      } else if (path === "/ettevottest") {
        pageId = "about";
      } else if (path === "/tehtud-tood") {
        pageId = "projects";
      } else if (path === "/kontakt") {
        pageId = "contact";
      } else if (path.includes("/teenused/")) {
        // Handle service subpages
        const service = path.split("/").pop() || "";

        if (service === "raudteede-jooksev-korrashoid") {
          pageId = "railway-maintenance";
        } else if (service === "remont-ja-renoveerimine") {
          pageId = "railway-repair";
        } else if (service === "raudtee-ehitus") {
          pageId = "railway-infrastructure";
        } else if (service === "projekteerimine") {
          pageId = "railway-design";
        }
      }

      if (pageId) {
        router.push(`/admin/pages/edit/${pageId}`);
      }
    }
  };

  // Helper function to convert a static URL to a localized one
  const getLocalizedUrl = (staticUrl: string) => {
    // Map static URLs to route keys
    let routeKey;

    if (staticUrl === "/") {
      routeKey = "home";
    } else if (staticUrl === "/ettevottest") {
      routeKey = "about";
    } else if (staticUrl === "/tehtud-tood") {
      routeKey = "projects";
    } else if (staticUrl === "/kontakt") {
      routeKey = "contact";
    } else if (staticUrl === "/teenused/raudteede-jooksev-korrashoid") {
      routeKey = "railway-maintenance";
    } else if (staticUrl === "/teenused/remont-ja-renoveerimine") {
      routeKey = "repair-renovation";
    } else if (staticUrl === "/teenused/raudtee-ehitus") {
      routeKey = "railway-construction";
    } else if (staticUrl === "/teenused/projekteerimine") {
      routeKey = "design";
    } else {
      // If not a recognized path, return the original URL
      return staticUrl;
    }

    // Build localized URL using the routeTranslations utility
    return buildLocalizedUrl(
      routeKey as any,
      currentLanguage as SupportedLanguage
    );
  };

  // Create custom link component that handles admin navigation
  type AdminLinkProps = {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  };

  const AdminLink: React.FC<AdminLinkProps> = ({
    href,
    children,
    className = "",
    onClick,
  }) => {
    // Get the localized URL if needed (skip admin URLs)
    const localizedHref = href.includes("/admin")
      ? href
      : getLocalizedUrl(href);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      const isAdminMode = isClient
        ? window.location.pathname.includes("/admin")
        : false;
      if (isAdminMode) {
        handleAdminNavigation(e, href);
      }
      if (onClick) onClick(e);
    };

    return (
      <Link href={localizedHref} className={className} onClick={handleClick}>
        {children}
      </Link>
    );
  };

  // Improved function to handle footer positioning
  useEffect(() => {
    if (typeof window === "undefined") return;

    const positionFooter = () => {
      const footer = document.getElementById("main-footer");
      const body = document.body;
      const html = document.documentElement;

      if (!footer) return;

      // Get the total height of the document content
      const docHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      );

      // Get viewport height
      const viewportHeight = window.innerHeight;

      // Get the footer height
      const footerHeight = footer.offsetHeight;

      // If document height is less than viewport, position footer at bottom
      if (docHeight <= viewportHeight) {
        document.body.style.minHeight = "100vh";
        document.body.style.display = "flex";
        document.body.style.flexDirection = "column";

        footer.style.position = "sticky";
        footer.style.bottom = "0";
        footer.style.width = "100%";
        footer.style.marginTop = "auto"; // This pushes the footer to the bottom
      } else {
        document.body.style.minHeight = "";
        document.body.style.display = "";
        document.body.style.flexDirection = "";

        footer.style.position = "relative";
        footer.style.bottom = "auto";
        footer.style.marginTop = "0";
      }
    };

    // Run on initial load and whenever window is resized or content changes
    positionFooter();
    window.addEventListener("resize", positionFooter);
    window.addEventListener("load", positionFooter);

    // Setup a MutationObserver to check for DOM changes that might affect layout
    const observer = new MutationObserver(positionFooter);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    // Clean up event listeners and observer
    return () => {
      window.removeEventListener("resize", positionFooter);
      window.removeEventListener("load", positionFooter);
      observer.disconnect();
    };
  }, [isClient]); // Only run when component is mounted on client

  return (
    <footer
      id="main-footer"
      className="bg-primary-background text-primary-text w-full"
    >
      {/* SVG Background - Preserving your SVGs for both mobile and desktop */}
      <div className="flex justify-between w-full">
        <AdminLink href="/">
          <img src="/footer-cutout.svg" alt="" className="w-240 h-240" />
        </AdminLink>
        <AdminLink href="/">
          <img
            src="/footer-cutout.svg"
            alt=""
            className="rotate-90 float-right w-200 h-200"
          />
        </AdminLink>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-row md:justify-between md:space-x-8 mt-10">
          {/* Logo Column */}
          <div className="mb-8 md:mb-0">
            <AdminLink href="/">
              <img
                src={logoUrl}
                alt="Steel Buckle"
                className="w-19 h-19"
                key={`footer-desktop-logo-${logoVariant}-${
                  colorScheme?.id || "default"
                }`}
              />
            </AdminLink>
          </div>

          {/* Contact Column */}
          <div className="mb-8 md:mb-0">
            <h3 className="font-bold text-lg mb-2">{t("footer.contact")}</h3>
            <div className="space-y-1">
              {isClient && !isLoading && mainPhone && (
                <p className="text-sm">
                  {t("footer.general_phone")} {mainPhone.number}
                </p>
              )}
              {isClient &&
                !isLoading &&
                contactInfo.phones &&
                contactInfo.phones.length > 0 && (
                  <>
                    {contactInfo.phones.map((phone, index) => {
                      // Skip the main phone as it's already shown above
                      if (
                        phone === mainPhone ||
                        phone.label?.toLowerCase() === "üldtelefon" ||
                        phone.label?.toLowerCase() === "main" ||
                        phone.label?.toLowerCase() === "üld"
                      ) {
                        return null;
                      }

                      return (
                        <p key={phone.id || index} className="text-sm">
                          {phone.label} {phone.number}
                        </p>
                      );
                    })}
                  </>
                )}
              {isClient && !isLoading && contactInfo.email && (
                <p className="text-sm">{contactInfo.email}</p>
              )}
            </div>
          </div>

          {/* Office Column */}
          <div className="mb-8 md:mb-0">
            <h3 className="font-bold text-lg mb-2">{t("footer.office")}</h3>
            <div className="space-y-1">
              {isClient && !isLoading && contactInfo.office && (
                <>
                  <p className="text-sm">{contactInfo.office.city}</p>
                  <p className="text-sm">{contactInfo.office.postal}</p>
                  <p className="text-sm">{contactInfo.office.street}</p>
                  <p className="text-sm">{contactInfo.office.room}</p>
                </>
              )}
            </div>
          </div>

          {/* Services Column */}
          <div className="mb-8 md:mb-0">
            <div className="space-y-2">
              <AdminLink
                href="/teenused/raudteede-jooksev-korrashoid"
                className="block font-bold text-lg"
              >
                {t("footer.services")}
              </AdminLink>
              <AdminLink
                href="/tehtud-tood"
                className="block font-bold text-lg"
              >
                {t("nav.completed_works")}
              </AdminLink>
              <AdminLink
                href="/ettevottest"
                className="block font-bold text-lg"
              >
                {t("nav.about")}
              </AdminLink>
              <AdminLink href="/kontakt" className="block font-bold text-lg">
                {t("nav.contact")}
              </AdminLink>
            </div>
          </div>

          {/* Scroll to Top Button and Logo - Modified layout */}
          <div className="flex flex-col items-end">
            {/* Scroll to top button on top */}
            <button
              onClick={() =>
                isClient && window.scrollTo({ top: 0, behavior: "smooth" })
              }
              className="w-10 h-10 bg-primary-text rounded-full flex items-center justify-center mb-4"
              aria-label="Scroll to top"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 14L12 9L17 14"
                  stroke="#C0C0C0"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Logo */}
          <div className="mb-6 pt-10">
            <AdminLink href="/">
              <img
                src={logoUrl}
                alt="Steel Buckle"
                className="w-14 h-14"
                key={`footer-mobile-logo-${logoVariant}-${
                  colorScheme?.id || "default"
                }`}
              />
            </AdminLink>
          </div>

          {/* Contact and Kontor side by side on mobile - Added gap */}
          <div className="flex flex-row justify-between gap-4 mb-8">
            {/* Contact Column */}
            <div className="flex-8">
              <h3 className="font-bold text-lg mb-2">{t("footer.contact")}</h3>
              <div className="space-y-1">
                {isClient && !isLoading && mainPhone && (
                  <p className="text-sm">
                    {t("footer.general_phone")} {mainPhone.number}
                  </p>
                )}
                {isClient &&
                  !isLoading &&
                  contactInfo.phones &&
                  contactInfo.phones.length > 0 && (
                    <>
                      {contactInfo.phones.map((phone, index) => {
                        // Skip the main phone as it's already shown above
                        if (
                          phone === mainPhone ||
                          phone.label?.toLowerCase() === "üldtelefon" ||
                          phone.label?.toLowerCase() === "main" ||
                          phone.label?.toLowerCase() === "üld"
                        ) {
                          return null;
                        }

                        return (
                          <p key={phone.id || index} className="text-sm">
                            {phone.label} {phone.number}
                          </p>
                        );
                      })}
                    </>
                  )}
                {isClient && !isLoading && contactInfo.email && (
                  <p className="text-sm">{contactInfo.email}</p>
                )}
              </div>
            </div>

            {/* Office Column */}
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">{t("footer.office")}</h3>
              <div className="space-y-1">
                {isClient && !isLoading && contactInfo.office && (
                  <>
                    <p className="text-sm">{contactInfo.office.city}</p>
                    <p className="text-sm">{contactInfo.office.postal}</p>
                    <p className="text-sm">{contactInfo.office.street}</p>
                    <p className="text-sm">{contactInfo.office.room}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Services and navigation */}
          <div className="mb-6">
            <div className="space-y-3 mb-4">
              <AdminLink
                href="/teenused/raudteede-jooksev-korrashoid"
                className="block font-bold text-lg"
              >
                {t("footer.services")}
              </AdminLink>
              <AdminLink
                href="/tehtud-tood"
                className="block font-bold text-lg"
              >
                {t("nav.completed_works")}
              </AdminLink>
              <AdminLink
                href="/ettevottest"
                className="block font-bold text-lg"
              >
                {t("nav.about")}
              </AdminLink>
              <AdminLink href="/kontakt" className="block font-bold text-lg">
                {t("nav.contact")}
              </AdminLink>
            </div>
          </div>

          {/* Logo and scroll button in a better aligned container */}
          <div className="flex flex-row items-center justify-between mt-10 mb-6">
            {/* Logo aligned on the left */}
            {isClient && showKodaLogo && (
              <a href="https://www.koda.ee">
                <img
                  src={getKodaLogo()}
                  alt="Kaubanduskoja liikmelogo"
                  className="w-56"
                  onError={handleKodaLogoError}
                  onLoad={handleKodaLogoLoad}
                  key={`koda-mobile-logo-${kodaLogoVariant}-${currentLanguage}-${
                    colorScheme?.id || "default"
                  }`}
                />
              </a>
            )}

            {/* Scroll to Top Button aligned on the right */}
            <button
              onClick={() =>
                isClient && window.scrollTo({ top: 0, behavior: "smooth" })
              }
              className="w-10 h-10 bg-primary-text rounded-full flex items-center justify-center"
              aria-label="Scroll to top"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 14L12 9L17 14"
                  stroke="#C0C0C0"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 flex flex-row justify-between items-center">
          <p className="text-xs">
            © {new Date().getFullYear()} Steel Buckle OÜ
          </p>
          {/* Logo appears only on desktop, aligned with copyright and right-aligned */}
          {isClient && showKodaLogo && (
            <a href="https://www.koda.ee" className="hidden md:block">
              <img
                src={getKodaLogo()}
                alt="Kaubanduskoja liikmelogo"
                className="w-56"
                onError={handleKodaLogoError}
                onLoad={handleKodaLogoLoad}
                key={`koda-desktop-logo-${kodaLogoVariant}-${currentLanguage}-${
                  colorScheme?.id || "default"
                }`}
              />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
