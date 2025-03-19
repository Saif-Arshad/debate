import { getToken } from "next-auth/jwt";
import {  NextRequest, NextResponse } from "next/server";

export default async function middleware(
    req: NextRequest,
) {
    const session = await getToken({ req: req as any });
    const isAuthenticated = !!session;
    console.log("🚀 ~ session:", session)
    console.log("🚀 ~ isAuthenticated:", isAuthenticated)

    const isTeacher = session?.type == "TEACHER"
    console.log("🚀 ~ isTeacher:", isTeacher)
    const url = req.nextUrl.clone();
    if (req.nextUrl.pathname.startsWith("/login") && isAuthenticated) {
        url.pathname = isTeacher ? "/dashboard" : "/profile";
        return NextResponse.redirect(url);
    }

    if (req.nextUrl.pathname.startsWith("/dashboard") && !isAuthenticated) {
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }
    if (req.nextUrl.pathname.startsWith("/dashboard") && !isTeacher) {
        url.pathname = "/profile";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard", "/dashboard/:path*", "/", "/login"],
};