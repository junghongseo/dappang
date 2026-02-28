import { NextRequest, NextResponse } from "next/server";
import { setAdminSession } from "@/utils/auth";

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
            console.error("[auth] ADMIN_PASSWORD environment variable is not set");
            return NextResponse.json(
                { success: false, error: "서버 설정 오류입니다." },
                { status: 500 }
            );
        }

        if (password !== adminPassword) {
            return NextResponse.json(
                { success: false, error: "비밀번호가 올바르지 않습니다." },
                { status: 401 }
            );
        }

        await setAdminSession();

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[auth] Login error:", error.message);
        return NextResponse.json(
            { success: false, error: "로그인 처리 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
