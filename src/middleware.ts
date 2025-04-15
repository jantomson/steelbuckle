import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Convert your JWT_SECRET to Uint8Array for jose
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

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

export async function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const publicPaths = ["/admin/login", "/admin/reset-password"];

  // Check if the current path is a public path
  const isPublicPath = publicPaths.some(
    (path) => request.nextUrl.pathname === path
  );

  // Special case for the /admin root path
  const isAdminRoot = request.nextUrl.pathname === "/admin";

  // If path is not public, check authentication
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    !isPublicPath &&
    !isAdminRoot
  ) {
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

export const config = {
  matcher: "/admin/:path*",
};
