import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/app/lib/adminSession";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (pathname.startsWith("/api/auth/login")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/auth/logout")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/app-admin/login")) {
    if (await verifySessionToken(token)) {
      return NextResponse.redirect(new URL("/app-admin", request.url));
    }
    return NextResponse.next();
  }

  if (!(await verifySessionToken(token))) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/app-admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app-admin/:path*", "/api/:path*"],
};
