// app/api/color-scheme/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CONFIG_FILE = path.join(process.cwd(), "config", "site-config.json");

// Ensure config directory exists
const ensureConfigDir = () => {
  const configDir = path.dirname(CONFIG_FILE);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
};

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

// Read current config
const readConfig = () => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf8");
      return JSON.parse(data);
    }
    return DEFAULT_CONFIG;
  } catch (error) {
    return DEFAULT_CONFIG;
  }
};

// Write config
const writeConfig = (config: any) => {
  try {
    ensureConfigDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    return false;
  }
};

export async function GET() {
  const config = readConfig();
  return NextResponse.json(config);
}

export async function POST(request: NextRequest) {
  try {
    const { colorScheme } = await request.json();

    if (!colorScheme) {
      return NextResponse.json(
        { error: "Color scheme data required" },
        { status: 400 }
      );
    }

    const currentConfig = readConfig();
    const newConfig = {
      ...currentConfig,
      colorScheme,
    };

    const success = writeConfig(newConfig);

    if (success) {
      return NextResponse.json({ success: true, config: newConfig });
    } else {
      return NextResponse.json(
        { error: "Failed to save config" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
