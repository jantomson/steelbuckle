// app/api/projects/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Get language from query param or use 'est' as default
    const lang = searchParams.get("lang") || "est";

    // Fetch all projects with translations for the requested language
    const projects = await prisma.project.findMany({
      include: {
        translations: {
          where: {
            languageCode: lang,
          },
        },
      },
      orderBy: {
        displayOrder: "asc", // Order by displayOrder instead of createdAt
      },
    });

    // Map to the expected format
    const formattedProjects = projects.map((project) => {
      // Get the first translation (should be only one per language)
      const translation = project.translations[0];

      return {
        id: project.id,
        title: translation?.title || "", // Use translation or empty string
        year: project.year,
        image: project.image,
        displayOrder: project.displayOrder,
      };
    });

    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const year = formData.get("year") as string;
    const description = formData.get("description") as string;
    const languageCode = (formData.get("language") as string) || "est"; // Default to Estonian

    // Get the highest display order to add new items at the end
    const highestOrder = await prisma.project.findFirst({
      orderBy: {
        displayOrder: "desc",
      },
      select: {
        displayOrder: true,
      },
    });

    const displayOrder = highestOrder ? highestOrder.displayOrder + 1 : 0;

    // Handle image upload
    const image = formData.get("image") as File;
    let imagePath = "/images/placeholder.jpg"; // Default fallback

    if (image && image.size > 0) {
      // Generate unique filename with timestamp
      const filename = `${Date.now()}_${image.name.replace(/\s+/g, "_")}`;
      imagePath = `/${filename}`; // Path relative to public folder

      // Get file buffer
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Save file to public directory (this requires the fs module, which isn't available in edge functions)
      // In a real app, you'd use a storage service like AWS S3, Cloudinary, etc.
      const { writeFile } = await import("fs/promises");
      const { join } = await import("path");
      const publicPath = join(process.cwd(), "public", filename);
      await writeFile(publicPath, buffer);
    } else if (formData.get("imageUrl")) {
      imagePath = formData.get("imageUrl") as string;
    }

    // Create the project
    const project = await prisma.project.create({
      data: {
        image: imagePath,
        year,
        displayOrder,
      },
    });

    // Create the default translation
    await prisma.projectTranslation.create({
      data: {
        projectId: project.id,
        languageCode,
        title,
      },
    });

    // Return the created project
    return NextResponse.json(
      {
        id: project.id,
        title,
        year,
        image: imagePath,
        description,
        displayOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
