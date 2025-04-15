// app/api/media/upload/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

// Configure uploads directory
const uploadsDir = join(process.cwd(), "public/uploads");

export async function POST(request: Request) {
  try {
    // Ensure uploads directory exists
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      console.error("Error creating uploads directory:", error);
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (including SVG)
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/svg+xml",
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

    // Generate a unique filename with the original extension
    const originalFilename = file.name;
    const fileExtension = originalFilename.split(".").pop() || "";
    const fileName = `${randomUUID()}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // URL path to access the file
    const urlPath = `/uploads/${fileName}`;

    // Convert file to buffer and save to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Save file info to database using the correct field names from your schema
    const media = await prisma.media.create({
      data: {
        filename: originalFilename, // Changed from 'name' to 'filename' to match schema
        path: urlPath,
        mediaType: file.type,
        altText: originalFilename.split(".")[0] || "Image", // Default alt text
      },
    });

    // Return the URL with a cache-busting parameter
    const cacheBustedUrl = `${urlPath}?_t=${Date.now()}`;

    return NextResponse.json({
      message: "File uploaded successfully",
      url: cacheBustedUrl,
      mediaId: media.id,
      originalName: originalFilename,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
