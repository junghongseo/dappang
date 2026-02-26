import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

export async function POST() {
    try {
        const cmd = `.venv/bin/python execution/scrape_instagram.py && .venv/bin/python execution/summarize_posts.py`;

        // Fire and forget
        exec(cmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing crawl scripts: ${error}`);
                return;
            }
            console.log(`Crawl STDOUT: ${stdout}`);
            if (stderr) console.error(`Crawl STDERR: ${stderr}`);
        });

        return NextResponse.json({ success: true, message: '크롤링 명령이 전송되었습니다. 백그라운드에서 실행됩니다.' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
