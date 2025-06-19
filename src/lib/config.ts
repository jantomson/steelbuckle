// lib/config.ts
import fs from "fs";
import path from "path";

const CONFIG_FILE = path.join(process.cwd(), "config", "site-config.json");

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

export const getServerConfig = () => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf8");
      return JSON.parse(data);
    }
    return {
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
  } catch (error) {
    console.error("Error reading server config:", error);
    return null;
  }
};
