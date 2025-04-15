import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/_next/", "/*.json$"],
    },
    sitemap: "https://steelbuckle.ee/sitemap.xml",
  };
}
