"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { EditProvider } from "@/contexts/EditContext";
import { useEdit } from "@/contexts/EditContext";
import { invalidateTranslationsCache } from "@/hooks/useTranslation";

// Import components lazily to improve performance
import dynamic from "next/dynamic";

// Always load Navbar synchronously since it's critical for UI
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Lazy load the admin components
const Hero = dynamic(() => import("@/components/admin/AdminHero"), {
  ssr: false,
});
const About = dynamic(() => import("@/components/admin/AdminAbout"), {
  ssr: false,
});
const Services = dynamic(() => import("@/components/admin/AdminServices"), {
  ssr: false,
});
const Projects = dynamic(() => import("@/components/admin/AdminProjects"), {
  ssr: false,
});
const Benefits = dynamic(() => import("@/components/admin/AdminBenefits"), {
  ssr: false,
});
const ServicesSlider = dynamic(
  () => import("@/components/admin/AdminServicesSlider"),
  { ssr: false }
);
const CTA = dynamic(() => import("@/components/admin/AdminCTA"), {
  ssr: false,
});

// Lazy load the admin edit components
const AdminEditContact = dynamic(
  () => import("@/components/admin/AdminEditContact"),
  { ssr: false }
);
const AdminEditAbout = dynamic(
  () => import("@/components/admin/AdminEditAbout"),
  { ssr: false }
);
const AdminEditProjects = dynamic(
  () => import("@/components/admin/AdminEditProjects"),
  { ssr: false }
);

// Lazy load the railway admin edit components
const AdminEditRailwayRepair = dynamic(
  () => import("@/components/admin/AdminEditRailwayRepair"),
  { ssr: false }
);
const AdminEditRailwayDesign = dynamic(
  () => import("@/components/admin/AdminEditRailwayDesign"),
  { ssr: false }
);
const AdminEditRailwayMaintenance = dynamic(
  () => import("@/components/admin/AdminEditRailwayMaintenance"),
  { ssr: false }
);
const AdminEditRailwayInfrastructure = dynamic(
  () => import("@/components/admin/AdminEditRailwayInfrastructure"),
  { ssr: false }
);

// Load AdminColorScheme component
const AdminColorScheme = dynamic(
  () => import("@/components/admin/AdminColorScheme"),
  { ssr: false }
);

