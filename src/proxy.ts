import { NextResponse, type NextRequest } from "next/server";

// Must match the cookie name set by the Express API (backend/src/middleware/auth.ts).
const SESSION_COOKIE = "doctor_tracker_session";

/**
 * Optimistic route guard: visitors without a session cookie never see the admin shell.
 * The Express API still verifies the JWT on every data request, and an expired/forged
 * cookie produces a 401 that sends the browser back to /login.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (pathname === "/login") {
    return hasSession ? NextResponse.redirect(new URL("/dashboard", request.url)) : NextResponse.next();
  }
  if (!hasSession) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  // Everything except the API rewrite, Next internals and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|screenshots|.*\\.(?:svg|png|jpg|ico)$).*)"],
};
