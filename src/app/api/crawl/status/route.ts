import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = 'force-dynamic';

export async function GET() {
    noStore();
    try {
        const supabase = await createClient();

        const [statusResult, latestResult, targetsResult] = await Promise.all([
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
            supabase
                .from('target_accounts')
                .select('id, bakery_name, instagram_id, status, last_scraped_at')
        ]);

        return NextResponse.json({
            isCrawling: statusResult.data?.is_crawling ?? false,
            lastScrapedAt: latestResult.data?.last_scraped_at ?? null,
            debug: {
                statusError: statusResult.error,
                latestError: latestResult.error,
                targetsError: targetsResult.error,
                targetsCount: targetsResult.data?.length ?? 0,
                keyAnon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10),
                keyPub: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.substring(0, 10)
            }
        });
    } catch (error: any) {
        return NextResponse.json(
            { isCrawling: false, lastScrapedAt: null, error: error.message, stack: error.stack },
            { status: 500 }
        );
    }
}
