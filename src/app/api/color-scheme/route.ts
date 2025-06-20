// app/api/color-scheme/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

// Default config
const DEFAULT_CONFIG = {
  colorScheme: COLOR_SCHEMES.blue,
};

// Read current config from database
const readConfig = async () => {
  try {
    const setting = await prisma.siteSettings.findUnique({
      where: { key: "site.colorScheme" },
    });

    if (setting?.value) {
      const savedScheme = JSON.parse(setting.value);
      const fullScheme =
        COLOR_SCHEMES[savedScheme.id as keyof typeof COLOR_SCHEMES];

      if (fullScheme) {
        return { colorScheme: fullScheme };
      }
    }

    return DEFAULT_CONFIG;
  } catch (error) {
    console.error("Error reading config from database:", error);
    return DEFAULT_CONFIG;
  }
};

// Save config to database
const saveConfig = async (colorScheme: any) => {
  try {
    await prisma.siteSettings.upsert({
      where: { key: "site.colorScheme" },
      update: {
        value: JSON.stringify({ id: colorScheme.id }),
      },
      create: {
        key: "site.colorScheme",
        value: JSON.stringify({ id: colorScheme.id }),
        description: "Current active color scheme for the site",
      },
    });
    return true;
  } catch (error) {
    console.error("Error saving config to database:", error);
    return false;
  }
};

export async function GET() {
  const config = await readConfig();
  return NextResponse.json(config);
}

export async function POST(request: NextRequest) {
  try {
    const { colorScheme } = await request.json();

    if (!colorScheme || !colorScheme.id) {
      return NextResponse.json(
        { error: "Color scheme data with id required" },
        { status: 400 }
      );
    }

    // Validate that the color scheme exists
    if (!COLOR_SCHEMES[colorScheme.id as keyof typeof COLOR_SCHEMES]) {
      return NextResponse.json(
        { error: "Invalid color scheme id" },
        { status: 400 }
      );
    }

    // Save to database
    const success = await saveConfig(colorScheme);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to save color scheme" },
        { status: 500 }
      );
    }

    const config = {
      colorScheme: COLOR_SCHEMES[colorScheme.id as keyof typeof COLOR_SCHEMES],
    };

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error) {
    console.error("Error updating color scheme:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
