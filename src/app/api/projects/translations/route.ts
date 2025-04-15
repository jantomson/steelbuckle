import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { projectId, translations } = await request.json();

    if (!projectId || !translations || typeof translations !== "object") {
      return NextResponse.json(
        { error: "Invalid project or translations data" },
        { status: 400 }
      );
    }

    // Process each translation
    const results = await Promise.all(
      Object.entries(translations).map(async ([langCode, title]) => {
        // Upsert the translation (create if doesn't exist, update if it does)
        return await prisma.projectTranslation.upsert({
          where: {
            projectId_languageCode: {
              projectId,
              languageCode: langCode,
            },
          },
          update: {
            title: title as string,
          },
          create: {
            projectId,
            languageCode: langCode,
            title: title as string,
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      updatedCount: results.length,
    });
  } catch (error) {
    console.error("Error updating project translations:", error);
    return NextResponse.json(
      { error: "Failed to update project translations" },
      { status: 500 }
    );
  }
}
