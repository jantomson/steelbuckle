// app/api/media/delete/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const { id, publicId } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Media ID is required" },
        { status: 400 }
      );
    }

    // Find the media by ID
    const media = await prisma.media.findUnique({
      where: { id: Number(id) },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Extract Cloudinary public ID from URL if not provided
    let cloudinaryPublicId = publicId;
    if (!cloudinaryPublicId && media.path.includes("cloudinary.com")) {
      // Extract public ID from Cloudinary URL
      // Example URL: https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/public_id.jpg
      const urlParts = media.path.split("/");
      // Find the index after "upload" and take everything after that
      const uploadIndex = urlParts.indexOf("upload");
      if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
        // Skip the version part (v123456) and join the rest
        cloudinaryPublicId = urlParts.slice(uploadIndex + 2).join("/");
        // Remove file extension if present
        cloudinaryPublicId = cloudinaryPublicId.replace(/\.[^.]+$/, "");
      }
    }

    if (cloudinaryPublicId) {
      // Delete from Cloudinary if public ID is available
      try {
        await deleteFromCloudinary(cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error("Error deleting from Cloudinary:", cloudinaryError);
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Delete from database
    await prisma.media.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
