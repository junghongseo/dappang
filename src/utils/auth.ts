"use server";

import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "admin_session";

/**
 * 관리자 세션 쿠키가 유효한지 검증합니다.
 * Server Actions 및 API Routes에서 인증 확인에 사용합니다.
 */
export async function verifyAdminSession(): Promise<boolean> {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME);
    return !!session?.value;
}

/**
 * 관리자 세션 쿠키를 설정합니다.
 */
export async function setAdminSession(): Promise<string> {
    const token = crypto.randomUUID();
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7일
    });
    return token;
}

/**
 * 관리자 세션 쿠키를 삭제합니다.
 */
export async function clearAdminSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });
}
