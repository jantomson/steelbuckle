// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { withCsrf } from "@/lib/csrf";
import { rateLimiter } from "@/lib/rate-limiter";

async function handler(req: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // Apply rate limiting - stricter for password reset
    const rateLimitResult = rateLimiter(ip, 3, 60 * 60 * 1000);
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      );
    }

    const { username, newPassword } = await req.json();

    // Validate input
    if (!username || !newPassword) {
      return NextResponse.json(
        { error: "Kasutajanimi ja uus parool on kohustuslikud" },
        { status: 400 }
      );
    }

    // Validate password requirements
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Parool peab olema vähemalt 8 tähemärki pikk" },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(newPassword)) {
      return NextResponse.json(
        { error: "Parool peab sisaldama vähemalt üht suurtähte" },
        { status: 400 }
      );
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      return NextResponse.json(
        { error: "Parool peab sisaldama vähemalt üht erimärki" },
        { status: 400 }
      );
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kasutajat ei leitud" },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Parool on edukalt muudetud",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Parooli muutmine ebaõnnestus" },
      { status: 500 }
    );
  }
}

// Apply CSRF middleware to protect against CSRF attacks
export const POST = withCsrf(handler);
