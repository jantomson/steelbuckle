// app/api/media/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Define a type for the response data structure
interface MediaRefMap {
  [key: string]: string;
}

// Helper to add cache-busting parameter to URL
function addCacheBustToUrl(url: string, timestamp: string): string {
  // Check if it's a Cloudinary URL
  if (url.includes("cloudinary.com")) {
    // If URL already has transformations or query parameters
    if (url.includes("?")) {
      return `${url}&_t=${timestamp}`;
    }
    return `${url}?_t=${timestamp}`;
  }

  // Legacy URL handling (keep as is for backward compatibility)
  if (url.includes("?")) {
    return `${url}&_t=${timestamp}`;
  }
  return `${url}?_t=${timestamp}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const keys = searchParams.get("keys");
    const pageId = searchParams.get("pageId");
    const cacheBust = searchParams.get("_t") || Date.now().toString();

    // Include cache-busting headers to ensure browsers don't cache responses
    const responseHeaders = {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    };

    if (key) {
      // Fetch a specific media reference
      const mediaRef = await prisma.mediaReference.findUnique({
        where: { referenceKey: key },
        include: { media: true },
      });

      if (!mediaRef || !mediaRef.media) {
        return NextResponse.json(
          { error: "Media not found" },
          {
            status: 404,
            headers: responseHeaders,
          }
        );
      }

      // Add cache-busting parameter to image paths
      const mediaPath = addCacheBustToUrl(mediaRef.media.path, cacheBust);

      return NextResponse.json(
        {
          referenceKey: mediaRef.referenceKey,
          mediaPath,
          mediaType: mediaRef.media.mediaType,
          altText: mediaRef.media.altText,
        },
        { headers: responseHeaders }
      );
    } else if (keys) {
      // Fetch multiple media references by keys
      const keyList = keys.split(",");

      const mediaRefs = await prisma.mediaReference.findMany({
        where: {
          referenceKey: {
            in: keyList,
          },
        },
        include: { media: true },
      });

      // Create the result object with explicit type
      const result: MediaRefMap = {};

      // Convert to a key-value map with cache-busting parameters
      mediaRefs.forEach((ref) => {
        if (ref.media) {
          const path = ref.media.path;
          // Add cache-busting parameter to media paths
          result[ref.referenceKey] = addCacheBustToUrl(path, cacheBust);
        }
      });

      return NextResponse.json(result, { headers: responseHeaders });
    } else if (pageId) {
      // Fetch all media references for a specific page prefix
      // Use startsWith to match various formats: pageId., pageId_page., etc.
      const mediaRefs = await prisma.mediaReference.findMany({
        where: {
          OR: [
            { referenceKey: { startsWith: `${pageId}.` } },
            { referenceKey: { startsWith: `${pageId}_page.` } },
          ],
        },
        include: { media: true },
      });

      // Create the result object with explicit type
      const result: MediaRefMap = {};

      // Convert to a key-value map with cache-busting parameters
      mediaRefs.forEach((ref) => {
        if (ref.media) {
          const path = ref.media.path;
          // Add cache-busting parameter to media paths
          result[ref.referenceKey] = addCacheBustToUrl(path, cacheBust);
        }
      });

      return NextResponse.json(result, { headers: responseHeaders });
    } else {
      // Fetch all media for the media library
      const media = await prisma.media.findMany({
        orderBy: { updatedAt: "desc" },
      });

      // Transform the response to include cache-busting and just the paths
      const items = media.map((item) => {
        return addCacheBustToUrl(item.path, cacheBust);
      });

      return NextResponse.json({ items }, { headers: responseHeaders });
    }
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}
