// lib/config.ts - Updated with better error handling and caching
import { prisma } from "./prisma";

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

let configCache: { colorScheme: ColorScheme } | null = null;
let cacheTime = 0;
const CACHE_DURATION = 5000; // 5 seconds cache

export const getServerConfig = async () => {
  try {
    // Use cache for frequent requests
    if (configCache && Date.now() - cacheTime < CACHE_DURATION) {
      return configCache;
    }

    console.log("getServerConfig: Reading from database...");

    const setting = await prisma.siteSettings.findUnique({
      where: { key: "site.colorScheme" },
    });

    if (setting?.value) {
      try {
        const savedScheme = JSON.parse(setting.value);
        const fullScheme =
          COLOR_SCHEMES[savedScheme.id as keyof typeof COLOR_SCHEMES];

        if (fullScheme) {
          configCache = { colorScheme: fullScheme };
          cacheTime = Date.now();
          return configCache;
        }
      } catch (parseError) {
        console.error("Error parsing saved scheme:", parseError);
      }
    }

    // Default fallback
    configCache = { colorScheme: COLOR_SCHEMES.blue };
    cacheTime = Date.now();
    return configCache;
  } catch (error) {
    console.error("Error reading server config:", error);
    return { colorScheme: COLOR_SCHEMES.blue };
  }
};

export const invalidateConfigCache = () => {
  configCache = null;
  cacheTime = 0;
};
