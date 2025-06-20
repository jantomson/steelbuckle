// app/layout.tsx - Force dynamic rendering and disable caching
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Script from "next/script";
import ThemeProvider from "@/components/ThemeProvider";
import DynamicFavicon from "@/components/DynamicFavicon";
import { getServerConfig } from "@/lib/config";
import { GlobalColorSchemeProvider } from "@/components/admin/GlobalColorSchemeProvider";
import type { ColorScheme } from "@/lib/config";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "Raudteede ehitus ja hooldus | Steel Buckle",
    template: "%s | Steel Buckle",
  },
  description:
    "Steel Buckle pakub raudtee-ehitus-, remondi- ja hooldusteenuseid 35+ aasta kogemusega Eestis, Lätis ja Leedus.",
  keywords:
    "raudtee-ehitus, raudtee hooldus, raudtee remont, Eesti, Läti, Leedu",
};

// CRITICAL: These exports force dynamic rendering and disable all caching
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initialColorScheme: ColorScheme | undefined = undefined;

  try {
    // Add cache-busting timestamp to ensure fresh data
    const config = await getServerConfig();
    initialColorScheme = config?.colorScheme || undefined;
    console.log(
      `Layout loaded with scheme: ${
        initialColorScheme?.id
      } at ${new Date().toISOString()}`
    );
  } catch (error) {
    console.error("Failed to get server config:", error);
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={initialColorScheme?.themeClass || "theme-blue"}
      key={`theme-${initialColorScheme?.id || "blue"}-${Date.now()}`}
    >
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            :root {
              --primary-background: ${
                initialColorScheme?.colors.background || "#000957"
              };
              --primary-text: ${initialColorScheme?.colors.text || "#ffffff"};
              --primary-accent: ${
                initialColorScheme?.colors.accent || "#577BC1"
              };
              --primary-border: ${
                initialColorScheme?.colors.border || "#ffffff"
              };
              --primary-line: ${initialColorScheme?.colors.line || "#ffffff"};
            }
            .theme-default, .theme-kollane {
              --primary-background: #fde047;
              --primary-text: #000000;
              --primary-border: #000000;
              --primary-line: #000000;
              --primary-accent: #6b7280;
            }
            .theme-blue, .theme-sinine {
              --primary-background: #000957;
              --primary-text: #ffffff;
              --primary-border: #ffffff;
              --primary-line: #ffffff;
              --primary-accent: #577BC1;
            }
            .theme-green, .theme-roheline {
              --primary-background: #C5FF95;
              --primary-text: #16423C;
              --primary-border: #16423C;
              --primary-line: #16423C;
              --primary-accent: #5CB338;
            }
          `,
          }}
        />
        <meta
          httpEquiv="Cache-Control"
          content="no-cache, no-store, must-revalidate"
        />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={inter.className}>
        <GlobalColorSchemeProvider initialColorScheme={initialColorScheme}>
          <ThemeProvider />
          <DynamicFavicon />
          <LanguageProvider>{children}</LanguageProvider>
        </GlobalColorSchemeProvider>
      </body>
    </html>
  );
}
