// app/api/admin/reset-database/route.ts
import { NextResponse } from "next/server";
import { execSync } from "child_process";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface JwtPayload {
  id: string;
  username: string;
  role: string;
}

// Verify the user is an admin
async function verifyAdminAccess(request: Request) {
  try {
    const token = request.headers
      .get("cookie")
      ?.split("; ")
      .find((row) => row.startsWith("auth_token="))
      ?.split("=")[1];

    if (!token) {
      return false;
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Check if user is admin
    return decoded.role === "admin";
  } catch (error) {
    console.error("Admin verification error:", error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    // Verify this is an admin user
    const isAdmin = await verifyAdminAccess(request);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Juurdepääs keelatud. Administraatori õigused on nõutavad." },
        { status: 403 }
      );
    }

    // Clear all data from the database except users and languages
    // Note: We're using a transaction to ensure atomicity
    await prisma.$transaction([
      // Delete all data in reverse order of dependencies
      prisma.seoTranslation.deleteMany({}),
      prisma.seoMetadata.deleteMany({}),
      prisma.phoneNumber.deleteMany({}),
      prisma.contactInfo.deleteMany({}),
      prisma.mediaReference.deleteMany({}),
      prisma.media.deleteMany({}),
      prisma.projectTranslation.deleteMany({}),
      prisma.project.deleteMany({}),
      prisma.translation.deleteMany({}),
      prisma.translationKey.deleteMany({}),
      // Don't delete languages or users
    ]);

    // Run the seed script to restore default data
    try {
      execSync("npm run seed", { stdio: "inherit" });
    } catch (error) {
      console.error("Error running seed script:", error);
      return NextResponse.json(
        { error: "Algsätete taastamine ebaõnnestus. Laadimisskript nurjus." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Andmebaas on taastatud algseisu.",
    });
  } catch (error) {
    console.error("Database reset error:", error);
    return NextResponse.json(
      {
        error:
          "Andmebaasi lähtestamine ebaõnnestus. Palun proovige uuesti või võtke ühendust administraatoriga.",
      },
      { status: 500 }
    );
  }
}
