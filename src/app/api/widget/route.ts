import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// CORS 설정을 위한 헬퍼 함수
function setCorsHeaders(res: NextResponse) {
    res.headers.set("Access-Control-Allow-Origin", "*"); // 실제 운영 시에는 특정 도메인으로 제한 권장
    res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");
    return res;
}

export async function OPTIONS() {
    return setCorsHeaders(new NextResponse(null, { status: 204 }));
}

export async function GET() {
    // 1. Supabase 클라이언트 초기화 (서버 사이드 환경 변수 직접 사용)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!; // API용은 Service Role Key 권장되나 여기서는 Public Key 사용 가능 여부 확인 필요
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // 2. 최신 요약 데이터 가져오기 (넉넉하게 가져와서 중복 제거)
        const { data: summariesData, error } = await supabase
            .from("ai_summaries")
            .select(`
        id,
        summary,
        status,
        created_at,
        target_accounts (
          bakery_name,
          last_scraped_at
        )
      `)
            .eq("status", "success")
            .order("created_at", { ascending: false })
            .limit(20);

        if (error) throw error;

        // 3. 중복 빵집 제거 및 데이터 가공
        const seenBakeries = new Set();
        const allUniqueData = [];

        for (const item of (summariesData || [])) {
            const accounts = item.target_accounts as any;
            const bakeryName = (Array.isArray(accounts) ? accounts[0]?.bakery_name : accounts?.bakery_name) || "베이커리";

            if (seenBakeries.has(bakeryName)) continue;
            seenBakeries.add(bakeryName);

            let summaryObj: any = {};
            try {
                summaryObj = typeof item.summary === 'string' ? JSON.parse(item.summary) : item.summary;
            } catch (e) {
                summaryObj = { excerpt: "새로운 소식이 있습니다.", blocks: [] };
            }

            const firstBlock = summaryObj.blocks?.[0] || { type: 'info', title: '소식' };

            allUniqueData.push({
                id: item.id,
                bakery_name: bakeryName,
                excerpt: summaryObj.excerpt || "최신 게시물을 확인하세요.",
                type: firstBlock.type,
                category: firstBlock.title,
                updated_at: (Array.isArray(accounts) ? accounts[0]?.last_scraped_at : accounts?.last_scraped_at) || item.created_at
            });
        }

        // 4. 무작위 셔플 후 최대 6개 반환
        const shuffledData = allUniqueData.sort(() => Math.random() - 0.5).slice(0, 6);

        const response = NextResponse.json(shuffledData);
        response.headers.set("Cache-Control", "no-store, max-age=0");
        return setCorsHeaders(response);

    } catch (error) {
        console.error("Widget API Error:", error);
        return setCorsHeaders(NextResponse.json({ error: "Failed to fetch data" }, { status: 500 }));
    }
}
