// app/api/translations/update/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface TranslationUpdate {
  path: string;
  content: string;
  languageCode: string;
}

export async function POST(request: Request) {
  try {
    const { updates } = (await request.json()) as {
      updates: TranslationUpdate[];
    };

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "Invalid updates data" },
        { status: 400 }
      );
    }

    // Process each update
    const results = await Promise.all(
      updates.map(async (update) => {
        const { path, content, languageCode } = update;

        // 1. Find or create the translation key
        const translationKey = await prisma.translationKey.upsert({
          where: { keyPath: path },
          update: {}, // No updates needed for the key itself
          create: {
            keyPath: path,
            description: `Auto-created for path: ${path}`,
          },
        });

        // 2. Find or create the translation
        const translation = await prisma.translation.upsert({
          where: {
            keyId_languageCode: {
              keyId: translationKey.id,
              languageCode: languageCode,
            },
          },
          update: {
            value: content,
          },
          create: {
            keyId: translationKey.id,
            languageCode: languageCode,
            value: content,
          },
        });

        return {
          path,
          updated: true,
          translationId: translation.id,
        };
      })
    );

    return NextResponse.json({
      success: true,
      updatedCount: results.length,
      updates: results,
    });
  } catch (error) {
    console.error("Error updating translations:", error);
    return NextResponse.json(
      { error: "Failed to update translations", details: String(error) },
      { status: 500 }
    );
  }
}
