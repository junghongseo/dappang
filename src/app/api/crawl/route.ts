import { NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function POST() {
    try {
        // run_crawl.py handles is_crawling state management internally
        const cmd = `.venv/bin/python execution/run_crawl.py`;

        // Fire and forget
        exec(cmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
            if (error) {
                console.error(`[crawl] Error: ${error.message}`);
            }
            if (stdout) console.log(`[crawl] STDOUT: ${stdout}`);
            if (stderr) console.error(`[crawl] STDERR: ${stderr}`);
        });

        return NextResponse.json({ success: true, message: '크롤링이 시작되었습니다.' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
