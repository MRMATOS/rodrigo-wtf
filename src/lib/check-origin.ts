import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "https://rodrigo.wtf",
  "https://www.rodrigo.wtf",
];

if (process.env.NODE_ENV === "development") {
  ALLOWED_ORIGINS.push("http://localhost:3000");
}

/**
 * Returns a 403 response if the request Origin does not match allowed origins.
 * Returns null if the origin is valid (or absent, for same-origin requests
 * where browsers omit it, e.g. form submissions).
 */
export function checkOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");

  // Browsers omit Origin on same-origin navigational requests (GET forms).
  // For POST/PUT/DELETE, modern browsers always send Origin.
  if (!origin) return null;

  if (ALLOWED_ORIGINS.includes(origin)) return null;

  return NextResponse.json(
    { error: "Forbidden" },
    { status: 403 }
  );
}
