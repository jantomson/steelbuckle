"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { useRouter } from "next/navigation";
import { useContactInfo } from "@/hooks/useContactInfo";

interface ColorSchemeEventDetail {
  logoVariant: "dark" | "white";
  lineVariant: "dark" | "white";
}

const Footer: React.FC = () => {
  const { t, currentLang: currentLanguage } = useTranslation();
  const router = useRouter();
  const { contactInfo, isLoading, getPhoneByLabel } = useContactInfo();

  // State for logo variant
  const [logoVariant, setLogoVariant] = useState<"dark" | "white">("dark");
  const [kodaLogoVariant, setKodaLogoVariant] = useState<"dark" | "white">(
    "dark"
  );

  // Dynamic logo URL based on logoVariant
  const logoUrl = `/logo_${logoVariant}.svg`;

  // Load logo variant from localStorage on component mount
  useEffect(() => {
    const loadLogoVariant = () => {
      const savedLogoVariant = localStorage.getItem("site.logoVariant");
      if (savedLogoVariant === "dark" || savedLogoVariant === "white") {
        setLogoVariant(savedLogoVariant);
        setKodaLogoVariant(savedLogoVariant); // also apply for Koda logo
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
      const customEvent = e as CustomEvent<ColorSchemeEventDetail>;
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
  }, []);

  // Get specific phones if available
  const mainPhone =
    getPhoneByLabel("Üldtelefon") ||
    getPhoneByLabel("main") ||
    getPhoneByLabel("üld") ||
    (contactInfo.phones.length > 0 ? contactInfo.phones[0] : undefined);

  const getKodaLogo = () => {
    const base = "Kaubanduskoda-liikmelogo";
    const variant = kodaLogoVariant === "dark" ? "dark" : "white"; // logo color on opposite background

    switch (currentLanguage) {
      case "en":
        return `/${base}_ENG_horiz_${variant}.png`;
      case "ru":
        return `/${base}_RUS_horiz_${variant}.png`;
      case "lv":
        return `/${base}_RUS_horiz_${variant}.png`;
      default:
        return `/${base}_EST_horiz_${variant}.png`;
    }
  };

  // Function to handle navigation in edit mode
  const handleAdminNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
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
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      const isAdminMode = window.location.pathname.includes("/admin");
      if (isAdminMode) {
        handleAdminNavigation(e, href);
      }
      if (onClick) onClick(e);
    };

    return (
      <Link href={href} className={className} onClick={handleClick}>
        {children}
      </Link>
    );
  };

  // Improved function to handle footer positioning
  useEffect(() => {
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
  }, []);

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
                key={`footer-desktop-logo-${logoVariant}`}
              />
            </AdminLink>
          </div>

          {/* Contact Column */}
          <div className="mb-8 md:mb-0">
            <h3 className="font-bold text-lg mb-2">{t("footer.contact")}</h3>
            <div className="space-y-1">
              {!isLoading && mainPhone && (
                <p className="text-sm">
                  {t("footer.general_phone")} {mainPhone.number}
                </p>
              )}
              {!isLoading &&
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
              {!isLoading && contactInfo.email && (
                <p className="text-sm">{contactInfo.email}</p>
              )}
            </div>
          </div>

          {/* Office Column */}
          <div className="mb-8 md:mb-0">
            <h3 className="font-bold text-lg mb-2">{t("footer.office")}</h3>
            <div className="space-y-1">
              {!isLoading && contactInfo.office && (
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
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-10 h-10 bg-black rounded-full flex items-center justify-center mb-4"
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
                  stroke="white"
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
                key={`footer-mobile-logo-${logoVariant}`}
              />
            </AdminLink>
          </div>

          {/* Contact and Kontor side by side on mobile */}
          <div className="flex flex-row justify-between mb-8">
            {/* Contact Column */}
            <div className="max-w-1/3">
              <h3 className="font-bold text-lg mb-2">{t("footer.contact")}</h3>
              <div className="space-y-1">
                {!isLoading && mainPhone && (
                  <p className="text-sm">
                    {t("footer.general_phone")} {mainPhone.number}
                  </p>
                )}
                {!isLoading &&
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
                {!isLoading && contactInfo.email && (
                  <p className="text-sm">{contactInfo.email}</p>
                )}
              </div>
            </div>

            {/* Office Column */}
            <div>
              <h3 className="font-bold text-lg mb-2">{t("footer.office")}</h3>
              <div className="space-y-1">
                {!isLoading && contactInfo.office && (
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
            <a href="https://www.koda.ee">
              <img
                src={getKodaLogo()}
                alt="Kaubanduskoja liikmelogo"
                className="w-56"
                key={`koda-mobile-logo-${kodaLogoVariant}`}
              />
            </a>

            {/* Scroll to Top Button aligned on the right */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-10 h-10 bg-black rounded-full flex items-center justify-center"
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
                  stroke="white"
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
          <a href="https://www.koda.ee" className="hidden md:block">
            <img
              src={getKodaLogo()}
              alt="Kaubanduskoja liikmelogo"
              className="w-56"
              key={`koda-desktop-logo-${kodaLogoVariant}`}
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
