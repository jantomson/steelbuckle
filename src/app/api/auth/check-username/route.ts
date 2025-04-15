// app/api/auth/check-username/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withCsrf } from "@/lib/csrf";
import { rateLimiter } from "@/lib/rate-limiter";

async function handler(req: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // Apply rate limiting
    const rateLimitResult = rateLimiter(ip, 10, 15 * 60 * 1000);
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      );
    }

    const { username } = await req.json();

    // Validate input
    if (!username) {
      return NextResponse.json(
        { error: "Kasutajanimi on kohustuslik" },
        { status: 400 }
      );
    }

    // Check if the username exists
    const user = await prisma.user.findUnique({
      where: { username },
    });

    // Return the result without revealing too much information
    return NextResponse.json({
      exists: !!user,
    });
  } catch (error) {
    console.error("Check username error:", error);
    return NextResponse.json(
      { error: "Kasutajanime kontrollimine ebaõnnestus" },
      { status: 500 }
    );
  }
}

// Apply CSRF middleware
export const POST = withCsrf(handler);
