// app/api/media/library/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Maximum number of resources to retrieve
const MAX_RESULTS = 100;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cacheBust = searchParams.get("_t") || Date.now().toString();
    const folderParam = searchParams.get("folder") || ""; // Allow filtering by folder

    // Include cache-busting headers
    const responseHeaders = {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    };

    // Options for Cloudinary query
    const options: any = {
      resource_type: "image",
      max_results: MAX_RESULTS,
      type: "upload",
      sort_by: { created_at: "desc" },
    };

    // Add folder filter if provided
    if (folderParam) {
      options.prefix = folderParam;
    }

    // Call Cloudinary API to get all resources
    const result = await cloudinary.api.resources(options);

    // Transform the result to match the expected format
    // Extract just the secure_url from each resource
    const items = result.resources.map((resource: any) => {
      // Add cache busting parameter
      return resource.secure_url.includes("?")
        ? `${resource.secure_url}&_t=${cacheBust}`
        : `${resource.secure_url}?_t=${cacheBust}`;
    });

    // Return the list of Cloudinary image URLs
    return NextResponse.json({ items }, { headers: responseHeaders });
  } catch (error) {
    console.error("Error fetching media library from Cloudinary:", error);
    return NextResponse.json(
      { error: "Failed to fetch media library from Cloudinary" },
      { status: 500 }
    );
  }
}
