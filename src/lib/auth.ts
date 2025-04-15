// lib/auth.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

// Ensure JWT_SECRET is defined and never undefined for TypeScript
const JWT_SECRET = process.env.JWT_SECRET || "";
// Throw runtime error if JWT_SECRET is empty
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

interface JwtPayload {
  id: string;
  username: string;
  role: string;
}

interface AuthResult {
  isAuthenticated: boolean;
  user?: {
    id: string;
    username: string;
    role: string;
  };
  error?: string;
}

export async function authMiddleware(req: NextRequest): Promise<AuthResult> {
  try {
    // Get the token from cookies
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return {
        isAuthenticated: false,
        error: "Not authenticated",
      };
    }

    // Verify the token - Use type assertion to ensure TypeScript knows JWT_SECRET is defined
    const decoded = jwt.verify(token, JWT_SECRET as jwt.Secret) as JwtPayload;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });

    if (!user) {
      return {
        isAuthenticated: false,
        error: "User not found",
      };
    }

    return {
      isAuthenticated: true,
      user,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      isAuthenticated: false,
      error: "Authentication failed",
    };
  }
}

export function withAuth(
  handler: (
    req: NextRequest,
    user: NonNullable<AuthResult["user"]>
  ) => Promise<NextResponse>,
  options: { requiredRole?: string } = {}
) {
  return async (req: NextRequest) => {
    const auth = await authMiddleware(req);

    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { error: auth.error || "Not authenticated" },
        { status: 401 }
      );
    }

    // Type guard to ensure user exists
    if (!auth.user) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    // Check role if required
    if (
      options.requiredRole &&
      auth.user.role !== options.requiredRole &&
      auth.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Continue to the handler
    return handler(req, auth.user);
  };
}

// Helper function to generate JWT tokens with correct typing
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, { expiresIn: "2h" });
}

// Helper function to verify tokens with correct typing
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET as jwt.Secret) as JwtPayload;
}
