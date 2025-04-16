"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LanguageSelector from "./LanguageSelector";
import { useTranslation } from "@/hooks/useTranslation";
import { useContactInfo } from "@/hooks/useContactInfo";
import { buildLocalizedUrl } from "@/config/routeTranslations";
import { SupportedLanguage } from "@/config/routeTranslations";

interface ColorSchemeEventDetail {
  logoVariant: "dark" | "white";
  lineVariant: "dark" | "white";
}

const Navbar = () => {
  const router = useRouter();
  const { t, currentLang } = useTranslation();
  const [isTeenusedOpen, setIsTeenusedOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { contactInfo, isLoading, getMainPhone } = useContactInfo();
  const [isClient, setIsClient] = useState(false);

  // State for logo variant
  const [logoVariant, setLogoVariant] = useState<"dark" | "white">("dark");

  // Get the main phone number
  const mainPhone = getMainPhone();

  // Dynamic logo URL based on logoVariant
  const logoUrl = `/logo_${logoVariant}.svg`;

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load logo variant from localStorage on component mount
  useEffect(() => {
    if (!isClient) return;

    const loadLogoVariant = () => {
      const savedLogoVariant = localStorage.getItem("site.logoVariant");
      if (savedLogoVariant === "dark" || savedLogoVariant === "white") {
        setLogoVariant(savedLogoVariant);
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
  }, [isClient]);

  const toggleTeenused = () => {
    setIsTeenusedOpen(!isTeenusedOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Function to close all menus
  const closeAllMenus = () => {
    setMobileMenuOpen(false);
    setIsTeenusedOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isClient) return;

    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Element;
      if (isTeenusedOpen && target && !target.closest(".teenused-dropdown")) {
        setIsTeenusedOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTeenusedOpen, isClient]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (!isClient) return;

    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileMenuOpen, isClient]);

  // Function to handle navigation in edit mode
  const handleAdminNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    path: string
  ) => {
    if (!isClient) return;

    // Check for admin edit mode using URL or other method if needed
    const isAdminMode = window.location.pathname.includes("/admin");

    if (isAdminMode) {
      e.preventDefault();

      // Extract the page identifier from the path
      let pageId = "";

      if (path === "/" || path.endsWith("/")) {
        pageId = "home";
      } else if (
        path.includes("/ettevottest") ||
        path.includes("/about") ||
        path.includes("/o-nas") ||
        path.includes("/par-mums")
      ) {
        pageId = "about";
      } else if (
        path.includes("/tehtud-tood") ||
        path.includes("/projects") ||
        path.includes("/proekty") ||
        path.includes("/projekti")
      ) {
        pageId = "projects";
      } else if (
        path.includes("/kontakt") ||
        path.includes("/contact") ||
        path.includes("/kontakty") ||
        path.includes("/kontakti")
      ) {
        pageId = "contact";
      } else if (
        path.includes("/teenused/") ||
        path.includes("/services/") ||
        path.includes("/uslugi/") ||
        path.includes("/pakalpojumi/")
      ) {
        // Handle service subpages
        if (
          path.includes("raudteede-jooksev-korrashoid") ||
          path.includes("railway-maintenance") ||
          path.includes("obsluzhivanie-zheleznykh-dorog") ||
          path.includes("dzelzcela-apkope")
        ) {
          pageId = "railway-maintenance";
        } else if (
          path.includes("remont-ja-renoveerimine") ||
          path.includes("repair-renovation") ||
          path.includes("remont-i-renovatsiya") ||
          path.includes("remonts-un-renovacija")
        ) {
          pageId = "railway-repair";
        } else if (
          path.includes("raudtee-ehitus") ||
          path.includes("railway-construction") ||
          path.includes("stroitelstvo-zheleznykh-dorog") ||
          path.includes("dzelzcela-buvnieciba")
        ) {
          pageId = "railway-infrastructure";
        } else if (
          path.includes("projekteerimine") ||
          path.includes("design") ||
          path.includes("proektirovanie") ||
          path.includes("projektesana")
        ) {
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
    // Get the localized URL if needed (skip admin URLs)
    const localizedHref = href.includes("/admin")
      ? href
      : getLocalizedUrl(href);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (isClient) {
        const isAdminMode = window.location.pathname.includes("/admin");
        if (isAdminMode) {
          handleAdminNavigation(e, href);
        }
      }
      if (onClick) onClick(e);
    };

    return (
      <Link href={localizedHref} className={className} onClick={handleClick}>
        {children}
      </Link>
    );
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
    return buildLocalizedUrl(routeKey as any, currentLang as SupportedLanguage);
  };

  return (
    <div className="w-full bg-primary-background relative z-30">
      {/* Mobile Menu */}
      <div className="md:hidden">
        <div className="flex justify-between items-center px-4 py-4">
          {/* Logo */}
          <AdminLink href="/">
            <img
              src={logoUrl}
              alt="Steel Buckle"
              className="w-12 h-12"
              key={`mobile-logo-${logoVariant}`}
            />
          </AdminLink>

          {/* Hamburger Icon */}
          <button
            onClick={toggleMobileMenu}
            className="focus:outline-none"
            aria-label="Toggle menu"
          >
            {!mobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-text"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-text"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className={`fixed inset-0 bg-primary-background z-50 flex flex-col px-6 py-4 ${
              isClient && window.location.pathname.includes("/admin")
                ? "pt-20"
                : ""
            }`}
          >
            <div className="flex justify-between items-center">
              {/* Logo */}
              <AdminLink href="/" onClick={closeAllMenus}>
                <img
                  src={logoUrl}
                  alt="Steel Buckle"
                  className="w-12 h-12"
                  key={`mobile-menu-logo-${logoVariant}`}
                />
              </AdminLink>

              {/* Language Selector and Close Button */}
              <div className="flex items-center space-x-4">
                <LanguageSelector />
                <button
                  onClick={toggleMobileMenu}
                  className="focus:outline-none"
                  aria-label="Close menu"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary-text"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Menu Items */}
            <div className="flex-1 flex flex-col mt-8">
              <div className="mb-1">
                <button
                  onClick={toggleTeenused}
                  className="w-full py-3 text-left font-medium text-primary-text flex items-center justify-between"
                >
                  <span className="font-bold text-lg">{t("nav.services")}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 ml-1 transition-transform ${
                      isTeenusedOpen ? "transform rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isTeenusedOpen && (
                  <div className="bg-white mt-2 p-4 teenused-dropdown">
                    <ul>
                      <li className="py-2 text-gray-600 font-bold">
                        <AdminLink
                          href="/teenused/raudteede-jooksev-korrashoid"
                          onClick={(e) => {
                            closeAllMenus();
                            if (isClient) {
                              const isAdminMode =
                                window.location.pathname.includes("/admin");
                              if (isAdminMode) {
                                e.preventDefault();
                                router.push(
                                  "/admin/pages/edit/railway-maintenance"
                                );
                              }
                            }
                          }}
                        >
                          {t("services.railway_maintenance")}
                        </AdminLink>
                      </li>
                      <li className="py-2 text-gray-600 font-bold">
                        <AdminLink
                          href="/teenused/remont-ja-renoveerimine"
                          onClick={(e) => {
                            closeAllMenus();
                            if (isClient) {
                              const isAdminMode =
                                window.location.pathname.includes("/admin");
                              if (isAdminMode) {
                                e.preventDefault();
                                router.push("/admin/pages/edit/railway-repair");
                              }
                            }
                          }}
                        >
                          {t("services.repair_renovation")}
                        </AdminLink>
                      </li>
                      <li className="py-2 text-gray-600 font-bold">
                        <AdminLink
                          href="/teenused/raudtee-ehitus"
                          onClick={(e) => {
                            closeAllMenus();
                            if (isClient) {
                              const isAdminMode =
                                window.location.pathname.includes("/admin");
                              if (isAdminMode) {
                                e.preventDefault();
                                router.push(
                                  "/admin/pages/edit/railway-infrastructure"
                                );
                              }
                            }
                          }}
                        >
                          {t("services.railway_construction")}
                        </AdminLink>
                      </li>
                      <li className="py-2 text-gray-600 font-bold">
                        <AdminLink
                          href="/teenused/projekteerimine"
                          onClick={(e) => {
                            closeAllMenus();
                            if (isClient) {
                              const isAdminMode =
                                window.location.pathname.includes("/admin");
                              if (isAdminMode) {
                                e.preventDefault();
                                router.push("/admin/pages/edit/railway-design");
                              }
                            }
                          }}
                        >
                          {t("services.design")}
                        </AdminLink>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <AdminLink
                href="/tehtud-tood"
                onClick={closeAllMenus}
                className="py-3 block font-bold text-lg text-primary-text"
              >
                {t("nav.completed_works")}
              </AdminLink>

              <AdminLink
                href="/ettevottest"
                onClick={closeAllMenus}
                className="py-3 block font-bold text-lg text-primary-text"
              >
                {t("nav.about")}
              </AdminLink>

              <AdminLink
                href="/kontakt"
                onClick={closeAllMenus}
                className="py-3 block font-bold text-lg text-primary-text"
              >
                {t("nav.contact")}
              </AdminLink>

              {/* Mobile Contact Info */}
              <div className="mt-10 border-t border-primary-border pt-4">
                {!isLoading && mainPhone && (
                  <a
                    href={`tel:${mainPhone.number.replace(/\s+/g, "")}`}
                    className="py-3 block text-primary-text text-center font-bold text-lg mt-5"
                  >
                    {mainPhone.number}
                  </a>
                )}
                {!isLoading && contactInfo.email && (
                  <a
                    href={getLocalizedUrl("/kontakt")}
                    className="mt-2 border border-primary-border rounded-full py-3 px-4 text-center font-bold text-primary-text block"
                  >
                    {contactInfo.email}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop/Tablet Menu */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Top section with logo and contact */}
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <AdminLink href="/">
                <img
                  src={logoUrl}
                  alt="Steel Buckle"
                  className="w-19 h-19"
                  key={`desktop-logo-${logoVariant}`}
                />
              </AdminLink>
            </div>

            {/* Contact info */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex md:items-center">
                {!isLoading && mainPhone && (
                  <a
                    href={`tel:${mainPhone.number.replace(/\s+/g, "")}`}
                    className="text-primary-text"
                  >
                    {mainPhone.number}
                  </a>
                )}
              </div>
              <div className="hidden md:flex md:items-center">
                <a
                  href={getLocalizedUrl("/kontakt")}
                  className="border border-primary-border rounded-full px-4 py-2 text-primary-text flex items-center"
                >
                  {!isLoading ? contactInfo.email : "Laen..."}
                </a>
              </div>

              {/* Desktop Language Selector */}
              <LanguageSelector />
            </div>
          </div>

          {/* Navigation links */}
          <nav className="max-w-7xl w-full flex items-center pt-10 mb-10 relative">
            <div className="w-full pt-10 mb-10">
              <div className="w-full flex justify-between px-0">
                {/* Teenused dropdown */}
                <div className="group">
                  <div className="relative h-[1px] bg-primary-accent mb-4">
                    <div className="absolute top-0 left-0 h-[2px] bg-primary-text w-0 group-hover:w-full transition-all duration-300 ease-in-out"></div>
                  </div>
                  <div className="relative teenused-dropdown">
                    <button className="py-2 flex text-primary-text items-center group-hover:font-bold transition-all duration-300">
                      <span className="text-primary-text">
                        {t("nav.services")}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 ml-1 transition-transform`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {/* Dropdown menu - shows on hover */}
                    <div className="absolute left-0 bg-white mt-3 py-10 px-5 w-96 z-40 text-gray-500 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <h3 className="text-xl font-medium mb-4 px-4 text-black">
                        {t("nav.services")}
                      </h3>
                      <ul>
                        <li className="hover:bg-gray-100">
                          <AdminLink
                            href="/teenused/raudteede-jooksev-korrashoid"
                            className="block py-2 px-4"
                          >
                            {t("services.railway_maintenance")}
                          </AdminLink>
                        </li>
                        <li className="hover:bg-gray-100">
                          <AdminLink
                            href="/teenused/remont-ja-renoveerimine"
                            className="block py-2 px-4"
                          >
                            {t("services.repair_renovation")}
                          </AdminLink>
                        </li>
                        <li className="hover:bg-gray-100">
                          <AdminLink
                            href="/teenused/raudtee-ehitus"
                            className="block py-2 px-4"
                          >
                            {t("services.railway_construction")}
                          </AdminLink>
                        </li>
                        <li className="hover:bg-gray-100">
                          <AdminLink
                            href="/teenused/projekteerimine"
                            className="block py-2 px-4"
                          >
                            {t("services.design")}
                          </AdminLink>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Tehtud tööd */}
                <div className="group">
                  <div className="relative h-[1px] bg-primary-accent mb-4">
                    <div className="absolute top-0 left-0 h-[2px] bg-primary-text w-0 group-hover:w-full transition-all duration-300 ease-in-out"></div>
                  </div>
                  <AdminLink
                    href="/tehtud-tood"
                    className="py-2 block text-primary-text group-hover:font-bold transition-all duration-300"
                  >
                    {t("nav.completed_works")}
                  </AdminLink>
                </div>

                {/* Ettevõttest */}
                <div className="group">
                  <div className="relative h-[1px] bg-primary-accent mb-4">
                    <div className="absolute top-0 left-0 h-[2px] bg-primary-text w-0 group-hover:w-full transition-all duration-300 ease-in-out"></div>
                  </div>
                  <AdminLink
                    href="/ettevottest"
                    className="py-2 block text-primary-text group-hover:font-bold transition-all duration-300"
                  >
                    {t("nav.about")}
                  </AdminLink>
                </div>

                {/* Kontakt */}
                <div className="group">
                  <div className="relative h-[1px] bg-primary-accent mb-4">
                    <div className="absolute top-0 left-0 h-[2px] bg-primary-text w-0 group-hover:w-full transition-all duration-300 ease-in-out"></div>
                  </div>
                  <AdminLink
                    href="/kontakt"
                    className="py-2 block text-primary-text group-hover:font-bold transition-all duration-300"
                  >
                    {t("nav.contact")}
                  </AdminLink>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
