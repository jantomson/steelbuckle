import fs from "fs";
import path from "path";

export async function getServerTranslations(lang = "est") {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "locales",
      lang,
      "common.json"
    );
    const fileContent = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error loading ${lang} translations:`, error);
    if (lang !== "est") {
      return getServerTranslations("est");
    }
    return {};
  }
}

export function getTranslationValue(translations: any, key: string) {
  const keys = key.split(".");
  let value = translations;

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) return key;
  }

  return value;
}
