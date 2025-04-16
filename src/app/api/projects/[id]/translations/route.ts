// app/api/projects/[id]/translations/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Await params before accessing its properties
    const projectId = (await params).id;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Fetch all translations for this project
    const translations = await prisma.projectTranslation.findMany({
      where: {
        projectId: projectId,
      },
    });

    // Convert to a more convenient format for the frontend
    const formattedTranslations: Record<string, string> = {};

    translations.forEach((translation) => {
      formattedTranslations[translation.languageCode] = translation.title;
    });

    return NextResponse.json(formattedTranslations);
  } catch (error) {
    console.error("Error fetching project translations:", error);
    return NextResponse.json(
      { error: "Failed to fetch project translations" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Await params before accessing its properties
    const projectId = (await params).id;

    const { translations } = await request.json();

    if (!projectId || !translations || typeof translations !== "object") {
      return NextResponse.json(
        { error: "Invalid project or translations data" },
        { status: 400 }
      );
    }

    // Process each translation
    const results = await Promise.all(
      Object.entries(translations).map(async ([langCode, title]) => {
        if (!title) return null; // Skip empty translations

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

    // Filter out nulls (from skipped empty translations)
    const validResults = results.filter((result) => result !== null);

    return NextResponse.json({
      success: true,
      updatedCount: validResults.length,
    });
  } catch (error) {
    console.error("Error updating project translations:", error);
    return NextResponse.json(
      { error: "Failed to update project translations" },
      { status: 500 }
    );
  }
}
