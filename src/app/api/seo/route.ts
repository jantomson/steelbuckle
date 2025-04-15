// app/api/seo/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get("pageKey");
    const lang = searchParams.get("lang") || "est"; // Default to Estonian

    if (!pageKey) {
      return NextResponse.json(
        { error: "Page key is required" },
        { status: 400 }
      );
    }

    // Find SEO metadata for the specified page and language
    const seoMetadata = await prisma.seoMetadata.findUnique({
      where: { pageKey },
      include: {
        translations: {
          where: { languageCode: lang },
        },
      },
    });

    if (!seoMetadata || seoMetadata.translations.length === 0) {
      return NextResponse.json(
        { error: "SEO metadata not found for the specified page and language" },
        { status: 404 }
      );
    }

    // Format the response
    const translation = seoMetadata.translations[0];
    const formattedSeo = {
      pageKey: seoMetadata.pageKey,
      title: translation.title,
      metaDescription: translation.metaDescription,
      keywords: translation.keywords,
      ogTitle: translation.ogTitle,
      ogDescription: translation.ogDescription,
      language: translation.languageCode,
    };

    return NextResponse.json(formattedSeo);
  } catch (error) {
    console.error("Error fetching SEO metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch SEO metadata" },
      { status: 500 }
    );
  }
}
