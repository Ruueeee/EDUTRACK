import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const userRole = session?.user?.role;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (session) {
    if (isAuthPage) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (pathname.startsWith("/student") && userRole !== "STUDENT") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (pathname.startsWith("/instructor") && userRole !== "INSTRUCTOR") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (pathname.startsWith("/admin") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/student/:path*', '/instructor/:path*', '/admin/:path*', '/login', '/register'],
};
