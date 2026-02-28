import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { password } = body;

        if (!password) {
            return NextResponse.json(
                { success: false, error: "비밀번호를 입력해주세요." },
                { status: 400 }
            );
        }

        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) {
            console.error("[auth] ADMIN_PASSWORD environment variable is not set (Current keys:)", Object.keys(process.env));
            return NextResponse.json(
                { success: false, error: "서버 설정 오류입니다. (관리자 암호 미설정)" },
                { status: 500 }
            );
        }

        if (password !== adminPassword) {
            return NextResponse.json(
                { success: false, error: "비밀번호가 올바르지 않습니다." },
                { status: 401 }
            );
        }

        const response = NextResponse.json({ success: true });
        const token = crypto.randomUUID();

        response.cookies.set({
            name: "admin_session",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7일
        });

        return response;
    } catch (error: any) {
        console.error("[auth] Login error:", error.message);
        return NextResponse.json(
            { success: false, error: "로그인 처리 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
