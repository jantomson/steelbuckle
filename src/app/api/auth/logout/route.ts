// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { withCsrf } from "@/lib/csrf";

async function handler(req: NextRequest) {
  // Create response object
  const response = NextResponse.json({
    success: true,
    message: "Välja logitud",
  });

  // Clear the auth cookie
  response.cookies.set({
    name: "auth_token",
    value: "",
    httpOnly: true,
    expires: new Date(0), // Expire immediately
    path: "/",
  });

  return response;
}

// Apply CSRF middleware
export const POST = withCsrf(handler);
