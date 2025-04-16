// app/api/projects/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { extractPublicIdFromUrl } from "@/lib/cloudinaryUrl";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before accessing its properties
    const { id: projectId } = await params;

    // Fetch project data with translations
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        translations: {
          where: { languageCode: "et" }, // Default to Estonian for editing
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before accessing its properties
    const { id: projectId } = await params;

    const formData = await request.formData();

    const title = formData.get("title") as string;
    const year = formData.get("year") as string;
    const languageCode = (formData.get("language") as string) || "et"; // Default to Estonian

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
      // Check if existing image is from Cloudinary and delete it
      if (
        existingProject.image &&
        existingProject.image.includes("cloudinary.com")
      ) {
        const publicId = extractPublicIdFromUrl(existingProject.image);
        if (publicId) {
          try {
            await deleteFromCloudinary(publicId);
          } catch (cloudinaryError) {
            console.error(
              "Error deleting previous image from Cloudinary:",
              cloudinaryError
            );
            // Continue with upload even if deletion fails
          }
        }
      }

      // Upload new image to Cloudinary
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await uploadToCloudinary(buffer, {
        folder: "steel-buckle/projects",
        resourceType: "image",
      });

      imagePath = uploadResult.secure_url;

      // Save the image to the media library as well
      await prisma.media.create({
        data: {
          filename: image.name,
          path: imagePath,
          mediaType: image.type,
          altText: title || image.name.split(".")[0] || "Project Image",
        },
      });
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before accessing its properties
    const { id: projectId } = await params;

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // If using Cloudinary, delete the image from Cloudinary as well
    if (
      existingProject.image &&
      existingProject.image.includes("cloudinary.com")
    ) {
      const publicId = extractPublicIdFromUrl(existingProject.image);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (cloudinaryError) {
          console.error(
            "Error deleting image from Cloudinary:",
            cloudinaryError
          );
          // Continue with project deletion even if Cloudinary deletion fails
        }
      }
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
