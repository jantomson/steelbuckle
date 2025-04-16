"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ContactContent from "@/components/ContactContent";
import { useTranslation } from "@/hooks/useTranslation";
import SubpageHeader from "@/components/SubpageHeader";
import SEOMetadata from "@/components/SEOMetadata";
import { useEffect } from "react";

export default function Contact() {
  const { t } = useTranslation();

  // Add this useEffect to ensure the page fills the viewport
  useEffect(() => {
    const ensureMinHeight = () => {
      const viewportHeight = window.innerHeight;
      const content = document.querySelector(".content-wrapper");
      if (!content) return;

      // Get the footer height
      const footer = document.getElementById("main-footer");
      const footerHeight = footer ? footer.offsetHeight : 0;

      // Get the navbar height
      const navbar = document.querySelector("nav");
      const navbarHeight = navbar ? navbar.offsetHeight : 0;

      // Calculate minimum content height to fill viewport
      const minContentHeight = viewportHeight - (navbarHeight + footerHeight);

      // Apply minimum height to content wrapper
      content.setAttribute("style", `min-height: ${minContentHeight}px`);
    };

    // Execute on load and resize
    ensureMinHeight();
    window.addEventListener("resize", ensureMinHeight);
    window.addEventListener("load", ensureMinHeight);

    return () => {
      window.removeEventListener("resize", ensureMinHeight);
      window.removeEventListener("load", ensureMinHeight);
    };
  }, []);

  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      {/* Add SEO Metadata */}
      <SEOMetadata pageKey="contact" />

      <Navbar />
      {/* Add content-wrapper class to this div for height adjustment */}
      <div className="w-full bg-white text-black content-wrapper">
        {/* Themed subpage header section */}
        <SubpageHeader titleKey="contact.title" />

        {/* Use the ContactContent component */}
        <ContactContent />
      </div>
      <Footer />
    </div>
  );
}