// Admin Toolbar component - split out for better code organization
const AdminToolbar = React.memo(
  ({
    pageTitle,
    isSaving,
    saveSuccess,
    handleSaveAll,
    pageId,
    showColorPicker,
    toggleColorPicker,
  }: {
    pageTitle: string;
    isSaving: boolean;
    saveSuccess: boolean;
    handleSaveAll: () => void;
    pageId?: string;
    showColorPicker: boolean;
    toggleColorPicker: () => void;
  }) => {
    // Function to force page reload
    const handleForceRefresh = useCallback(() => {
      window.location.reload();
    }, []);

    return (
      <>
        {/* Fixed Toolbar */}
        <div className="fixed top-0 left-0 right-0 bg-green-800 text-white z-50 py-2 px-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/pages"
              className="text-white hover:text-blue-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-medium truncate max-w-xs">Tagasi</h1>
          </div>

          <div className="flex items-center space-x-3">
            {/* Color Scheme Button */}
            <button
              onClick={toggleColorPicker}
              className="px-3 py-1.5 border border-white/30 rounded text-sm font-medium hover:bg-white/10 flex items-center"
              title="Change color scheme"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1.5"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              {showColorPicker ? "Peida värviskeemid" : "Muuda värve"}
            </button>

            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className={`px-4 py-1.5 rounded text-sm font-medium flex items-center ${
                isSaving ? "bg-green-600" : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Salvestan...
                </>
              ) : (
                <>
                  <svg
                    className="mr-1.5"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Salvesta
                </>
              )}
            </button>

            <Link
              href="/admin/pages"
              className="px-4 py-1.5 border border-white/30 rounded text-sm font-medium hover:bg-white/10"
            >
              Välju
            </Link>
          </div>
        </div>

        {/* Success message with refresh button */}
        {saveSuccess && (
          <div className="fixed top-16 right-4 mt-2 p-3 bg-green-100 text-green-800 rounded shadow-lg z-50 flex items-center justify-between w-96 animate-fade-in-out">
            <div className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Muudatused salvestatud edukalt!</span>
            </div>

            <button
              onClick={handleForceRefresh}
              className="ml-2 px-2 py-1 bg-green-700 text-white text-xs rounded hover:bg-green-800 transition-colors flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              Värskenda
            </button>
          </div>
        )}

        {/* Color scheme panel */}
        {showColorPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
              {/* Close button */}
              <button
                onClick={toggleColorPicker}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Actual color scheme content */}
              <AdminColorScheme />
            </div>
          </div>
        )}
      </>
    );
  }
);

// Define the page component
export default function EditablePage() {
  const router = useRouter();
  const params = useParams();
  const pageId = typeof params.pageId === "string" ? params.pageId : "home";

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Add this useEffect alongside your other hooks
  useEffect(() => {
    // Check if we're on a language-prefixed admin route and redirect if needed
    const pathname = window.location.pathname;
    const languagePrefixedAdminPattern = /^\/(en|lv|ru|et)(\/admin\/.*)$/;
    const match = pathname.match(languagePrefixedAdminPattern);

    if (match && match[2]) {
      // Get just the admin part
      const adminPath = match[2];
      console.log(
        `Detected language-prefixed admin path, redirecting to ${adminPath}`
      );

      // Redirect to the admin path without the language prefix
      window.location.href = adminPath;
    }
  }, []);

  // Toggle color picker
  const toggleColorPicker = useCallback(() => {
    setShowColorPicker((prev) => !prev);
  }, []);

  // Get page title for display - memoized to prevent recalculation
  const pageTitle = useMemo(() => {
    switch (pageId) {
      case "home":
        return "Avaleht";
      case "about":
        return "Ettevõttest";
      case "projects":
        return "Tehtud tööd";
      case "contact":
        return "Kontakt";
      case "railway-repair":
        return "Raudteede remont ja renoveerimine";
      case "railway-design":
        return "Raudteede projekteerimine";
      case "railway-maintenance":
        return "Raudteede jooksev korrashoid";
      case "railway-infrastructure":
        return "Raudtee infrastruktuuri ehitus";
      default:
        return "Page Editor";
    }
  }, [pageId]);

  // Apply CSS variables on first page load
  useEffect(() => {
    // Apply saved color scheme if available
    const applyStoredColorScheme = () => {
      const root = document.documentElement;
      const colorSchemeId =
        localStorage.getItem("site.colorScheme") || "default";

      // Default colors (yellow & black)
      let background = "#fde047";
      let text = "#000000";
      let border = "#000000";
      let line = "#000000";
      let accent = "#6b7280";

      // Override with saved values if they exist
      if (colorSchemeId === "blue") {
        background = "#000957";
        text = "#ffffff";
        accent = "#577BC1";
        border = "#ffffff";
        line = "#ffffff";
      } else if (colorSchemeId === "green") {
        background = "#C5FF95";
        text = "#16423C";
        accent = "#5CB338";
        border = "#16423C";
        line = "#16423C";
      }

      // Set CSS variables
      root.style.setProperty("--primary-background", background);
      root.style.setProperty("--primary-text", text);
      root.style.setProperty("--primary-border", border);
      root.style.setProperty("--primary-line", line);
      root.style.setProperty("--primary-accent", accent);
    };

    applyStoredColorScheme();
  }, []);

  // Save all changes - memoized callback to prevent recreation
  const handleSaveAll = useCallback(async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // The actual save logic is now inside EditContext
      // but we access it via the window global that AdminContentSaver creates
      if ((window as any).__adminSaveChanges) {
        await (window as any).__adminSaveChanges();
      }
    } catch (error) {
      console.error("Error saving page content:", error);
    }
  }, []);

  // Render only the components needed for the selected pageId
  const renderPageContent = useCallback(() => {
    switch (pageId) {
      case "home":
        return <HomePageComponents />;
      case "about":
        return (
          <div className="w-full bg-white text-black">
            <AdminEditAbout />
          </div>
        );
      case "projects":
        return (
          <div className="w-full bg-white text-black">
            <AdminEditProjects />
          </div>
        );
      case "contact":
        return (
          <div className="w-full bg-white text-black">
            <AdminEditContact />
          </div>
        );
      case "railway-repair":
        return (
          <div className="w-full bg-white text-black">
            <AdminEditRailwayRepair />
          </div>
        );
      case "railway-design":
        return (
          <div className="w-full bg-white text-black">
            <AdminEditRailwayDesign />
          </div>
        );
      case "railway-maintenance":
        return (
          <div className="w-full bg-white text-black">
            <AdminEditRailwayMaintenance />
          </div>
        );
      case "railway-infrastructure":
        return (
          <div className="w-full bg-white text-black">
            <AdminEditRailwayInfrastructure />
          </div>
        );
      default:
        return null;
    }
  }, [pageId]);

  // Set additional top padding when color picker is open
  const contentPaddingTop = showColorPicker
    ? "pt-60 md:pt-60"
    : "pt-20 md:pt-20";

  return (
    <EditProvider pageId={pageId} isAdminMode={true}>
      <div className="min-h-screen">
        {/* This component sets up the saveChanges functionality */}
        <AdminContentSaver
          setIsSaving={setIsSaving}
          setSaveSuccess={setSaveSuccess}
        />

        {/* Admin Toolbar */}
        <AdminToolbar
          pageTitle={pageTitle}
          isSaving={isSaving}
          saveSuccess={saveSuccess}
          handleSaveAll={handleSaveAll}
          showColorPicker={showColorPicker}
          toggleColorPicker={toggleColorPicker}
        />

        {/* Content with spacing for the fixed toolbar and color picker if open */}
        <div
          className={`${contentPaddingTop} bg-primary-background transition-all duration-300`}
        >
          <div className="font-[family-name:var(--font-geist-sans)]">
            <div className="mx-auto">
              <Navbar />

              {/* Render only the content needed for this page */}
              {renderPageContent()}

              <Footer />
            </div>
          </div>
        </div>

        {/* Add some global styles for editable content */}
        <style jsx global>{`
          .editable-content {
            cursor: pointer;
            position: relative;
            transition: all 0.2s ease;
          }
          .editable-content:hover {
            background-color: rgba(16, 185, 129, 0.1);
            box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.5);
            border-radius: 2px;
          }
          .editable-content::after {
            content: "✎";
            position: absolute;
            top: -8px;
            right: -8px;
            font-size: 12px;
            background-color: rgba(16, 185, 129, 0.8);
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.2s ease;
          }
          .editable-content:hover::after {
            opacity: 1;
          }
          /* Add animation for success message */
          @keyframes fadeInOut {
            0% {
              opacity: 0;
              transform: translateY(-20px);
            }
            10% {
              opacity: 1;
              transform: translateY(0);
            }
            90% {
              opacity: 1;
              transform: translateY(0);
            }
            100% {
              opacity: 0;
              transform: translateY(-20px);
            }
          }
          .animate-fade-in-out {
            animation: fadeInOut 3s ease-in-out;
          }
        `}</style>
      </div>
    </EditProvider>
  );
}

// Admin Content Saver component - Not changed
const AdminContentSaver = React.memo(
  ({
    setIsSaving,
    setSaveSuccess,
  }: {
    setIsSaving: (value: boolean) => void;
    setSaveSuccess: (value: boolean) => void;
  }) => {
    const { saveChanges } = useEdit();

    const handleSave = useCallback(async () => {
      setIsSaving(true);
      try {
        const success = await saveChanges();
        if (success) {
          setSaveSuccess(true);
          // Invalidate the translations cache to force a refresh
          invalidateTranslationsCache();
          setTimeout(() => setSaveSuccess(false), 3000);
        }
      } catch (error) {
        console.error("Error saving changes:", error);
      } finally {
        setIsSaving(false);
      }
    }, [saveChanges, setIsSaving, setSaveSuccess]);

    // Expose save function to window for global access
    useEffect(() => {
      (window as any).__adminSaveChanges = handleSave;

      return () => {
        delete (window as any).__adminSaveChanges;
      };
    }, [handleSave]);

    return null;
  }
);

// Home page components loaded only when pageId is "home"
const HomePageComponents = React.memo(() => {
  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Benefits />
      <ServicesSlider />
      <CTA />
    </>
  );
});
