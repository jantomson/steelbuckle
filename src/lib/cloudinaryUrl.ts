// src/lib/cloudinaryUrl.ts
/**
 * Utilities for working with Cloudinary URLs in the frontend
 */

/**
 * Extract the Cloudinary public ID from a URL
 * @param url Cloudinary URL
 * @returns Public ID or null if not a valid Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes("cloudinary.com")) {
    return null;
  }

  try {
    // Extract public ID from Cloudinary URL
    // Example URL: https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/public_id.jpg
    const urlParts = url.split("/");
    // Find the index after "upload" and take everything after that
    const uploadIndex = urlParts.indexOf("upload");
    if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
      // Skip the version part (v123456) and join the rest
      let publicId = urlParts.slice(uploadIndex + 2).join("/");
      // Remove file extension if present
      publicId = publicId.replace(/\.[^.]+$/, "");
      return publicId;
    }
    return null;
  } catch (error) {
    console.error("Error extracting public ID from URL:", error);
    return null;
  }
}

/**
 * Transform a Cloudinary URL for responsive images
 * @param url Original Cloudinary URL
 * @param options Transformation options
 * @returns Transformed URL
 */
export function getResponsiveUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
  } = {}
): string {
  if (!url || !url.includes("cloudinary.com")) {
    return url;
  }

  try {
    // Parse the URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");

    // Find the upload part
    const uploadIndex = pathParts.indexOf("upload");
    if (uploadIndex === -1) {
      return url;
    }

    // Build the transformation string
    const transformations: string[] = [];

    if (options.width) {
      transformations.push(`w_${options.width}`);
    }

    if (options.height) {
      transformations.push(`h_${options.height}`);
    }

    if (options.crop) {
      transformations.push(`c_${options.crop}`);
    }

    if (options.quality) {
      transformations.push(`q_${options.quality}`);
    }

    // If no transformations, return the original URL
    if (transformations.length === 0) {
      return url;
    }

    // Insert transformations after 'upload'
    pathParts.splice(uploadIndex + 1, 0, transformations.join(","));
    urlObj.pathname = pathParts.join("/");

    return urlObj.toString();
  } catch (error) {
    console.error("Error transforming Cloudinary URL:", error);
    return url;
  }
}

/**
 * Generate an optimized Cloudinary URL for the Image component
 * @param url Original Cloudinary URL
 * @param size Desired size
 * @returns Optimized URL
 */
export function getOptimizedImageUrl(url: string, size: number): string {
  return getResponsiveUrl(url, {
    width: size,
    crop: "fill",
    quality: 80,
  });
}

/**
 * Check if a URL is a Cloudinary URL
 * @param url URL to check
 * @returns True if the URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return Boolean(url && url.includes("cloudinary.com"));
}
