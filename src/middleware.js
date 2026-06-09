import { NextResponse } from "next/server";

const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 30;

const ipMap = new Map();

function getIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip) {
  const now = Date.now();
  const entry = ipMap.get(ip);

  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    ipMap.set(ip, { start: now, count: 1 });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return true;
  }
  return false;
}

function cleanupMap() {
  const now = Date.now();
  for (const [ip, entry] of ipMap) {
    if (now - entry.start > RATE_LIMIT_WINDOW * 2) {
      ipMap.delete(ip);
    }
  }
}

let cleanupCounter = 0;

export function middleware(req) {
  if (cleanupCounter++ % 100 === 0) cleanupMap();

  if (req.nextUrl.pathname.startsWith("/api/")) {
    const ip = getIp(req);

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  const res = NextResponse.next();

  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.openai.com https://api.frankfurter.app; media-src 'self' blob:; frame-src 'self';"
  );

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};