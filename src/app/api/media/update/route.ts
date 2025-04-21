// Complete fixed version of app/api/media/update/route.ts with enhanced lookup
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface MediaUpdate {
  referenceKey: string;
  mediaPath: string;
}

export async function POST(request: Request) {
  try {
    // Parse the request body as JSON
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
          // Ensure the mediaPath is clean (no query parameters)
          const cleanPath = update.mediaPath.split("?")[0];
          console.log(`Looking for media with path: ${cleanPath}`);

          // Find the media by path
          let mediaRecord = await prisma.media.findFirst({
            where: {
              path: cleanPath,
            },
          });

          // If not found by path, try alternative methods
          if (!mediaRecord) {
            console.log(`Media not found for path: ${cleanPath}`);

            // 1. Try to find by filename as a last resort
            const pathSegments = cleanPath.split("/");
            const filename = pathSegments[pathSegments.length - 1];

            if (filename) {
              console.log(`Trying to find by filename: ${filename}`);

              mediaRecord = await prisma.media.findFirst({
                where: {
                  filename: {
                    contains: filename.split(".")[0], // Strip extension
                  },
                },
              });

              if (mediaRecord) {
                console.log(`Found media by filename: ${filename}`);

                // Update the path in the database to match the new Cloudinary path
                mediaRecord = await prisma.media.update({
                  where: { id: mediaRecord.id },
                  data: {
                    path: cleanPath,
                    cloudinaryId: cleanPath.includes("cloudinary.com")
                      ? pathSegments
                          .slice(pathSegments.indexOf("upload") + 2)
                          .join("/")
                          .replace(/\.[^.]+$/, "")
                      : null,
                  },
                });
              }
            }

            // 2. If still not found and it's a Cloudinary URL, try by UUID in filename
            if (!mediaRecord && cleanPath.includes("cloudinary.com")) {
              // Extract UUID if present
              const uuidPattern =
                /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
              const fullPathStr = cleanPath.toString();
              const uuidMatch = fullPathStr.match(uuidPattern);

              if (uuidMatch && uuidMatch[1]) {
                const uuid = uuidMatch[1];
                console.log(`Trying to find by UUID pattern: ${uuid}`);

                mediaRecord = await prisma.media.findFirst({
                  where: {
                    path: {
                      contains: uuid,
                    },
                  },
                });

                if (mediaRecord) {
                  console.log(`Found media by UUID pattern in path: ${uuid}`);

                  // Update the path in the database to match the new path
                  mediaRecord = await prisma.media.update({
                    where: { id: mediaRecord.id },
                    data: {
                      path: cleanPath,
                      cloudinaryId: cleanPath.includes("cloudinary.com")
                        ? cleanPath.split("/upload/")[1].replace(/\.[^.]+$/, "")
                        : null,
                    },
                  });
                }
              }

              // 3. If still not found, try by folder name differences
              if (!mediaRecord) {
                // Try to handle different folder names (steel-buckle vs media)
                // If current path contains "steel-buckle", try looking for a version in "media" folder and vice versa
                if (cleanPath.includes("/steel-buckle/")) {
                  const mediaPath = cleanPath.replace(
                    "/steel-buckle/",
                    "/media/"
                  );
                  console.log(`Trying alternative folder path: ${mediaPath}`);

                  mediaRecord = await prisma.media.findFirst({
                    where: { path: mediaPath },
                  });
                } else if (cleanPath.includes("/media/")) {
                  const steelBucklePath = cleanPath.replace(
                    "/media/",
                    "/steel-buckle/"
                  );
                  console.log(
                    `Trying alternative folder path: ${steelBucklePath}`
                  );

                  mediaRecord = await prisma.media.findFirst({
                    where: { path: steelBucklePath },
                  });
                }

                if (mediaRecord) {
                  console.log(`Found media with alternative folder path`);

                  // Update the path to the new one
                  mediaRecord = await prisma.media.update({
                    where: { id: mediaRecord.id },
                    data: { path: cleanPath },
                  });
                }
              }

              // 4. If still not found, try by the file basename regardless of folder
              if (!mediaRecord) {
                const baseName = pathSegments[pathSegments.length - 1];
                console.log(
                  `Trying to find by base filename regardless of folder: ${baseName}`
                );

                mediaRecord = await prisma.media.findFirst({
                  where: {
                    path: {
                      endsWith: `/${baseName}`,
                    },
                  },
                });

                if (mediaRecord) {
                  console.log(`Found media by base filename: ${baseName}`);

                  // Update the path to the new one
                  mediaRecord = await prisma.media.update({
                    where: { id: mediaRecord.id },
                    data: { path: cleanPath },
                  });
                }
              }

              // 5. Last resort: Create a new media record
              if (!mediaRecord) {
                console.log(
                  `No existing media found, creating new record for: ${cleanPath}`
                );

                const urlParts = cleanPath.split("/");
                const uploadIndex = urlParts.findIndex(
                  (part) =>
                    part === "upload" || part === "image" || part === "video"
                );

                // Only proceed if we can extract a proper Cloudinary path
                if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
                  const fileName = urlParts[urlParts.length - 1];
                  const cloudinaryId = urlParts
                    .slice(uploadIndex + 2)
                    .join("/")
                    .replace(/\.[^.]+$/, "");

                  mediaRecord = await prisma.media.create({
                    data: {
                      filename: fileName,
                      path: cleanPath,
                      cloudinaryId: cloudinaryId,
                      mediaType: fileName.endsWith(".svg")
                        ? "image/svg+xml"
                        : fileName.endsWith(".png")
                        ? "image/png"
                        : fileName.endsWith(".jpg") ||
                          fileName.endsWith(".jpeg")
                        ? "image/jpeg"
                        : fileName.endsWith(".gif")
                        ? "image/gif"
                        : fileName.endsWith(".webp")
                        ? "image/webp"
                        : "image",
                      altText: fileName.split(".")[0] || "Image",
                    },
                  });

                  console.log(
                    `Created new media record with id: ${mediaRecord.id}`
                  );
                } else {
                  return {
                    referenceKey: update.referenceKey,
                    success: false,
                    error: "Invalid Cloudinary URL format",
                    attempted_path: cleanPath,
                  };
                }
              }
            }

            // If all lookup methods failed, return error
            if (!mediaRecord) {
              return {
                referenceKey: update.referenceKey,
                success: false,
                error: "Media not found after multiple lookup attempts",
                attempted_path: cleanPath,
              };
            }
          }

          console.log(
            `Found media with id: ${mediaRecord.id}, updating reference: ${update.referenceKey}`
          );

          // Update or create the media reference
          const mediaRef = await prisma.mediaReference.upsert({
            where: { referenceKey: update.referenceKey },
            update: { mediaId: mediaRecord.id },
            create: {
              referenceKey: update.referenceKey,
              mediaId: mediaRecord.id,
            },
          });

          return {
            referenceKey: update.referenceKey,
            success: true,
            mediaRefId: mediaRef.id,
            mediaId: mediaRecord.id,
          };
        } catch (error: any) {
          console.error(
            `Error updating media reference ${update.referenceKey}:`,
            error
          );
          return {
            referenceKey: update.referenceKey,
            success: false,
            error: `Database error: ${error.message || "Unknown error"}`,
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
  } catch (error: any) {
    console.error("Error processing media updates:", error);
    return NextResponse.json(
      {
        error: `Failed to process media updates: ${
          error.message || "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
