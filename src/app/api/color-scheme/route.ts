// app/api/color-scheme/route.ts - Enhanced with aggressive cache busting
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateConfigCache } from "@/lib/config";

// CRITICAL: Force dynamic route behavior
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// Available color schemes
const COLOR_SCHEMES = {
  default: {
    id: "default",
    name: "Kollane",
    themeClass: "theme-default",
    logoVariant: "dark",
    lineVariant: "dark",
    colors: {
      background: "#fde047",
      text: "#000000",
      accent: "#6b7280",
      border: "#000000",
      line: "#000000",
    },
  },
  blue: {
    id: "blue",
    name: "Sinine",
    themeClass: "theme-blue",
    logoVariant: "white",
    lineVariant: "white",
    colors: {
      background: "#000957",
      text: "#ffffff",
      accent: "#577BC1",
      border: "#ffffff",
      line: "#ffffff",
    },
  },
  green: {
    id: "green",
    name: "Roheline",
    themeClass: "theme-green",
    logoVariant: "dark",
    lineVariant: "dark",
    colors: {
      background: "#C5FF95",
      text: "#16423C",
      accent: "#5CB338",
      border: "#16423C",
      line: "#16423C",
    },
  },
};

const DEFAULT_CONFIG = {
  colorScheme: COLOR_SCHEMES.blue,
};

const createCacheHeaders = () => ({
  "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  "X-Timestamp": Date.now().toString(),
  Vary: "*",
});

const readConfig = async () => {
  try {
    console.log(
      `[${new Date().toISOString()}] Reading config from database...`
    );

    const setting = await prisma.siteSettings.findUnique({
      where: { key: "site.colorScheme" },
    });

    console.log(
      `[${new Date().toISOString()}] Database result:`,
      setting?.value
    );

    if (setting?.value) {
      const savedScheme = JSON.parse(setting.value);
      const fullScheme =
        COLOR_SCHEMES[savedScheme.id as keyof typeof COLOR_SCHEMES];

      if (fullScheme) {
        console.log(
          `[${new Date().toISOString()}] Returning scheme: ${fullScheme.name}`
        );
        return { colorScheme: fullScheme };
      }
    }

    console.log(`[${new Date().toISOString()}] Returning default config`);
    return DEFAULT_CONFIG;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error reading config:`, error);
    return DEFAULT_CONFIG;
  }
};

const saveConfig = async (colorScheme: any) => {
  try {
    console.log(
      `[${new Date().toISOString()}] Saving color scheme: ${colorScheme.id}`
    );

    const result = await prisma.siteSettings.upsert({
      where: { key: "site.colorScheme" },
      update: {
        value: JSON.stringify({ id: colorScheme.id }),
        updatedAt: new Date(), // Force timestamp update
      },
      create: {
        key: "site.colorScheme",
        value: JSON.stringify({ id: colorScheme.id }),
        description: "Current active color scheme for the site",
      },
    });

    console.log(`[${new Date().toISOString()}] Save result:`, result);

    // Invalidate cache after successful save
    invalidateConfigCache();

    return true;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error saving config:`, error);
    return false;
  }
};

export async function GET() {
  try {
    const config = await readConfig();

    return NextResponse.json(config, {
      headers: createCacheHeaders(),
    });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(DEFAULT_CONFIG, {
      status: 500,
      headers: createCacheHeaders(),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { colorScheme } = await request.json();

    console.log(
      `[${new Date().toISOString()}] POST request for color scheme: ${
        colorScheme?.id
      }`
    );

    if (!colorScheme || !colorScheme.id) {
      return NextResponse.json(
        { error: "Color scheme data with id required" },
        { status: 400, headers: createCacheHeaders() }
      );
    }

    if (!COLOR_SCHEMES[colorScheme.id as keyof typeof COLOR_SCHEMES]) {
      return NextResponse.json(
        { error: "Invalid color scheme id" },
        { status: 400, headers: createCacheHeaders() }
      );
    }

    const success = await saveConfig(colorScheme);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to save color scheme" },
        { status: 500, headers: createCacheHeaders() }
      );
    }

    const config = {
      colorScheme: COLOR_SCHEMES[colorScheme.id as keyof typeof COLOR_SCHEMES],
    };

    console.log(
      `[${new Date().toISOString()}] Successfully saved and returning config`
    );

    return NextResponse.json(
      {
        success: true,
        config,
        timestamp: Date.now(), // Add timestamp for debugging
      },
      {
        headers: createCacheHeaders(),
      }
    );
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: createCacheHeaders() }
    );
  }
}
