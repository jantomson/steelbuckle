// lib/rate-limiter.ts
import { NextResponse } from "next/server";

// Simple in-memory rate limiter
// Note: For production, use a distributed store if you have multiple instances
const ipAttempts = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(
  ip: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
) {
  const now = Date.now();

  // Get or create attempt record
  let attempt = ipAttempts.get(ip);
  if (!attempt || now > attempt.resetTime) {
    attempt = { count: 0, resetTime: now + windowMs };
  }

  // Increment attempt count
  attempt.count++;
  ipAttempts.set(ip, attempt);

  // Check if rate limit is exceeded
  if (attempt.count > maxAttempts) {
    return {
      limited: true,
      message: "Liiga palju katseid. Proovi hiljem uuesti.",
      remainingMs: attempt.resetTime - now,
    };
  }

  return { limited: false };
}
