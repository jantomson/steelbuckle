// pages/api/update-tailwind-config.ts
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

type ColorConfig = {
  primary: {
    background: string;
    text: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the colors from the request body
    const { colors } = req.body as { colors: ColorConfig };

    if (!colors) {
      return res.status(400).json({ error: "Colors are required" });
    }

    // Get the tailwind config file path
    const tailwindConfigPath = path.join(process.cwd(), "tailwind.config.ts");

    // Read the current tailwind config
    let tailwindConfig = fs.readFileSync(tailwindConfigPath, "utf8");

    // Update the colors in the config
    // This is a simple string replacement approach focusing only on primary colors

    // Update primary background
    tailwindConfig = tailwindConfig.replace(
      /background: ".*",\s*\/\/ Default yellow-300/,
      `background: "${colors.primary.background}", // Default yellow-300`
    );

    // Update primary text
    tailwindConfig = tailwindConfig.replace(
      /text: ".*",\s*\/\/ Default text-black/,
      `text: "${colors.primary.text}", // Default text-black`
    );

    // Write the updated config back to the file
    fs.writeFileSync(tailwindConfigPath, tailwindConfig, "utf8");

    // Return success
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating tailwind config:", error);
    return res.status(500).json({ error: "Failed to update tailwind config" });
  }
}
