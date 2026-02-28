import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { unstable_noStore as noStore } from "next/cache";

export async function POST() {
    noStore();
    try {
        const githubToken = process.env.GH_PAT_TOKEN;
        if (!githubToken) {
            return NextResponse.json(
                { success: false, error: 'GH_PAT_TOKEN is not configured' },
                { status: 500 }
            );
        }

        const supabase = await createClient();

        const statusRes = await supabase.from('system_status').select('is_crawling').eq('id', 'global').maybeSingle();
        if (statusRes.data?.is_crawling) {
            return NextResponse.json({
                success: false,
                message: '이미 크롤링이 진행 중입니다. 잠시 후 다시 시도해주세요.',
            }, { status: 409 });
        }

        const { error: updateError } = await supabase.from('system_status').update({ is_crawling: true }).eq('id', 'global');
        if (updateError) {
            console.error("[crawl] Supabase update error:", updateError);
        }

        const owner = 'junghongseo';
        const repo = 'dappang';
        const workflowFile = 'crawl.yml';

        // Trigger GitHub Actions workflow_dispatch
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowFile}/dispatches`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                    'User-Agent': 'dappang-cloudflare-worker',
                },
                body: JSON.stringify({ ref: 'main' }),
            }
        );

        if (response.status === 204) {
            return NextResponse.json({
                success: true,
                message: '크롤링 워크플로우가 트리거되었습니다.',
            });
        }

        const errorBody = await response.text();
        console.error(`[crawl] GitHub API error: ${response.status} ${errorBody}`);
        return NextResponse.json(
            { success: false, error: `GitHub API responded with ${response.status}`, details: errorBody, tokenPrefix: githubToken.substring(0, 6) },
            { status: 500 }
        );
    } catch (error: any) {
        console.error(`[crawl] Error: ${error.message}`);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
