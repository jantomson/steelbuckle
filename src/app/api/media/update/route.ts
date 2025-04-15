// app/api/media/update/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface MediaUpdate {
  referenceKey: string;
  mediaPath: string;
}

export async function POST(request: Request) {
  try {
    // Parse the request body as JSON instead of FormData
    const body = await request.json();
    const updates = body.updates as MediaUpdate[];

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Invalid request format. Expected 'updates' array." },
        { status: 400 }
      );
    }

    console.log("Received media updates:", updates);

    // Process each update
    const results = await Promise.all(
      updates.map(async (update) => {
        try {
          // Find the media by path
          const media = await prisma.media.findUnique({
            where: { path: update.mediaPath },
          });

          if (!media) {
            return {
              referenceKey: update.referenceKey,
              success: false,
              error: "Media not found",
            };
          }

          // Update or create the media reference
          const mediaRef = await prisma.mediaReference.upsert({
            where: { referenceKey: update.referenceKey },
            update: { mediaId: media.id },
            create: { referenceKey: update.referenceKey, mediaId: media.id },
          });

          return {
            referenceKey: update.referenceKey,
            success: true,
            mediaRefId: mediaRef.id,
          };
        } catch (error) {
          console.error(
            `Error updating media reference ${update.referenceKey}:`,
            error
          );
          return {
            referenceKey: update.referenceKey,
            success: false,
            error: "Database error",
          };
        }
      })
    );

    // Check if any updates failed
    const failures = results.filter((result) => !result.success);

    if (failures.length > 0) {
      return NextResponse.json(
        {
          message: "Some media updates failed",
          results,
          details: failures,
        },
        { status: 207 } // Multi-Status
      );
    }

    // Return success response
    return NextResponse.json({
      message: "Media references updated successfully",
      results,
    });
  } catch (error) {
    console.error("Error processing media updates:", error);
    return NextResponse.json(
      { error: "Failed to process media updates" },
      { status: 500 }
    );
  }
}
