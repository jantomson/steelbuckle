import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "et";

    console.log(`[Projects API] Fetching projects for language: ${lang}`);

    // Simple, efficient query with proper timeout
    const projects = (await Promise.race([
      prisma.project.findMany({
        include: {
          translations: {
            where: {
              languageCode: lang,
            },
            select: {
              title: true,
            },
          },
        },
        orderBy: {
          displayOrder: "asc",
        },
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database timeout")), 10000)
      ),
    ])) as any[];

    const formattedProjects = projects.map((project) => {
      const translation = project.translations[0];
      return {
        id: project.id,
        title: translation?.title || "",
        year: project.year,
        image: project.image,
        displayOrder: project.displayOrder,
      };
    });

    console.log(
      `[Projects API] Successfully fetched ${formattedProjects.length} projects`
    );

    // Enable proper caching - cache for 5 minutes
    return NextResponse.json(formattedProjects, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
        ETag: `"projects-${lang}-v1"`,
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
