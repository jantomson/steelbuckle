// app/api/auth/csrf-token/route.ts
import { getCsrfTokenHandler } from "@/lib/csrf";

export async function GET() {
  return getCsrfTokenHandler();
}
