import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST() {
    try {
        const supabase = await createClient();
        await supabase.from('system_status').update({ is_crawling: true }).eq('id', 'global');

        const cmd = `.venv/bin/python execution/scrape_instagram.py && .venv/bin/python execution/summarize_posts.py`;

        // Fire and forget
        exec(cmd, { cwd: process.cwd() }, async (error, stdout, stderr) => {
            const bgSupabase = createSupabaseClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
            );

            try {
                if (error) {
                    console.error(`Error executing crawl scripts: ${error}`);
                }
                console.log(`Crawl STDOUT: ${stdout}`);
                if (stderr) console.error(`Crawl STDERR: ${stderr}`);
            } finally {
                await bgSupabase.from('system_status').update({ is_crawling: false }).eq('id', 'global');
            }
        });

        return NextResponse.json({ success: true, message: '크롤링 명령이 전송되었습니다. 백그라운드에서 실행됩니다.' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
