// lib/config.ts - Fixed version with better error handling
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type ColorScheme = {
  id: string;
  name: string;
  themeClass: string;
  logoVariant: "dark" | "white";
  lineVariant: "dark" | "white";
  colors: {
    background: string;
    text: string;
    accent: string;
    border: string;
    line: string;
  };
};

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

export const getServerConfig = async () => {
  try {
    console.log("getServerConfig: Attempting to read from database...");

    const setting = await prisma.siteSettings.findUnique({
      where: { key: "site.colorScheme" },
    });

    console.log("getServerConfig: Database result:", setting);

    if (setting?.value) {
      try {
        const savedScheme = JSON.parse(setting.value);
        console.log("getServerConfig: Parsed scheme:", savedScheme);

        const fullScheme =
          COLOR_SCHEMES[savedScheme.id as keyof typeof COLOR_SCHEMES];

        if (fullScheme) {
          console.log("getServerConfig: Found valid scheme:", fullScheme.name);
          return { colorScheme: fullScheme };
        }
      } catch (parseError) {
        console.error(
          "getServerConfig: Error parsing saved scheme:",
          parseError
        );
      }
    }

    // If no setting exists or parsing failed, create default
    console.log("getServerConfig: Creating default setting...");

    try {
      await prisma.siteSettings.upsert({
        where: { key: "site.colorScheme" },
        update: {
          value: JSON.stringify({ id: "blue" }),
        },
        create: {
          key: "site.colorScheme",
          value: JSON.stringify({ id: "blue" }),
          description: "Current active color scheme for the site",
        },
      });
      console.log("getServerConfig: Created default setting");
    } catch (createError) {
      console.error(
        "getServerConfig: Error creating default setting:",
        createError
      );
    }

    // Return default blue theme
    console.log("getServerConfig: Returning default blue theme");
    return {
      colorScheme: COLOR_SCHEMES.blue,
    };
  } catch (error) {
    console.error("getServerConfig: Error reading server config:", error);
    // Return default on error
    return {
      colorScheme: COLOR_SCHEMES.blue,
    };
  }
};
