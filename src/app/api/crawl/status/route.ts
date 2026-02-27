import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();

        const [statusResult, latestResult] = await Promise.all([
            supabase
                .from('system_status')
                .select('is_crawling')
                .eq('id', 'global')
                .maybeSingle(),
            supabase
                .from('target_accounts')
                .select('last_scraped_at')
                .order('last_scraped_at', { ascending: false })
                .limit(1)
                .maybeSingle(),
        ]);

        return NextResponse.json({
            isCrawling: statusResult.data?.is_crawling ?? false,
            lastScrapedAt: latestResult.data?.last_scraped_at ?? null,
        });
    } catch (error: any) {
        return NextResponse.json(
            { isCrawling: false, lastScrapedAt: null, error: error.message },
            { status: 500 }
        );
    }
}
