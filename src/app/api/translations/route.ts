// app/api/translations/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface NestedObject {
  [key: string]: string | NestedObject;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "et"; // Default to Estonian

    // Fetch all translations for the language
    const translations = await prisma.translation.findMany({
      where: { languageCode: lang },
      include: {
        key: true,
      },
      orderBy: {
        key: {
          keyPath: "asc",
        },
      },
    });

    // Transform flat results into a nested object structure
    const result: NestedObject = {};

    for (const translation of translations) {
      const keys = translation.key.keyPath.split(".");
      let current: NestedObject = result;

      // Build the nested structure
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]] as NestedObject;
      }

      // Set the leaf value
      current[keys[keys.length - 1]] = translation.value;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching translations:", error);
    return NextResponse.json(
      { error: "Failed to fetch translations" },
      { status: 500 }
    );
  }
}
