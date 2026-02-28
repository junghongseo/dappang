"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchTargetAccounts, forceRefreshDashboard } from "@/app/actions/dashboard";
import { TargetAccountData } from "@/app/actions/dashboard";

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
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const router = useRouter();

    // 서버에서 상태를 가져오는 함수 (순수 fetch, SDK 미사용)
    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch('/api/crawl/status', { cache: 'no-store' });
            if (!res.ok) return;
            const data = await res.json();

            const wasRunning = isCrawlingRef.current;
            const nowRunning = data.isCrawling;

            setIsCrawling(nowRunning);
            isCrawlingRef.current = nowRunning;

            if (data.lastScrapedAt) {
                const newLastUpdated = new Date(data.lastScrapedAt);
                // Only update if the date has actually changed to prevent unnecessary re-renders
                if (!lastUpdated || newLastUpdated.getTime() !== lastUpdated.getTime()) {
                    setLastUpdated(newLastUpdated);
                }
            }

            // 크롤링이 활성화된 상태면 폴링 시작, 끝났으면 중지
            if (nowRunning && !pollingRef.current) {
                startPolling();
            } else if (wasRunning && !nowRunning) {
                stopPolling();
                // 서브 액션을 호출하여 Next.js 서버(캐시)와 UI를 강제 새로고침
                await forceRefreshDashboard();
            }
        } catch (e) {
            console.error('Failed to fetch crawl status:', e);
        }
    }, [lastUpdated]); // Added lastUpdated to dependencies to ensure comparison is accurate

    const isCrawlingRef = useRef(false);

    const startPolling = useCallback(() => {
        if (pollingRef.current) return; // 이미 폴링 중이면 무시
        pollingRef.current = setInterval(() => {
            fetchStatus();
        }, 3000);
    }, [fetchStatus]);

    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    }, []);

    // 마운트 시 초기 상태 로드
    useEffect(() => {
        setMounted(true);
        fetchStatus();

        return () => {
            stopPolling();
        };
    }, [fetchStatus, stopPolling]);

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
                            다빵 캘린더
                        </h1>
                        <p className="text-xs text-text-sub-light dark:text-text-sub-dark font-medium uppercase tracking-wider">
                            식당빵 베이커리 소식 및 주문일정 수집 AI
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end md:flex-row md:items-center gap-4 text-sm">
                        <button
                            onClick={async () => {
                                setIsCrawling(true);
                                isCrawlingRef.current = true;
                                try {
                                    await fetch('/api/crawl', { method: 'POST' });
                                    startPolling(); // 크롤링 시작 후 3초 간격 폴링 시작
                                } catch (e) {
                                    console.error(e);
                                    setIsCrawling(false);
                                    isCrawlingRef.current = false;
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
