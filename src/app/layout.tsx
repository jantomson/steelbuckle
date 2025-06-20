// app/layout.tsx - Corrected version with proper async handling
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Script from "next/script";
import ThemeProvider from "@/components/ThemeProvider";
import DynamicFavicon from "@/components/DynamicFavicon";
import { getServerConfig } from "@/lib/config";
import { GlobalColorSchemeProvider } from "@/components/admin/GlobalColorSchemeProvider";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get initial color scheme on server-side (now properly awaited)
  const config = await getServerConfig();
  const initialColorScheme = config?.colorScheme || null;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={initialColorScheme?.themeClass || "theme-blue"}
    >
      <head>
        {/* Add initial CSS variables to prevent flash */}
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
            /* Ensure theme classes work properly */
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
      </head>
      <body className={inter.className}>
        {/* Wrap everything in the GlobalColorSchemeProvider */}
        <GlobalColorSchemeProvider initialColorScheme={initialColorScheme}>
          <ThemeProvider />
          <DynamicFavicon />
          {/* Main application */}
          <LanguageProvider>{children}</LanguageProvider>
        </GlobalColorSchemeProvider>
      </body>
    </html>
  );
}
