// app/api/color-scheme/route.ts
import { NextRequest, NextResponse } from "next/server";

// Default config (matching your current blue theme)
const DEFAULT_CONFIG = {
  colorScheme: {
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
};

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

// Read current config from environment variable
const readConfig = () => {
  try {
    const envColorScheme = process.env.CURRENT_COLOR_SCHEME;
    if (
      envColorScheme &&
      COLOR_SCHEMES[envColorScheme as keyof typeof COLOR_SCHEMES]
    ) {
      return {
        colorScheme:
          COLOR_SCHEMES[envColorScheme as keyof typeof COLOR_SCHEMES],
      };
    }
    return DEFAULT_CONFIG;
  } catch (error) {
    console.error("Error reading config:", error);
    return DEFAULT_CONFIG;
  }
};

export async function GET() {
  const config = readConfig();
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

    // In a real implementation, you would update the environment variable
    // via Vercel's API, but for now, we'll just return success
    // and rely on client-side persistence

    const config = {
      colorScheme: COLOR_SCHEMES[colorScheme.id as keyof typeof COLOR_SCHEMES],
    };

    return NextResponse.json({
      success: true,
      config,
      note: "Color scheme updated temporarily - consider using database storage for persistence",
    });
  } catch (error) {
    console.error("Error updating color scheme:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
