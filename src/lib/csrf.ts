// lib/csrf.ts
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// Cookie name for CSRF token
const CSRF_COOKIE_NAME = "csrf_token";
// Token expiration time (30 minutes)
const TOKEN_EXPIRY = 30 * 60 * 1000;

// Generate a new CSRF token
export function generateCsrfToken(): string {
  return uuidv4();
}

// Validate CSRF token by comparing header token with cookie token
export function validateCsrfToken(req: NextRequest): boolean {
  try {
    // Get token from header
    const headerToken = req.headers.get("x-csrf-token");
    if (!headerToken) return false;

    // Get token from cookie
    const cookieToken = req.cookies.get(CSRF_COOKIE_NAME)?.value;
    if (!cookieToken) return false;

    // Compare tokens
    return headerToken === cookieToken;
  } catch (error) {
    console.error("CSRF validation error:", error);
    return false;
  }
}

// Middleware to handle CSRF token
export function withCsrf(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    // Skip CSRF protection for non-mutating methods
    if (
      req.method === "GET" ||
      req.method === "HEAD" ||
      req.method === "OPTIONS"
    ) {
      return handler(req);
    }

    // For state-changing operations, validate CSRF token
    if (!validateCsrfToken(req)) {
      return NextResponse.json(
        { error: "CSRF token validation failed" },
        { status: 403 }
      );
    }

    // Token is valid, proceed to handler
    return handler(req);
  };
}

// Set a CSRF token in the response
export function setCsrfToken(response: NextResponse): string {
  const token = generateCsrfToken();

  // Set token in cookie
  response.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: token,
    httpOnly: false, // Need to be accessible from JavaScript
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: TOKEN_EXPIRY / 1000, // Convert to seconds for cookie
    path: "/",
  });

  // Also set in header for API responses
  response.headers.set("x-csrf-token", token);

  return token;
}

// API endpoint to get a CSRF token
export async function getCsrfTokenHandler() {
  const token = generateCsrfToken();

  const response = NextResponse.json({ csrfToken: token });

  // Set token in cookie
  response.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: token,
    httpOnly: false, // Need to be accessible from JavaScript
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: TOKEN_EXPIRY / 1000, // Convert to seconds for cookie
    path: "/",
  });

  return response;
}
