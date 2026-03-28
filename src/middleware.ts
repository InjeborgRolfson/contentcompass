import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/favorites", req.nextUrl));
    }
    return null;
  }

  const isPublicPage = req.nextUrl.pathname === "/" || req.nextUrl.pathname.startsWith("/odilon");
  // Note: authenticated users hitting "/" are redirected to /home by page.tsx before rendering

  if (!isLoggedIn && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  return null;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|gif|svg|webp|ico|woff2?|ttf|otf|mp3|mp4|webm|ogg|wav)).*)"],
};
