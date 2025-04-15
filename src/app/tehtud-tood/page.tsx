"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProjectsGrid from "@/components/ProjectsGrid";
import { SubpageHeaderWithSubtitle } from "@/components/SubpageHeaderWithSubtitle";
import SEOMetadata from "@/components/SEOMetadata";

export default function Projects() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      {/* Add SEO Metadata */}
      <SEOMetadata pageKey="projects" />

      <Navbar />
      <SubpageHeaderWithSubtitle
        titleKey="projects_page.page_title"
        subtitleKey="projects_page.page_subtitle"
      />
      <ProjectsGrid />
      <Footer />
    </div>
  );
}
