// app/api/auth/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

// Define the JwtPayload interface
interface JwtPayload {
  id: string;
  username: string;
  role: string;
}

export async function GET(req: NextRequest) {
  try {
    // Get JWT secret from environment - ensure it's not undefined for TypeScript
    const JWT_SECRET = process.env.JWT_SECRET || "";
    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Get the token from cookies
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify the token with type assertion to ensure TypeScript knows JWT_SECRET is defined
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as JwtPayload;

    // Get user from database (without password)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}
