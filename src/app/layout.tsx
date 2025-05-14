import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Script from "next/script";
import ThemeProvider from "@/components/ThemeProvider";
import DynamicFavicon from "@/components/DynamicFavicon";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider />
        <DynamicFavicon />
        {/* Main application */}
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
