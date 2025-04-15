// app/api/media/library/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cacheBust = searchParams.get("_t") || Date.now().toString();

    // Include cache-busting headers
    const responseHeaders = {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    };

    // Fetch all media items for the library
    const media = await prisma.media.findMany({
      orderBy: { updatedAt: "desc" },
    });

    // Transform to include cache-busting
    const items = media.map((item) => {
      const path = item.path;
      return path.includes("?")
        ? `${path}&_t=${cacheBust}`
        : `${path}?_t=${cacheBust}`;
    });

    return NextResponse.json({ items }, { headers: responseHeaders });
  } catch (error) {
    console.error("Error fetching media library:", error);
    return NextResponse.json(
      { error: "Failed to fetch media library" },
      { status: 500 }
    );
  }
}
