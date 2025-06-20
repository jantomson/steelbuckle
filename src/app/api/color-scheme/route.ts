// app/api/color-scheme/route.ts - Fixed version with better error handling
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Available color schemes
const COLOR_SCHEMES = {
  default: {
    id: "default",
    name: "Kollane",
    themeClass: "theme-default",
    logoVariant: "dark" as const,
    lineVariant: "dark" as const,
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
    logoVariant: "white" as const,
    lineVariant: "white" as const,
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
    logoVariant: "dark" as const,
    lineVariant: "dark" as const,
    colors: {
      background: "#C5FF95",
      text: "#16423C",
      accent: "#5CB338",
      border: "#16423C",
      line: "#16423C",
    },
  },
} as const;

// Default config
const DEFAULT_CONFIG = {
  colorScheme: COLOR_SCHEMES.blue,
};

// Read current config from database
const readConfig = async () => {
  try {
    console.log("Attempting to read color scheme from database...");

    const setting = await prisma.siteSettings.findUnique({
      where: { key: "site.colorScheme" },
    });

    console.log("Database query result:", setting);

    if (setting?.value) {
      try {
        const savedScheme = JSON.parse(setting.value);
        console.log("Parsed saved scheme:", savedScheme);

        const fullScheme =
          COLOR_SCHEMES[savedScheme.id as keyof typeof COLOR_SCHEMES];

        if (fullScheme) {
          console.log("Found valid color scheme:", fullScheme.name);
          return { colorScheme: fullScheme };
        } else {
          console.log("Invalid scheme ID, using default");
        }
      } catch (parseError) {
        console.error("Error parsing saved scheme:", parseError);
      }
    } else {
      console.log(
        "No color scheme setting found in database, creating default..."
      );

      // Create default setting if it doesn't exist
      await prisma.siteSettings.create({
        data: {
          key: "site.colorScheme",
          value: JSON.stringify({ id: "blue" }),
          description: "Current active color scheme for the site",
        },
      });

      console.log("Created default color scheme setting");
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
    console.log("Attempting to save color scheme:", colorScheme.id);

    const result = await prisma.siteSettings.upsert({
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

    console.log("Successfully saved color scheme to database:", result);
    return true;
  } catch (error) {
    console.error("Error saving config to database:", error);
    return false;
  }
};

export async function GET() {
  try {
    console.log("GET /api/color-scheme called");
    const config = await readConfig();
    console.log("Returning config:", config);
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error in GET /api/color-scheme:", error);
    return NextResponse.json(DEFAULT_CONFIG);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/color-scheme called");
    const { colorScheme } = await request.json();
    console.log("Received color scheme data:", colorScheme);

    if (!colorScheme || !colorScheme.id) {
      console.error("Invalid color scheme data received");
      return NextResponse.json(
        { error: "Color scheme data with id required" },
        { status: 400 }
      );
    }

    // Validate that the color scheme exists
    if (!COLOR_SCHEMES[colorScheme.id as keyof typeof COLOR_SCHEMES]) {
      console.error("Invalid color scheme id:", colorScheme.id);
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

    console.log("Successfully updated color scheme, returning:", config);

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
