"use client";

import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import About from "@/components/About";
import Services from "@/components/Services";
import Projects from "@/components/Projects";
import Benefits from "@/components/Benefits";
import ServicesSlider from "@/components/ServicesSlider";
import CTA from "@/components/CTA";
import { Libre_Baskerville } from "next/font/google";
import SEOMetadata from "@/components/SEOMetadata";

// Initialize the Libre Baskerville font
const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-libre",
});

export default function Home() {
  return (
    <>
      {/* Add SEO Metadata */}
      <SEOMetadata pageKey="home" />

      <div className="font-[family-name:var(--font-geist-sans)]">
        <div className="mx-auto">
          <Navbar />
          <Hero />
          <Services />
          <About />
          <Projects />
          <Benefits />
          <ServicesSlider />
          <CTA />
          <Footer />
        </div>
      </div>
    </>
  );
}
