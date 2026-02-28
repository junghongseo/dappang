"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";

export function PublicHeader() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header className="bg-surface-light dark:bg-surface-dark border-b border-stone-200 dark:border-stone-700 sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white shadow-md">
                        <span className="material-symbols-outlined text-xl">bakery_dining</span>
                    </div>
                    <div>
                        <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-primary dark:text-amber-500">
                            다빵 캘린더
                        </h1>
                        <p className="text-[10px] sm:text-xs text-text-sub-light dark:text-text-sub-dark font-medium uppercase tracking-wider hidden sm:block">
                            식당빵 베이커리 소식 및 주문일정 수집 AI
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/login"
                        className="flex items-center gap-1.5 text-xs sm:text-sm text-text-sub-light dark:text-text-sub-dark hover:text-primary dark:hover:text-amber-500 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                        <span className="hidden sm:inline">관리자</span>
                    </Link>
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
