// app/api/seo/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  supportedLanguages,
  defaultLanguage,
} from "@/config/routeTranslations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageKey = searchParams.get("pageKey");

    // Get and normalize language code
    let lang = searchParams.get("lang") || defaultLanguage;

    // Handle legacy format 'est' -> 'et'
    if (lang === "est") lang = "et";

    // Validate the language
    if (!supportedLanguages.includes(lang as any)) {
      console.warn(
        `Unsupported language: ${lang}, defaulting to ${defaultLanguage}`
      );
      lang = defaultLanguage;
    }

    if (!pageKey) {
      return NextResponse.json(
        { error: "Page key is required" },
        { status: 400 }
      );
    }

    console.log(`SEO API request: pageKey=${pageKey}, lang=${lang}`);

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
      console.warn(
        `SEO metadata not found for: pageKey=${pageKey}, lang=${lang}`
      );

      // Try to get it in the default language as a fallback
      if (lang !== defaultLanguage) {
        const defaultLangData = await prisma.seoMetadata.findUnique({
          where: { pageKey },
          include: {
            translations: {
              where: { languageCode: defaultLanguage },
            },
          },
        });

        if (defaultLangData && defaultLangData.translations.length > 0) {
          const translation = defaultLangData.translations[0];
          const formattedSeo = {
            pageKey: defaultLangData.pageKey,
            title: translation.title,
            metaDescription: translation.metaDescription,
            keywords: translation.keywords,
            ogTitle: translation.ogTitle,
            ogDescription: translation.ogDescription,
            language: lang, // Keep requested language in response
            fallbackUsed: true, // Indicate fallback was used
          };

          console.log(`Using fallback SEO data in ${defaultLanguage} language`);
          return NextResponse.json(formattedSeo);
        }
      }

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
