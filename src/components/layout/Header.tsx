"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Header() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
                        <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700">
                            <span className="material-symbols-outlined text-amber-600 text-lg">
                                api
                            </span>
                            <span className="font-medium">
                                API 사용량:{" "}
                                <span className="text-primary dark:text-amber-400 font-bold">
                                    14 / 20
                                </span>
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-text-sub-light dark:text-text-sub-dark">
                            <span className="material-symbols-outlined text-lg">
                                schedule
                            </span>
                            <span>
                                업데이트됨: <span className="font-medium">12분 전</span>
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
