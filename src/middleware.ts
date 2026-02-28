import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "admin_session";

// 인증이 필요한 경로 (관리자 전용)
const PROTECTED_PATHS = [
    "/admin",
    "/api/crawl",
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 인증 관련 경로는 항상 통과
    if (pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    // 로그인 페이지: 이미 인증된 사용자는 /admin으로 리다이렉트
    if (pathname === "/login") {
        const session = request.cookies.get(SESSION_COOKIE_NAME);
        if (session?.value) {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
        return NextResponse.next();
    }

    // 보호 대상 경로인지 확인
    const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
    if (!isProtected) {
        return NextResponse.next();
    }

    // 세션 쿠키 확인
    const session = request.cookies.get(SESSION_COOKIE_NAME);
    if (!session?.value) {
        // API 요청은 401 반환
        if (pathname.startsWith("/api/")) {
            return NextResponse.json(
                { success: false, error: "인증이 필요합니다." },
                { status: 401 }
            );
        }
        // 페이지 요청은 /login으로 리다이렉트
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
