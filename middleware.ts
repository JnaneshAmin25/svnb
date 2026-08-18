import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

const normalizeAdminPath = (raw: string) =>
  `/${raw.trim().replace(/^\/+|\/+$/g, "").split("/")[0]}`;
const adminPath = normalizeAdminPath(env.ADMIN_BASE_PATH);
const dashboardPath = `${adminPath}/dashboard`;

export default function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Allow the dedicated admin login route to render directly without rewriting.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Direct /admin and /admin/* are blocked — admin pages are reached only via
  // the admin base path rewrite below. We use a strict equality or trailing
  // slash check so admin base paths like "admin-portal-xxx" don't get caught.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (pathname === adminPath) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.search = search;
    return NextResponse.rewrite(loginUrl);
  }

  if (pathname === dashboardPath) {
    const rewritten = new URL("/admin", request.url);
    rewritten.search = search;
    return NextResponse.rewrite(rewritten);
  }

  if (pathname.startsWith(`${adminPath}/`)) {
    // /<adminPath>/login is handled by the same dedicated /admin/login page.
    if (pathname === `${adminPath}/login`) {
      const rewritten = new URL("/admin/login", request.url);
      rewritten.search = search;
      return NextResponse.rewrite(rewritten);
    }
    const rewritten = new URL(`/admin${pathname.slice(adminPath.length)}`, request.url);
    rewritten.search = search;
    return NextResponse.rewrite(rewritten);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
