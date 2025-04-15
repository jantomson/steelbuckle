// app/sitemap.ts (for Next.js App Router)

import { PrismaClient } from "@prisma/client";
import { MetadataRoute } from "next";

const prisma = new PrismaClient();

// Define your application routes with their update frequency
const routes = [
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "about", changeFrequency: "monthly", priority: 0.8 },
  { path: "contact", changeFrequency: "monthly", priority: 0.8 },
  { path: "projects", changeFrequency: "weekly", priority: 0.9 },
  {
    path: "services/railway-maintenance",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "services/repair-renovation",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "services/railway-construction",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  { path: "services/design", changeFrequency: "monthly", priority: 0.8 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://steelbuckle.ee";

  // Get all supported languages
  const languages = await prisma.language.findMany({
    select: { code: true },
  });

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Current date for lastModified
  const lastModified = new Date();

  // Generate entries for each route in each language
  for (const route of routes) {
    // Default language (Estonian) is at the root
    sitemapEntries.push({
      url: `${baseUrl}/${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency as any,
      priority: route.priority,
    });

    // Other languages have their code in the URL
    for (const language of languages) {
      // Skip Estonian as it's handled above
      if (language.code === "est") continue;

      sitemapEntries.push({
        url: `${baseUrl}/${language.code}/${route.path}`,
        lastModified,
        changeFrequency: route.changeFrequency as any,
        priority: route.priority,
      });
    }
  }

  // Add projects pages if you have dynamic project pages
  try {
    const projects = await prisma.project.findMany({
      select: { id: true },
    });

    for (const project of projects) {
      // Default language (Estonian)
      sitemapEntries.push({
        url: `${baseUrl}/projects/${project.id}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.7,
      });

      // Other languages
      for (const language of languages) {
        if (language.code === "est") continue;

        sitemapEntries.push({
          url: `${baseUrl}/${language.code}/projects/${project.id}`,
          lastModified,
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  } catch (error) {
    console.error("Error fetching projects for sitemap:", error);
  }

  // Clean up Prisma connection
  await prisma.$disconnect();

  return sitemapEntries;
}
