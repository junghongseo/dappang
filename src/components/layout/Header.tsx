"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

function getRelativeTimeString(date: Date | null) {
    if (!date) return '업데이트 없음';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}시간 전`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}일 전`;
}

export function Header() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isCrawling, setIsCrawling] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [timeAgo, setTimeAgo] = useState<string>('계산 중...');

    useEffect(() => {
        setMounted(true);

        const supabase = createClient();
        const fetchLatest = async () => {
            const { data } = await supabase
                .from('target_accounts')
                .select('last_scraped_at')
                .order('last_scraped_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (data?.last_scraped_at) {
                setLastUpdated(new Date(data.last_scraped_at));
            } else {
                setLastUpdated(null);
            }
        };

        const fetchCrawlingStatus = async () => {
            const { data } = await supabase
                .from('system_status')
                .select('is_crawling')
                .eq('id', 'global')
                .maybeSingle();

            if (data) {
                setIsCrawling(data.is_crawling);
            }
        };

        fetchLatest();
        fetchCrawlingStatus();

        // 3초마다 상태 폴링 (Realtime 대체)
        const pollingInterval = setInterval(async () => {
            const { data } = await supabase
                .from('system_status')
                .select('is_crawling')
                .eq('id', 'global')
                .maybeSingle();

            if (data) {
                setIsCrawling((prevIsCrawling) => {
                    // 크롤링 중(true)이었다가 방금 완료(false)된 순간
                    if (prevIsCrawling && !data.is_crawling) {
                        fetchLatest(); // 화면에 표시되는 업데이트 타임스탬프 강제 갱신
                    }
                    return data.is_crawling;
                });
            }
        }, 3000);

        return () => {
            clearInterval(pollingInterval);
        };
    }, []);

    useEffect(() => {
        if (!lastUpdated) {
            setTimeAgo('업데이트 없음');
            return;
        }

        const updateString = () => {
            setTimeAgo(getRelativeTimeString(lastUpdated));
        };

        updateString();
        const interval = setInterval(updateString, 60000);

        return () => clearInterval(interval);
    }, [lastUpdated]);

    return (
        <header className="bg-surface-light dark:bg-surface-dark border-b border-stone-200 dark:border-stone-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-md">
                        <span className="material-symbols-outlined">bakery_dining</span>
                    </div>
                    <div>
                        <h1 className="font-display text-2xl font-bold tracking-tight text-primary dark:text-amber-500">
                            BakeryCrawler
                        </h1>
                        <p className="text-xs text-text-sub-light dark:text-text-sub-dark font-medium uppercase tracking-wider">
                            인스타그램 수집기
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end md:flex-row md:items-center gap-4 text-sm">
                        <button
                            onClick={async () => {
                                setIsCrawling(true); // Optimistic UI
                                try {
                                    await fetch('/api/crawl', { method: 'POST' });
                                } catch (e) {
                                    console.error(e);
                                    setIsCrawling(false); // Revert on error
                                }
                            }}
                            disabled={isCrawling}
                            className="flex items-center gap-2 bg-primary hover:bg-primary_hover text-white px-3 py-1.5 rounded-lg border border-transparent shadow-sm transition-colors disabled:opacity-50"
                        >
                            <span className={`material-symbols-outlined text-lg ${isCrawling ? 'animate-spin' : ''}`}>
                                {isCrawling ? 'sync' : 'play_arrow'}
                            </span>
                            <span className="font-bold">
                                {isCrawling ? '정보 수집 및 분석 중...' : '새로 크롤링'}
                            </span>
                        </button>
                        <div className="flex items-center gap-2 text-text-sub-light dark:text-text-sub-dark">
                            <span className="material-symbols-outlined text-lg">
                                schedule
                            </span>
                            <span>
                                업데이트됨: <span className="font-medium">{timeAgo}</span>
                            </span>
                        </div>
                    </div>
                    <button
                        className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        aria-label="Toggle Dark Mode"
                    >
                        {mounted && (
                            <>
                                <span className={`material-symbols-outlined ${theme === 'dark' ? 'hidden' : 'block'}`}>
                                    dark_mode
                                </span>
                                <span className={`material-symbols-outlined text-amber-400 ${theme === 'dark' ? 'block' : 'hidden'}`}>
                                    light_mode
                                </span>
                            </>
                        )}
                        {!mounted && (
                            <span className="material-symbols-outlined opacity-0">
                                dark_mode
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
