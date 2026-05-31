import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const authRoutes = ["/login", "/register", "/register/owner"];
const protectedPrefixes = [
  "/my-team",
  "/predictions",
  "/bets",
  "/calendar",
  "/profile",
  "/owner",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isOwner = req.auth?.user?.role === "OWNER";

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isLoggedIn && isAuthRoute) {
    const redirectTo = isOwner ? "/owner" : "/my-team";
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  if (!isLoggedIn && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/owner") && isLoggedIn && !isOwner) {
    return NextResponse.redirect(new URL("/my-team", req.url));
  }

  if (pathname.startsWith("/register/owner")) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/my-team", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
