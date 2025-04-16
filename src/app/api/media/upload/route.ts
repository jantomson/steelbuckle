// app/api/media/upload/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "crypto";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  try {
    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "steel-buckle"; // Default folder name

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (including SVG)
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/svg+xml",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `File type not allowed. Please upload an image file (${allowedTypes.join(
            ", "
          )})`,
        },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Generate a unique ID for the file
    const uniqueId = randomUUID();

    // Get original filename for reference
    const originalFilename = file.name;

    // Convert file to buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Base64 encode the buffer for Cloudinary's upload API
    const base64Data = buffer.toString("base64");
    const fileUri = `data:${file.type};base64,${base64Data}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(fileUri, {
      folder: folder,
      public_id: uniqueId,
      resource_type: "auto",
      overwrite: true,
    });

    // Save file info to database
    const media = await prisma.media.create({
      data: {
        filename: originalFilename,
        path: uploadResult.secure_url, // Use the secure_url from Cloudinary
        mediaType: file.type,
        altText: originalFilename.split(".")[0] || "Image", // Default alt text
      },
    });

    // Return the Cloudinary URL with a cache-busting parameter
    const cacheBustedUrl = `${uploadResult.secure_url}?_t=${Date.now()}`;

    return NextResponse.json({
      message: "File uploaded successfully to Cloudinary",
      url: cacheBustedUrl,
      mediaId: media.id,
      originalName: originalFilename,
      cloudinaryData: {
        publicId: uploadResult.public_id,
        format: uploadResult.format,
        version: uploadResult.version,
        resourceType: uploadResult.resource_type,
      },
    });
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    return NextResponse.json(
      { error: "Failed to upload file to Cloudinary" },
      { status: 500 }
    );
  }
}
