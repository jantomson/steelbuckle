// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { withCsrf, setCsrfToken } from "@/lib/csrf";
import { rateLimiter } from "@/lib/rate-limiter";

// Ensure JWT_SECRET is defined and never undefined for TypeScript
const JWT_SECRET = process.env.JWT_SECRET || "";
// Throw runtime error if JWT_SECRET is empty
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}
const TOKEN_EXPIRY = "2h";

async function handler(req: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // Apply rate limiting
    const rateLimitResult = rateLimiter(ip, 5, 15 * 60 * 1000);
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      );
    }

    const { username, password } = await req.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Kasutajanimi ja parool on kohustuslikud" },
        { status: 400 }
      );
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Vale kasutajanimi või parool" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Vale kasutajanimi või parool" },
        { status: 401 }
      );
    }

    // Generate JWT token - Use type assertion to ensure TypeScript knows JWT_SECRET is defined
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET as jwt.Secret,
      { expiresIn: TOKEN_EXPIRY }
    );

    // Create a response with the token in a cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });

    // Set HTTP-only cookie with the token
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    // Set CSRF token in response header
    setCsrfToken(response);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Sisselogimine ebaõnnestus" },
      { status: 500 }
    );
  }
}

// Apply CSRF middleware
export const POST = withCsrf(handler);
