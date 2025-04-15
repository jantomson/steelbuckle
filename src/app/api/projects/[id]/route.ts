// app/api/projects/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params is awaited before accessing properties
    const resolvedParams = await params;
    const projectId = resolvedParams.id;

    // Fetch project data with translations
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        translations: {
          where: { languageCode: "est" }, // Default to Estonian for editing
          take: 1,
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Format response
    const formattedProject = {
      id: project.id,
      title: project.translations[0]?.title || "",
      year: project.year,
      image: project.image,
    };

    return NextResponse.json(formattedProject);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params is awaited before accessing properties
    const resolvedParams = await params;
    const projectId = resolvedParams.id;

    const formData = await request.formData();

    const title = formData.get("title") as string;
    const year = formData.get("year") as string;
    const languageCode = (formData.get("language") as string) || "est"; // Default to Estonian

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Handle image update
    const image = formData.get("image") as File;
    let imagePath = existingProject.image; // Keep existing image by default

    if (image && image.size > 0) {
      // Generate unique filename with timestamp
      const filename = `${Date.now()}_${image.name.replace(/\s+/g, "_")}`;
      imagePath = `/${filename}`; // Path relative to public folder

      // Get file buffer
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Save file to public directory
      const { writeFile } = await import("fs/promises");
      const { join } = await import("path");
      const publicPath = join(process.cwd(), "public", filename);
      await writeFile(publicPath, buffer);
    } else if (formData.get("imageUrl")) {
      imagePath = formData.get("imageUrl") as string;
    }

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        year,
        image: imagePath,
      },
    });

    // Update the default translation
    await prisma.projectTranslation.upsert({
      where: {
        projectId_languageCode: {
          projectId,
          languageCode,
        },
      },
      update: {
        title,
      },
      create: {
        projectId,
        languageCode,
        title,
      },
    });

    // Return the updated project
    return NextResponse.json({
      id: updatedProject.id,
      title,
      year: updatedProject.year,
      image: updatedProject.image,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure params is awaited before accessing properties
    const resolvedParams = await params;
    const projectId = resolvedParams.id;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Delete project (will cascade delete translations due to onDelete: Cascade in schema)
    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
