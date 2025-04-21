// src/lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file to Cloudinary
 * @param file The file buffer to upload
 * @param options Options for the upload
 * @returns Cloudinary upload response
 */
export async function uploadToCloudinary(
  file: Buffer,
  options: {
    folder?: string;
    publicId?: string;
    transformation?: any;
    resourceType?: "image" | "video" | "raw" | "auto";
  } = {}
) {
  // Convert buffer to base64 for Cloudinary upload
  const base64 = file.toString("base64");
  const fileUri = `data:${
    options.resourceType === "raw" ? "application/octet-stream" : "image"
  };base64,${base64}`;

  // Set default folder if not provided
  const folder = options.folder || "media";

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fileUri, {
      folder,
      public_id: options.publicId,
      transformation: options.transformation,
      resource_type: options.resourceType || "image",
    });

    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
}

/**
 * Delete a file from Cloudinary
 * @param publicId The public_id of the file to delete
 * @returns Cloudinary delete response
 */
export async function deleteFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
}

/**
 * Get the URL of a Cloudinary asset
 * @param publicId The public_id of the file
 * @param options Options for the URL
 * @returns The URL of the file
 */
export function getCloudinaryUrl(
  publicId: string,
  options: {
    transformation?: any;
    format?: string;
    version?: string;
  } = {}
) {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: options.transformation,
    format: options.format,
    version: options.version,
  });
}

export default cloudinary;
