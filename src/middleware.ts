import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Convert your JWT_SECRET to Uint8Array for jose
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

// Language path patterns to match
const languagePatterns = {
  et: /^\/((?!en|lv|ru|api|_next|admin|favicon.ico).*)$/,
  en: /^\/en(\/.*)?$/,
  lv: /^\/lv(\/.*)?$/,
  ru: /^\/ru(\/.*)?$/,
};

// Function to check if user is authenticated
async function isAuthenticated(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return false;
  }

  try {
    // Verify the token using jose (compatible with Edge runtime)
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch (error) {
    console.error("Token verification failed:", error);
    return false;
  }
}

// Check if path needs language handling
function needsLanguageHandling(pathname: string): boolean {
  // Skip for admin paths and specific paths
  return !(
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/admin") || // Make sure admin routes are excluded
    pathname.includes("favicon.ico")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is a language-prefixed admin route, and redirect to the non-prefixed version
  // Using a more precise regex to catch all variations
  const languagePrefixedAdminPattern = /^\/(en|lv|ru|et)(\/admin\/.*)$/;
  const match = pathname.match(languagePrefixedAdminPattern);

  if (match && match[2]) {
    // Get the admin path portion (including /admin and everything after)
    const adminPath = match[2];

    // Preserve the language in a cookie before redirecting
    const language = match[1];
    const redirectUrl = new URL(adminPath, request.url);
    const response = NextResponse.redirect(redirectUrl);

    // Set language cookie to maintain the selected language in the admin UI
    response.cookies.set("language", language);

    console.log(
      `Redirecting from ${pathname} to ${adminPath} with language ${language}`
    );
    return response;
  }

  // Redirect root to /et
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/et", request.url));
  }

  // PART 1: Handle Language Routes
  if (needsLanguageHandling(pathname)) {
    // Check which language pattern matches the current path
    let detectedLang = "et"; // default

    if (languagePatterns.en.test(pathname)) {
      detectedLang = "en";
    } else if (languagePatterns.lv.test(pathname)) {
      detectedLang = "lv";
    } else if (languagePatterns.ru.test(pathname)) {
      detectedLang = "ru";
    }

    // Set language cookie
    const response = NextResponse.next();
    response.cookies.set("language", detectedLang);

    return response;
  }

  // PART 2: Handle Admin Authentication
  // Public paths that don't require authentication
  const publicPaths = ["/admin/login", "/admin/reset-password"];

  // Check if the current path is a public path
  const isPublicPath = publicPaths.some((path) => pathname === path);

  // Special case for the /admin root path
  const isAdminRoot = pathname === "/admin";

  // If path is not public, check authentication
  if (pathname.startsWith("/admin") && !isPublicPath && !isAdminRoot) {
    const authenticated = await isAuthenticated(request);

    if (!authenticated) {
      // Redirect to login page if not authenticated
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect /admin to /admin/dashboard when authenticated
  if (isAdminRoot) {
    const authenticated = await isAuthenticated(request);
    if (authenticated) {
      // If authenticated, redirect to dashboard
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else {
      // If not authenticated, redirect to login
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

// Updated matcher to handle both admin paths and other paths
export const config = {
  matcher: [
    // Match admin paths
    "/admin/:path*",
    // Match all other paths except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
