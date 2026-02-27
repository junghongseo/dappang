import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const githubToken = process.env.GH_PAT_TOKEN;
        if (!githubToken) {
            return NextResponse.json(
                { success: false, error: 'GH_PAT_TOKEN is not configured' },
                { status: 500 }
            );
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
