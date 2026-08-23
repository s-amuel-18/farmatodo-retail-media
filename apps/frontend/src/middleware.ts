import { NextResponse, type NextRequest } from "next/server";
import { ROLE_HOME_ROUTE } from "./lib/role-routes";

/**
 * UX-level route gating only — the `role` cookie is set client-side after
 * Firebase sign-in and is never treated as proof of anything. The real
 * authorization boundary is FirebaseAuthGuard/RolesGuard on every API call
 * and firestore.rules; this just keeps a signed-out or wrong-role user from
 * landing on a screen that doesn't apply to them.
 */
export function middleware(request: NextRequest) {
  const hasSession = request.cookies.get("session")?.value === "1";
  const role = request.cookies.get("role")?.value as keyof typeof ROLE_HOME_ROUTE | undefined;
  const { pathname } = request.nextUrl;

  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/approvals") && role !== "APPROVER_MANAGER") {
    return NextResponse.redirect(new URL(ROLE_HOME_ROUTE.COMMERCIAL_ANALYST, request.url));
  }

  if (pathname.startsWith("/campaigns") && role === "APPROVER_MANAGER") {
    return NextResponse.redirect(new URL(ROLE_HOME_ROUTE.APPROVER_MANAGER, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/campaigns/:path*", "/approvals/:path*"],
};
