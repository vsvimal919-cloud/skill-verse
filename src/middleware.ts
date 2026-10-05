import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "skill-verse-default-secret-key-32-chars-min-ok"
);

const COOKIE_NAME = "skill_verse_session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Static assets and public APIs are always bypassed
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/portfolio") ||
    pathname.startsWith("/api/skills/taxonomy") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  let sessionPayload: any = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      sessionPayload = payload;
    } catch {
      // Invalid token
    }
  }

  // Redirect unauthenticated users from protected dashboard routes
  if (
    pathname.startsWith("/student") ||
    pathname.startsWith("/academician") ||
    pathname.startsWith("/faculty") ||
    pathname.startsWith("/institution") ||
    pathname.startsWith("/industry") ||
    pathname.startsWith("/admin")
  ) {
    if (!sessionPayload) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-specific enforcement
    if (pathname.startsWith("/student") && sessionPayload.role !== "STUDENT") {
      return NextResponse.redirect(new URL(getRoleDashboard(sessionPayload.role), req.url));
    }
    if (
      (pathname.startsWith("/academician") || pathname.startsWith("/faculty")) &&
      sessionPayload.role !== "ACADEMICIAN" &&
      sessionPayload.role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL(getRoleDashboard(sessionPayload.role), req.url));
    }
    if (
      pathname.startsWith("/institution") &&
      sessionPayload.role !== "ADMIN" &&
      sessionPayload.role !== "ACADEMICIAN"
    ) {
      return NextResponse.redirect(new URL(getRoleDashboard(sessionPayload.role), req.url));
    }
    if (pathname.startsWith("/industry") && sessionPayload.role !== "INDUSTRY" && sessionPayload.role !== "ADMIN") {
      return NextResponse.redirect(new URL(getRoleDashboard(sessionPayload.role), req.url));
    }
    if (pathname.startsWith("/admin") && sessionPayload.role !== "ADMIN") {
      return NextResponse.redirect(new URL(getRoleDashboard(sessionPayload.role), req.url));
    }
  }

  // Redirect authenticated users from login/register to their dashboard
  if ((pathname === "/login" || pathname === "/register") && sessionPayload) {
    return NextResponse.redirect(new URL(getRoleDashboard(sessionPayload.role), req.url));
  }

  return NextResponse.next();
}

function getRoleDashboard(role: string): string {
  switch (role) {
    case "STUDENT":
      return "/student/dashboard";
    case "ACADEMICIAN":
      return "/faculty/dashboard";
    case "INDUSTRY":
      return "/industry/dashboard";
    case "ADMIN":
      return "/institution/dashboard";
    default:
      return "/";
  }
}

export const config = {
  matcher: [
    "/student/:path*",
    "/academician/:path*",
    "/faculty/:path*",
    "/institution/:path*",
    "/industry/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
