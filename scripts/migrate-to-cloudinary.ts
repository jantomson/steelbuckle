// scripts/migrate-to-cloudinary.ts
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const prisma = new PrismaClient();

// Path to local uploads - adjust this based on your project structure
const uploadDir = path.join(process.cwd(), "public");

async function migrateToCloudinary() {
  console.log("Starting migration to Cloudinary...");
  console.log(`Looking for media files in: ${uploadDir}`);

  try {
    // Get all media items from the database
    const mediaItems = await prisma.media.findMany();
    console.log(`Found ${mediaItems.length} media items to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const item of mediaItems) {
      try {
        // Skip items that already have a Cloudinary URL
        if (item.path.includes("cloudinary.com")) {
          console.log(`Skipping ${item.filename} - already on Cloudinary`);
          skippedCount++;
          continue;
        }

        // Build the local file path - remove leading slash if present
        const relPath = item.path.replace(/^\//, "");
        const localFilePath = path.join(process.cwd(), "public", relPath);

        // Check if the file exists locally
        if (!fs.existsSync(localFilePath)) {
          console.log(`Warning: File not found at ${localFilePath}`);
          errorCount++;
          continue;
        }

        console.log(`Uploading ${item.filename} to Cloudinary...`);

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(localFilePath, {
          folder: "media",
          public_id: path.basename(item.path, path.extname(item.path)),
          resource_type: "auto" as "auto",
        });

        // Update the database with Cloudinary URL
        await prisma.media.update({
          where: { id: item.id },
          data: {
            path: result.secure_url,
          },
        });

        console.log(`Successfully migrated ${item.filename} to Cloudinary`);
        migratedCount++;
      } catch (itemError) {
        console.error(`Error migrating ${item.filename}:`, itemError);
        errorCount++;
      }
    }

    console.log("=== Migration Summary ===");
    console.log(`Total media items: ${mediaItems.length}`);
    console.log(`Successfully migrated: ${migratedCount}`);
    console.log(`Skipped (already on Cloudinary): ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration function
migrateToCloudinary()
  .then(() => {
    console.log("Migration script finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });
